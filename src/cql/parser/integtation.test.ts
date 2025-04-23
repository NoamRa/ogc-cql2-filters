import { describe, expect, test } from "vitest";
import * as Expressions from "../entities/Expression";
import { parseJSON } from "./parseJSON";
import { parseText } from "./parseText";
import { testCases } from "./testCases.test";
import { scanText } from "../scanner/scanText";

describe("Parse integration tests", () => {
  /**
   * Expression trees match test is designed to check text parser and JSON parser create the same entity tree.
   *
   * It can also be an example as to how to map expression tree using visitor.
   */
  describe("Expression trees match", () => {
    const ExpressionClassNameVisitor: Expressions.ExpressionVisitor<object | string> = {
      visitBinaryExpression(expr: Expressions.BinaryExpression) {
        return {
          [expr.constructor.name]: {
            left: expr.left.accept(this),
            op: expr.operator.accept(this),
            right: expr.right.accept(this),
          },
        };
      },
      visitUnaryExpression(expr: Expressions.UnaryExpression) {
        return {
          [expr.constructor.name]: {
            op: expr.operator.accept(this),
            right: expr.right.accept(this),
          },
        };
      },
      visitGroupingExpression(expr: Expressions.GroupingExpression) {
        return {
          [expr.constructor.name]: expr.expression.accept(this),
        };
      },
      visitArrayExpression(expr: Expressions.ArrayExpression) {
        return {
          [expr.constructor.name]: expr.expressions.map((e) => e.accept(this)),
        };
      },
      visitFunctionExpression(expr: Expressions.FunctionExpression) {
        return {
          [expr.constructor.name]: {
            op: expr.operator.accept(this),
            args: expr.args.map((e) => e.accept(this)),
          },
        };
      },
      visitAdvancedComparisonExpression(expr: Expressions.AdvancedComparisonExpression) {
        return {
          [expr.constructor.name]: {
            op: expr.operator.accept(this),
            args: expr.args.map((e) => e.accept(this)),
          },
        };
      },
      visitGeometryCollectionExpression(expr: Expressions.GeometryCollectionExpression) {
        return {
          [expr.constructor.name]: expr.geometries.map((e) => e.accept(this)),
        };
      },

      // "Leaf" nodes return a string
      visitLiteralExpression(expr: Expressions.LiteralExpression) {
        return `${expr.constructor.name} (${expr.literalPair.type})`;
      },
      visitIntervalExpression(expr: Expressions.IntervalExpression) {
        return expr.constructor.name;
      },
      visitBBoxExpression(expr: Expressions.BBoxExpression) {
        return expr.constructor.name;
      },
      visitGeometryExpression(expr: Expressions.GeometryExpression) {
        return `${expr.constructor.name} (${expr.type})`;
      },
      visitPropertyExpression(expr: Expressions.PropertyExpression) {
        return expr.constructor.name;
      },
      visitOperatorExpression(expr: Expressions.OperatorExpression) {
        return expr.constructor.name;
      },
      visitIsNullOperatorExpression(expr: Expressions.IsNullOperatorExpression) {
        return expr.constructor.name;
      },
    };

    test.each(testCases)("Entities match on $name", ({ expected }) => {
      const text = parseText(scanText(expected.textForJson ?? expected.text));
      const textExpressionTree = text.accept(ExpressionClassNameVisitor);

      const json = parseJSON(expected.json);
      const jsonExpressionTree = json.accept(ExpressionClassNameVisitor);

      expect(textExpressionTree).toStrictEqual(jsonExpressionTree);
    });
  });
});
