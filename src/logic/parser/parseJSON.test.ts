import { describe, expect, test } from "vitest";
import parseJSON from "./parseJSON";
import ParseJSONError from "./ParseJSONError";

describe("Test parsing tokens (text)", () => {
  const tests = [
    {
      name: "Empty, just EOF",
      input: "",
      expected: {
        string: "",
        json: "",
      },
    },
    {
      name: "number",
      input: 123,
      expected: {
        string: "123",
        json: 123,
      },
    },
    {
      name: "decimal number",
      input: 123.456,
      expected: {
        string: "123.456",
        json: 123.456,
      },
    },
    {
      name: "negative number",
      input: -456,
      expected: {
        string: "-456",
        json: -456,
      },
    },
    {
      name: "string (wrapped in quotes)",
      input: "hello world",
      expected: {
        string: "hello world",
        json: "hello world",
      },
    },
    {
      name: "addition",
      input: { op: "+", args: [3, 4] },
      expected: {
        string: "3 + 4",
        json: { op: "+", args: [3, 4] },
      },
    },
    {
      name: "calendar date",
      input: { date: "1999-11-05" },
      expected: {
        string: "DATE('1999-11-05')",
        json: { date: "1999-11-05" },
      },
    },
    {
      name: "timestamp",
      input: { timestamp: "1999-01-15T13:45:23.000Z" },
      expected: {
        string: "TIMESTAMP('1999-01-15T13:45:23.000Z')",
        json: { timestamp: "1999-01-15T13:45:23.000Z" },
      },
    },
    {
      name: "arithmetic",
      input: { op: "+", args: [{ op: "*", args: [3, 1] }, 2] },
      expected: {
        string: "3 * 1 + 2",
        json: { op: "+", args: [{ op: "*", args: [3, 1] }, 2] },
      },
    },
    {
      name: "function over literals",
      input: { op: "add", args: [4, 5] },
      expected: {
        json: { op: "add", args: [4, 5] },
        string: "add(4, 5)",
      },
    },
    {
      name: "function over property",
      input: { op: "avg", args: [{ property: "windSpeed" }] },
      expected: {
        json: { op: "avg", args: [{ property: "windSpeed" }] },
        string: "avg(windSpeed)",
      },
    },
    {
      name: "comparison with property",
      input: { op: ">=", args: [{ property: "cloudCoverage" }, 50] },
      expected: {
        string: "cloudCoverage >= 50",
        json: { op: ">=", args: [{ property: "cloudCoverage" }, 50] },
      },
    },
    {
      name: "comparison with property other direction",
      input: { op: ">=", args: [50, { property: "cloudCoverage" }] },
      expected: {
        string: "50 >= cloudCoverage",
        json: { op: ">=", args: [50, { property: "cloudCoverage" }] },
      },
    },
    {
      name: "arithmetic has higher precedence than comparisons",
      input: { op: ">=", args: [{ property: "cloudCoverage" }, { op: "+", args: [10, 20] }] },
      expected: {
        string: "cloudCoverage >= 10 + 20",
        json: { op: ">=", args: [{ property: "cloudCoverage" }, { op: "+", args: [10, 20] }] },
      },
    },
    {
      name: "arithmetic has higher precedence than comparisons other direction",
      input: { op: ">=", args: [{ op: "+", args: [10, 20] }, { property: "cloudCoverage" }] },
      expected: {
        string: "10 + 20 >= cloudCoverage",
        json: { op: ">=", args: [{ op: "+", args: [10, 20] }, { property: "cloudCoverage" }] },
      },
    },
    {
      name: "equal",
      input: { op: "=", args: [3, { op: "+", args: [2, 1] }] },
      expected: {
        string: "3 = 2 + 1",
        json: { op: "=", args: [3, { op: "+", args: [2, 1] }] },
      },
    },
    {
      name: "not equal",
      input: { op: "<>", args: [4, 5] },
      expected: {
        string: "4 <> 5",
        json: { op: "<>", args: [4, 5] },
      },
    },
    {
      name: "booleans",
      input: { op: "<>", args: [true, false] },
      expected: {
        string: "TRUE <> FALSE",
        json: { op: "<>", args: [true, false] },
      },
    },
  ];

  test.each(tests)("Parse with $name", ({ input, expected }) => {
    const parsed = parseJSON(input);
    expect(parsed.toText()).toStrictEqual(expected.string);
    expect(parsed.toJSON()).toStrictEqual(expected.json);
  });

  const invalidTests = [
    {
      name: "missing op",
      input: {},
      message: `Failed to parse expression: expected op in node '{}'`,
    },
    {
      name: "missing op (nested)",
      input: { op: "+", args: [4, {}] },
      message: `Failed to parse expression: expected op in node '{}'`,
    },
    {
      name: "op is not a string",
      input: { op: 3 },
      message: `Failed to parse expression: expected op to be of type string, found type number in node '{"op":3}'`,
    },
    {
      name: "op is not a string (nested)",
      input: { op: "+", args: [4, { op: true }] },
      message: `Failed to parse expression: expected op to be of type string, found type boolean in node '{"op":true}'`,
    },
    {
      name: "missing args",
      input: { op: "+" },
      message: `Failed to parse expression: expected args in node '{"op":"+"}'`,
    },
    {
      name: "missing args (nested)",
      input: { op: "+", args: [4, { op: "-" }] },
      message: `Failed to parse expression: expected args in node '{"op":"-"}'`,
    },
    {
      name: "args is not an array",
      input: { op: 3, args: false },
      message: `Failed to parse expression: expected op to be of type string, found type number in node '{"op":3,"args":false}'`,
    },
    {
      name: "args is not an array (nested)",
      input: { op: "+", args: [5, { op: true, args: null }] },
      message: `Failed to parse expression: expected op to be of type string, found type boolean in node '{"op":true,"args":null}'`,
    },
  ];

  test.each(invalidTests)("Throws on $name", ({ input, message }) => {
    const throws = () => {
      parseJSON(input);
    };
    expect(throws).toThrowError(ParseJSONError);
    expect(throws).toThrowError(message);
  });
});
