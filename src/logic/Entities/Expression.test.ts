import { describe, expect, test } from "vitest";
import * as Expressions from "./Expression";
import parseText from "../parser/parseText";
import scanText from "../scanner/scanText";
import Token from "./Token";

describe("Test Expressions", () => {
  describe("Test visitor", () => {
    /**
     * This is an example of a visitor that accepts expression and returns text
     * @example expr.accept(textVisitor)
     * Callbacks on steroids, instead of a callback function, the visitor is an object with visit callbacks.
     * TypeScript checks all visitors are implemented correctly
     */
    const textVisitor: Expressions.ExpressionVisitor<string> = {
      visitBinaryExpression: (expr: Expressions.BinaryExpression) =>
        `${expr.left.accept(textVisitor)} ${expr.operator.accept(textVisitor)} ${expr.right.accept(textVisitor)}`,
      visitGroupingExpression: (expr: Expressions.GroupingExpression) => `(${expr.expression.accept(textVisitor)})`,
      visitUnaryExpression: (expr: Expressions.UnaryExpression) => expr.accept(textVisitor),
      visitFunctionExpression: (expr: Expressions.FunctionExpression) =>
        `${expr.operator.accept(textVisitor)}(${expr.args.map((arg) => arg.accept(textVisitor)).join(", ")})`,

      // "leaf" expressions
      visitLiteralExpression: (expr: Expressions.LiteralExpression) => expr.toText(),
      visitPropertyExpression: (expr: Expressions.PropertyExpression) => expr.toText(),
      visitOperatorExpression: (expr: Expressions.OperatorExpression) => expr.toText(),
      visitIsNullOperatorExpression: (expr: Expressions.IsNullOperatorExpression) => expr.toText(),
    };

    const tests: { name: string; input: string }[] = [
      {
        name: "Empty, just EOF",
        input: "",
      },
      {
        name: "number",
        input: "123",
      },
      {
        name: "decimal number",
        input: "123.456",
      },
      {
        name: "negative number",
        input: "-456",
      },
      {
        name: "string (wrapped in quotes)",
        input: "'hello world'",
      },
      {
        name: "addition",
        input: "3+4",
      },
      {
        name: "subtraction",
        input: "5-6",
      },
      {
        name: "addition of negative number",
        input: "5 + -6",
      },
      {
        name: "subtracting a property",
        input: "vehicle_height > (bridge_clearance - 1)",
      },
      {
        name: "is null",
        input: "geometry IS NULL",
      },
      {
        name: "is not null",
        input: "geometry IS NOT NULL",
      },
      {
        name: "calendar date",
        input: "DATE('1999-11-05')",
      },
      {
        name: "timestamp",
        input: "TIMESTAMP('1999-01-15T13:45:23.000Z')",
      },
      {
        name: "order of precedence",
        input: "3 * 1 + 2",
      },
      {
        name: "grouping",
        input: "2*(3+1)",
      },
      {
        name: "function over literals",
        input: "add ( 4 , 5 )",
      },
      {
        name: "arithmetic has higher precedence than comparisons other direction",
        input: "10+20 >= cloudCoverage",
      },
      {
        name: "equal",
        input: "3=(2 + 1)",
      },
      {
        name: "not equal",
        input: "4 <> 5 ",
      },
      {
        name: "booleans",
        input: "TRUE<>FALSE",
      },
      {
        name: "and",
        input: "foo AND bar",
      },
      {
        name: "or",
        input: "foo OR bar",
      },
    ];

    test.each(tests)("Visit $name", ({ input }) => {
      const expr = parseText(scanText(input));
      expect(expr.accept(textVisitor)).toBe(expr.toText());
    });
  });

  describe("Test immutability", () => {
    const tests = Object.values(Expressions).map((Expr) => ({
      name: Expr.name,
      // @ts-expect-error because instantiate without right number of arguments
      expr: new Expr(new Token(0, "NOT", "NOT")),
    }));

    test.each(tests)("$name is immutable", ({ name, expr }) => {
      expect(() => {
        expr.toText = () => "foo";
      }).toThrow("Cannot add property toText, object is not extensible");

      expect(() => {
        expr.toJSON = () => "bar";
      }).toThrow("Cannot add property toJSON, object is not extensible");

      for (const key in expr) {
        expect(() => {
          // @ts-expect-error because assigning to implicit any
          expr[key] = "baz";
        }).toThrow(`Cannot assign to read only property '${key}' of object '#<${name}>'`);
      }
    });
  });
});
