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
      if ("property" in node && typeof node.property === "string") {
        return new PropertyExpression(node.property);
      }
      if ("timestamp" in node && typeof node.timestamp === "string") {
        return new LiteralExpression({ value: new Date(node.timestamp), type: "timestamp" });
      }
      if ("date" in node && typeof node.date === "string") {
        return new LiteralExpression({ value: new Date(node.date), type: "date" });
      }

      if ("op" in node && typeof node.op === "string" && "args" in node && Array.isArray(node.args)) {
        // Special case for "IS NOT NULL"
        if (node.op === "not" && node.args.length === 1 && typeof node.args[0] === "object" && node.args[0] !== null &&
          "op" in node.args[0] && node.args[0].op === "isNull") {
          const innerArg = mapJSONtoExpression(node.args[0].args[0], [...path, "args", 0, "args", 0]);
          return new UnaryExpression(new OperatorExpression("not"), new IsNullOperatorExpression(innerArg, false));
        }

        // Special case for "IS NULL"
        if (node.op === "isNull") {
          return new IsNullOperatorExpression(mapJSONtoExpression(node.args[0], [...path, "args", 0]), false);
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
}
