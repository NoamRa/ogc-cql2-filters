import {
  BinaryExpression,
  Expression,
  FunctionExpression,
  IsNullOperatorExpression,
  LiteralExpression,
  OperatorExpression,
  PropertyExpression,
  UnaryExpression,
} from "../Entities/Expression";
import { Arity } from "../operatorMetadata";
import { JSONPath } from "../types";
import ParseJSONError from "./ParseJSONError";

export default function parseJSON(json: unknown): Expression {
  return mapJSONtoExpression(json);

  /**
   * Map input JSON to Expression
   * Recursive, using depth first traverse
   * @param node
   * @param {{string | number}[]} path
   * @returns {Expression}
   */
  function mapJSONtoExpression(node: unknown, path: JSONPath = []): Expression {
    if (node === null) return new LiteralExpression({ value: node, type: "null" });
    if (typeof node === "boolean") return new LiteralExpression({ value: node, type: "boolean" });
    if (typeof node === "number") return new LiteralExpression({ value: node, type: "number" });
    if (typeof node === "string") return new LiteralExpression({ value: node, type: "string" });

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
          return new IsNullOperatorExpression(mapJSONtoExpression(node.args[0], [...path, "args", 0]), false);
        }

        // Special case for "IS NOT NULL"
        if (nodeOpIsNot(node)) {
          const isNullNode = node.args.at(0);
          if (!nodeHasOpAndArgs(isNullNode)) {
            throw new ParseJSONError(
              [...path, "args", 0],
              `Expected 'isNull' operator to be a child of 'not' operator, found '${JSON.stringify(isNullNode)}'`,
            );
          }

          const nodeThatIsNulled = isNullNode.args.at(0);
          if (!nodeThatIsNulled) {
            throw new ParseJSONError(
              [...path, "args", 0, "args", 0],
              `Expected 'isNull' operator to have a child, found '${JSON.stringify(nodeThatIsNulled)}'`,
            );
          }

          const argExprArr = mapJSONtoExpression(nodeThatIsNulled, [...path, "args", 0, "args", 0]);
          return new IsNullOperatorExpression(argExprArr, true);
        }

        const opExpr = new OperatorExpression(node.op);
        const argsExprArr = node.args.map((arg, index) => mapJSONtoExpression(arg, [...path, "args", index]));

        if (opExpr.arity === Arity.Unary) {
          return new UnaryExpression(opExpr, argsExprArr[0]);
        }
        if (opExpr.arity === Arity.Binary) {
          const [left, right] = argsExprArr;
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
  // #endregion
}
