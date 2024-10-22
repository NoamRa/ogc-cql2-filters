import { describe, expect, test } from "vitest";
import { BinaryExpression, LiteralExpression, UnaryExpression, VariableExpression } from "../Entities/Expression";
import Token from "../Entities/Token";
import scanText from "../scanner/scanText";
import { parse } from "./parse";
// import ParseError from "./parseError";

describe("Test parsing tokens", () => {
  const tests = [
    {
      name: "Empty, just EOF",
      input: "",
      expected: { expr: new LiteralExpression(""), string: "", json: "" },
    },
    {
      name: "number",
      input: "123",
      expected: { expr: new LiteralExpression(123), string: "123", json: 123 },
    },
    {
      name: "decimal number",
      input: "123.456",
      expected: { expr: new LiteralExpression(123.456), string: "123.456", json: 123.456 },
    },
    {
      name: "negative number",
      input: "-456",
      expected: {
        expr: new UnaryExpression(new Token(0, "MINUS", "-"), new LiteralExpression(456)),
        string: "-456",
        json: { op: "-", args: [456] },
      },
    },
    {
      name: "string (wrapped in quotes)",
      input: "'hello world'",
      expected: { expr: new LiteralExpression("hello world"), string: "hello world", json: "hello world" },
    },
    {
      name: "addition",
      input: "3+4",
      expected: {
        expr: new BinaryExpression(new LiteralExpression(3), new Token(1, "PLUS", "+"), new LiteralExpression(4)),
        string: "3 + 4",
        json: { op: "+", args: [3, 4] },
      },
    },
    {
      name: "calendar date",
      input: "DATE('1999-11-05')",
      expected: {
        expr: new LiteralExpression(new Date("1999-11-05"), "date"),
        string: "1999-11-05",
        json: { date: "1999-11-05" },
      },
    },
    {
      name: "timestamp",
      input: "TIMESTAMP('1999-01-15T13:45:23.000Z')",
      expected: {
        expr: new LiteralExpression(new Date("1999-01-15T13:45:23.000Z"), "timestamp"),
        string: "1999-01-15T13:45:23.000Z",
        json: { timestamp: "1999-01-15T13:45:23.000Z" },
      },
    },
    {
      name: "identifiers",
      input: "avg(windSpeed)",
      expected: { expr: new VariableExpression(new Token(0, "IDENTIFIER", "avg")), string: "avg", json: {} },
    },
    // {
    //   name: "string",
    //   input: "hello world",
    //   expected: { expr: new LiteralExpression("hello world"), string: "hello world", json: {} },
    // },
  ];

  test.each(tests)("Parse with $name", ({ input, expected }) => {
    const parsed = parse(scanText(input));
    expect(parsed).toStrictEqual(expected.expr);
    expect(parsed.toString()).toStrictEqual(expected.string);
    expect(parsed.toJSON()).toStrictEqual(expected.json);
  });

  // const invalidTests = [
  //   // { name: "foo", input: "foo", message: "Expect expressionsssss." },
  // ];

  // test.each(invalidTests)("Throws on $name", ({ input, message }) => {
  //   const throws = () => {
  //     const tokens = scanText(input);
  //     // console.log({ tokens });
  //     parse(tokens);
  //   };
  //   // console.log({ t: throws() });
  //   expect(throws).toThrowError(ParseError);
  //   expect(throws).toThrowError(message);
  // });
});
