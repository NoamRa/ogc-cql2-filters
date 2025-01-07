import { describe, expect, test } from "vitest";
import scanText from "../scanner/scanText";
import ParseTextError from "./ParseTextError";
import parseText from "./parseText";

describe("Test parsing tokens (text)", () => {
  const tests = [
    {
      name: "Empty, just EOF",
      input: "",
      expected: {
        text: "",
        json: "",
      },
    },
    {
      name: "number",
      input: "123",
      expected: {
        text: "123",
        json: 123,
      },
    },
    {
      name: "decimal number",
      input: "123.456",
      expected: {
        text: "123.456",
        json: 123.456,
      },
    },
    {
      name: "negative number",
      input: "-456",
      expected: {
        text: "-456",
        json: -456,
      },
    },
    {
      name: "string (wrapped in quotes)",
      input: "'hello world'",
      expected: {
        text: "'hello world'",
        json: "hello world",
      },
    },
    {
      name: "strings",
      input: "'foo' <> 'bar'",
      expected: {
        text: "'foo' <> 'bar'",
        json: { op: "<>", args: ["foo", "bar"] },
      },
    },
    {
      name: "addition",
      input: "3+4",
      expected: {
        text: "3 + 4",
        json: { op: "+", args: [3, 4] },
      },
    },
    {
      name: "subtraction",
      input: "5-6",
      expected: {
        text: "5 - 6",
        json: { op: "-", args: [5, 6] },
      },
    },
    {
      name: "addition of negative number",
      input: "5 + -6",
      expected: {
        text: "5 + -6",
        json: { op: "+", args: [5, -6] },
      },
    },
    {
      name: "subtracting a property",
      input: "vehicle_height > (bridge_clearance - 1)",
      expected: {
        text: "vehicle_height > (bridge_clearance - 1)",
        json: {
          op: ">",
          args: [
            {
              property: "vehicle_height",
            },
            {
              op: "-",
              args: [
                {
                  property: "bridge_clearance",
                },
                1,
              ],
            },
          ],
        },
      },
    },
    {
      name: "is null",
      input: "geometry IS NULL",
      expected: {
        text: "geometry IS NULL",
        json: { op: "isNull", args: [{ property: "geometry" }] },
      },
    },
    {
      name: "is not null",
      input: "geometry IS NOT NULL",
      expected: {
        text: "geometry IS NOT NULL",
        json: { op: "not", args: [{ op: "isNull", args: [{ property: "geometry" }] }] },
      },
    },
    {
      name: "calendar date",
      input: "DATE('1999-11-05')",
      expected: {
        text: "DATE('1999-11-05')",
        json: { date: "1999-11-05" },
      },
    },
    {
      name: "timestamp",
      input: "TIMESTAMP('1999-01-15T13:45:23.000Z')",
      expected: {
        text: "TIMESTAMP('1999-01-15T13:45:23.000Z')",
        json: { timestamp: "1999-01-15T13:45:23.000Z" },
      },
    },
    {
      name: "order of precedence",
      input: "3 * 1 + 2",
      expected: {
        text: "3 * 1 + 2",
        json: { op: "+", args: [{ op: "*", args: [3, 1] }, 2] },
      },
    },
    {
      name: "grouping",
      input: "2*(3+1)",
      expected: {
        text: "2 * (3 + 1)",
        json: { op: "*", args: [2, { op: "+", args: [3, 1] }] },
      },
    },
    {
      name: "function over literals",
      input: "add ( 4 , 5 )",
      expected: { text: "add(4, 5)", json: { op: "add", args: [4, 5] } },
    },
    {
      name: "function over property",
      input: "avg ( windSpeed )",
      expected: { text: "avg(windSpeed)", json: { op: "avg", args: [{ property: "windSpeed" }] } },
    },
    {
      name: "comparison with property",
      input: "cloudCoverage>=50",
      expected: { text: "cloudCoverage >= 50", json: { op: ">=", args: [{ property: "cloudCoverage" }, 50] } },
    },
    {
      name: "comparison with property other direction",
      input: "50>= cloudCoverage",
      expected: { text: "50 >= cloudCoverage", json: { op: ">=", args: [50, { property: "cloudCoverage" }] } },
    },
    {
      name: "arithmetic has higher precedence than comparisons",
      input: "cloudCoverage >= 10+20",
      expected: {
        text: "cloudCoverage >= 10 + 20",
        json: { op: ">=", args: [{ property: "cloudCoverage" }, { op: "+", args: [10, 20] }] },
      },
    },
    {
      name: "arithmetic has higher precedence than comparisons other direction",
      input: "10+20 >= cloudCoverage",
      expected: {
        text: "10 + 20 >= cloudCoverage",
        json: { op: ">=", args: [{ op: "+", args: [10, 20] }, { property: "cloudCoverage" }] },
      },
    },
    {
      name: "equal",
      input: "3=(2 + 1)",
      expected: {
        text: "3 = (2 + 1)",
        json: { op: "=", args: [3, { op: "+", args: [2, 1] }] },
      },
    },
    {
      name: "not equal",
      input: "4 <> 5 ",
      expected: {
        text: "4 <> 5",
        json: { op: "<>", args: [4, 5] },
      },
    },
    {
      name: "booleans",
      input: "TRUE<>FALSE",
      expected: {
        text: "TRUE <> FALSE",
        json: { op: "<>", args: [true, false] },
      },
    },
    {
      name: "and",
      input: "'foo' AND 'bar'",
      expected: {
        text: "'foo' AND 'bar'",
        json: { op: "and", args: ["foo", "bar"] },
      },
    },
    {
      name: "or",
      input: "'foo' OR 'bar'",
      expected: {
        text: "'foo' OR 'bar'",
        json: { op: "or", args: ["foo", "bar"] },
      },
    },
    {
      name: "precedence - or before and",
      input: "'foo' OR 'bar' AND 'baz'",
      expected: {
        text: "'foo' OR 'bar' AND 'baz'",
        json: { op: "or", args: ["foo", { op: "and", args: ["bar", "baz"] }] },
      },
    },
    {
      name: "precedence - and before or",
      input: "'foo' AND 'bar' OR 'baz'",
      expected: {
        text: "'foo' AND 'bar' OR 'baz'",
        json: { op: "or", args: [{ op: "and", args: ["foo", "bar"] }, "baz"] },
      },
    },
  ];

  test.each(tests)("Parse with $name", ({ input, expected }) => {
    const parsed = parseText(scanText(input));
    expect(parsed.toText()).toStrictEqual(expected.text);
    expect(parsed.toJSON()).toStrictEqual(expected.json);
  });

  const invalidTests = [
    {
      name: "missing closing parenthesis",
      input: "(1 + 2",
      message: "Expect ')' after expression at character index 6.",
    },
    {
      name: "missing function arguments closing parenthesis",
      input: "add(1 + 2",
      message: "Expect ')' after arguments at character index 9.",
    },
    { name: "two operator", input: "1 + * 2", message: "Expect expression but found * at character index 4." },
    {
      name: "is without null",
      input: "test IS fun",
      message: "Expect 'NULL' after 'IS' at character index 8.",
    },
    {
      name: "is not without null",
      input: "test IS NOT fun",
      message: "Expect 'NULL' after 'IS NOT' at character index 12.",
    },
  ];

  test.each(invalidTests)("Throws on $name", ({ input, message }) => {
    const throws = () => {
      const tokens = scanText(input);
      parseText(tokens);
    };
    expect(throws).toThrowError(ParseTextError);
    expect(throws).toThrowError(message);
  });
});
