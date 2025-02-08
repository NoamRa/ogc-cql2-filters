import {
  AdvancedComparisonExpression,
  ArrayExpression,
  BinaryExpression,
  Expression,
  FunctionExpression,
  IsNullOperatorExpression,
  LiteralExpression,
  OperatorExpression,
  PropertyExpression,
  UnaryExpression,
} from "../Entities/Expression";
import { Arity, operatorMetadata } from "../Entities/operatorMetadata";
import Token from "../Entities/Token";
import { OperatorTokenType } from "../Entities/TokenType";
import { JSONPath } from "../types";
import ParseJSONError from "./ParseJSONError";

export default function parseJSON(input: unknown): Expression {
  return mapJSONtoExpression(input, []);

  /**
   * Map input JSON to Expression
   * Recursive, using depth first traverse because we want to parse leaf expressions
   * (operators, literals, properties, etc.) before composing expressions
   * @param node
   * @param {{string | number}[]} path
   * @returns {Expression}
   */
  function mapJSONtoExpression(node: unknown, path: JSONPath): Expression {
    if (node === null) return new LiteralExpression({ value: node, type: "null" });
    if (typeof node === "boolean") return new LiteralExpression({ value: node, type: "boolean" });
    if (typeof node === "number") return new LiteralExpression({ value: node, type: "number" });
    if (typeof node === "string") return new LiteralExpression({ value: node, type: "string" });
    if (Array.isArray(node)) {
      return new ArrayExpression(node.map((item, index) => mapJSONtoExpression(item, [...path, index])));
    }

    if (typeof node === "object") {
      if (nodeIsProperty(node)) {
        return new PropertyExpression(node.property);
      }
      if (nodeIsTimestamp(node)) {
        return new LiteralExpression({ value: new Date(node.timestamp), type: "timestamp" });
      }
      if (nodeIsDate(node)) {
        return new LiteralExpression({ value: new Date(node.date), type: "date" });
      }

      if (nodeHasOpAndArgs(node)) {
        // Special case for "IS NULL"
        if (nodeOpIsIsNull(node)) {
          return new IsNullOperatorExpression(mapJSONtoExpression(node.args[0], [...path, "args", 0]));
        }

        // Special case for "IS NOT NULL"
        if (
          nodeOpIsNot(node) &&
          nodeHasOpAndArgs(node) &&
          nodeHasOpAndArgs(node.args[0]) &&
          nodeOpIsIsNull(node.args[0])
        ) {
          const argExprArr = mapJSONtoExpression(node.args[0].args[0], [...path, "args", 0, "args", 0]);
          return new IsNullOperatorExpression(argExprArr, true);
        }

        // Advanced comparison
        if (nodeOpIsNot(node) && nodeHasOpAndArgs(node.args[0]) && isAdvancedComparisonOp(node.args[0].op)) {
          return advancedComparison(node.args[0], [...path, "args", 0], true);
        }

        if (nodeHasOpAndArgs(node) && isAdvancedComparisonOp(node.op)) {
          return advancedComparison(node, path);
        }

        const opExpr = createOperatorExpression(node.op);
        const argsExprArr = node.args.map((arg, index) => mapJSONtoExpression(arg, [...path, "args", index]));

        if (opExpr.arity === Arity.Unary) {
          const right = argsExprArr.at(0);
          if (!right) {
            throw new ParseJSONError(
              path,
              `Failed to parse expression: expected one arg in node '${JSON.stringify(node)}'`,
            );
          }
          return new UnaryExpression(opExpr, right);
        }
        if (opExpr.arity === Arity.Binary) {
          const left = argsExprArr.at(0);
          const right = argsExprArr.at(1);
          if (!right || !left) {
            throw new ParseJSONError(
              path,
              `Failed to parse expression: expected two args in node '${JSON.stringify(node)}'`,
            );
          }
          return new BinaryExpression(left, opExpr, right);
        }

        return new FunctionExpression(opExpr, argsExprArr);
        // TODO there are more cases to cover here
      }

      // #region op / args errors
      if (!("op" in node)) {
        throw new ParseJSONError(path, `Failed to parse expression: expected op in node '${JSON.stringify(node)}'`);
      }
      if ("op" in node && typeof node.op !== "string") {
        throw new ParseJSONError(
          path,
          `Failed to parse expression: expected op to be of type string, found type ${typeof node.op} in node '${JSON.stringify(node)}'`,
        );
      }
      if (!("args" in node)) {
        throw new ParseJSONError(path, `Failed to parse expression: expected args in node '${JSON.stringify(node)}'`);
      }
      if ("args" in node && !Array.isArray(node.args)) {
        throw new ParseJSONError(
          path,
          `Failed to parse expression: expected args to be an array, in node '${JSON.stringify(node)}'`,
        );
      }
      // #endregion
    }
    if (node === undefined) {
      throw new ParseJSONError(path, "Failed to parse: node's value is 'undefined'");
    }

    // Should never happen
    throw new ParseJSONError(path, "Failed to parse");
  }

  // #region helper functions
  function nodeHasOpAndArgs(node: unknown): node is { op: string; args: unknown[] } {
    return typeof node === "object" && node !== null && "op" in node && "args" in node && Array.isArray(node.args);
  }

  function nodeIsProperty(node: object): node is { property: string } {
    return "property" in node && typeof node.property === "string";
  }

  function nodeIsTimestamp(node: object): node is { timestamp: string } {
    return "timestamp" in node && typeof node.timestamp === "string";
  }

  function nodeIsDate(node: object): node is { date: string } {
    return "date" in node && typeof node.date === "string";
  }

  function nodeOpIsIsNull(node: object): node is { op: "isNull" } {
    return "op" in node && node.op === "isNull";
  }

  function nodeOpIsNot(node: object): node is { op: "not" } {
    return "op" in node && node.op === "not";
  }

  function getTokenType(operator: string): OperatorTokenType {
    for (const [operatorTokenType, operatorMeta] of operatorMetadata) {
      if (operatorMeta.json === operator || operatorMeta.text === operator) return operatorTokenType;
    }
    return operator as OperatorTokenType;
  }

  function createOperatorExpression(op: string): OperatorExpression {
    const opType = getTokenType(op);
    return new OperatorExpression(new Token(0, opType, opType)); // yes, a fake token 🫥
  }

  function isAdvancedComparisonOp(opType: string): boolean {
    return new Set(["like", "between", "in"]).has(opType);
  }

  function advancedComparison(
    node: { op: string; args: unknown[] },
    path: JSONPath,
    negate = false,
  ): AdvancedComparisonExpression {
    const opExpr = createOperatorExpression(node.op);
    const argsExprArr = node.args.map((arg, index) => mapJSONtoExpression(arg, [...path, "args", index]));

    switch (node.op) {
      case "like": {
        if (argsExprArr.length !== 2) {
          throw new ParseJSONError(
            path,
            `Failed to parse expression: expected 'like' to have three args '${JSON.stringify(node)}'`,
          );
        }
        return new AdvancedComparisonExpression(opExpr, argsExprArr, negate);
      }
      case "between": {
        if (argsExprArr.length !== 3) {
          throw new ParseJSONError(
            path,
            `Failed to parse expression: expected 'between' to have three args '${JSON.stringify(node)}'`,
          );
        }
        return new AdvancedComparisonExpression(opExpr, argsExprArr, negate);
      }
      case "in": {
        if (argsExprArr.length !== 2) {
          throw new ParseJSONError(
            path,
            `Failed to parse expression: expected 'in' to have three args '${JSON.stringify(node)}'`,
          );
        }
        return new AdvancedComparisonExpression(opExpr, argsExprArr, negate);
      }

      // should never happen
      default: {
        throw new ParseJSONError(
          path,
          "Failed to parse: expected node operator to be an advanced comparison: LIKE, BETWEEN, IN",
        );
      }
    }
  }
  // #endregion
}
