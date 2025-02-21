import { describe, expect, test } from "vitest";
import { parseJSON } from "./parseJSON";
import { ParseJSONError } from "./ParseJSONError";

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
      input: 123,
      expected: {
        text: "123",
        json: 123,
      },
    },
    {
      name: "decimal number",
      input: 123.456,
      expected: {
        text: "123.456",
        json: 123.456,
      },
    },
    {
      name: "negative number",
      input: -456,
      expected: {
        text: "-456",
        json: -456,
      },
    },
    {
      name: "string (not wrapped in quotes)",
      input: "hello world",
      expected: {
        text: "'hello world'",
        json: "hello world",
      },
    },
    {
      name: "addition",
      input: { op: "+", args: [3, 4] },
      expected: {
        text: "3 + 4",
        json: { op: "+", args: [3, 4] },
      },
    },
    {
      name: "calendar date",
      input: { date: "1999-11-05" },
      expected: {
        text: "DATE('1999-11-05')",
        json: { date: "1999-11-05" },
      },
    },
    {
      name: "timestamp",
      input: { timestamp: "1999-01-15T13:45:23.000Z" },
      expected: {
        text: "TIMESTAMP('1999-01-15T13:45:23.000Z')",
        json: { timestamp: "1999-01-15T13:45:23.000Z" },
      },
    },
    {
      name: "arithmetic",
      input: { op: "+", args: [{ op: "*", args: [3, 1] }, 2] },
      expected: {
        text: "3 * 1 + 2",
        json: { op: "+", args: [{ op: "*", args: [3, 1] }, 2] },
      },
    },
    {
      name: "function over literals",
      input: { op: "add", args: [4, 5] },
      expected: {
        json: { op: "add", args: [4, 5] },
        text: "add(4, 5)",
      },
    },
    {
      name: "function over property",
      input: { op: "avg", args: [{ property: "windSpeed" }] },
      expected: {
        json: { op: "avg", args: [{ property: "windSpeed" }] },
        text: "avg(windSpeed)",
      },
    },
    {
      name: "comparison with property",
      input: { op: ">=", args: [{ property: "cloudCoverage" }, 50] },
      expected: {
        text: "cloudCoverage >= 50",
        json: { op: ">=", args: [{ property: "cloudCoverage" }, 50] },
      },
    },
    {
      name: "comparison with property other direction",
      input: { op: ">=", args: [50, { property: "cloudCoverage" }] },
      expected: {
        text: "50 >= cloudCoverage",
        json: { op: ">=", args: [50, { property: "cloudCoverage" }] },
      },
    },
    {
      name: "arithmetic has higher precedence than comparisons",
      input: { op: ">=", args: [{ property: "cloudCoverage" }, { op: "+", args: [10, 20] }] },
      expected: {
        text: "cloudCoverage >= 10 + 20",
        json: { op: ">=", args: [{ property: "cloudCoverage" }, { op: "+", args: [10, 20] }] },
      },
    },
    {
      name: "arithmetic has higher precedence than comparisons other direction",
      input: { op: ">=", args: [{ op: "+", args: [10, 20] }, { property: "cloudCoverage" }] },
      expected: {
        text: "10 + 20 >= cloudCoverage",
        json: { op: ">=", args: [{ op: "+", args: [10, 20] }, { property: "cloudCoverage" }] },
      },
    },
    {
      name: "equal",
      input: { op: "=", args: [3, { op: "+", args: [2, 1] }] },
      expected: {
        text: "3 = 2 + 1",
        json: { op: "=", args: [3, { op: "+", args: [2, 1] }] },
      },
    },
    {
      name: "not equal",
      input: { op: "<>", args: [4, 5] },
      expected: {
        text: "4 <> 5",
        json: { op: "<>", args: [4, 5] },
      },
    },
    {
      name: "booleans",
      input: { op: "<>", args: [true, false] },
      expected: {
        text: "TRUE <> FALSE",
        json: { op: "<>", args: [true, false] },
      },
    },
    {
      name: "just null",
      input: null,
      expected: {
        text: "NULL",
        json: null,
      },
    },
    {
      name: "is null",
      input: { op: "isNull", args: [{ property: "geometry" }] },
      expected: {
        text: "geometry IS NULL",
        json: { op: "isNull", args: [{ property: "geometry" }] },
      },
    },
    {
      name: "is not null",
      input: { op: "not", args: [{ op: "isNull", args: [{ property: "geometry" }] }] },
      expected: {
        text: "geometry IS NOT NULL",
        json: { op: "not", args: [{ op: "isNull", args: [{ property: "geometry" }] }] },
      },
    },
    {
      name: "and",
      input: { op: "and", args: [{ property: "foo" }, { property: "bar" }] },
      expected: {
        text: "foo AND bar",
        json: { op: "and", args: [{ property: "foo" }, { property: "bar" }] },
      },
    },
    {
      name: "or",
      input: { op: "or", args: [{ property: "foo" }, { property: "bar" }] },
      expected: {
        text: "foo OR bar",
        json: { op: "or", args: [{ property: "foo" }, { property: "bar" }] },
      },
    },
    {
      name: "precedence - or before and",
      input: { op: "or", args: ["foo", { op: "and", args: ["bar", "baz"] }] },
      expected: {
        text: "'foo' OR 'bar' AND 'baz'",
        json: { op: "or", args: ["foo", { op: "and", args: ["bar", "baz"] }] },
      },
    },
    {
      name: "precedence - and before or",
      input: { op: "or", args: [{ op: "and", args: ["foo", "bar"] }, "baz"] },
      expected: {
        text: "'foo' AND 'bar' OR 'baz'",
        json: { op: "or", args: [{ op: "and", args: ["foo", "bar"] }, "baz"] },
      },
    },
    {
      name: "negation",
      input: { op: "not", args: ["a"] },
      expected: {
        text: "NOT 'a'",
        json: { op: "not", args: ["a"] },
      },
    },
    {
      name: "complex negation",
      input: { op: "and", args: ["a", { op: "not", args: ["b"] }] },
      expected: {
        text: "'a' AND NOT 'b'",
        json: { op: "and", args: ["a", { op: "not", args: ["b"] }] },
      },
    },
    {
      name: "like",
      input: {
        op: "like",
        args: [{ property: "name" }, "Harrison%"],
      },
      expected: {
        text: "name LIKE 'Harrison%'",
        json: {
          op: "like",
          args: [{ property: "name" }, "Harrison%"],
        },
      },
    },
    {
      name: "not like",
      input: {
        op: "not",
        args: [
          {
            op: "like",
            args: [{ property: "name" }, "McCartney%"],
          },
        ],
      },
      expected: {
        text: "name NOT LIKE 'McCartney%'",
        json: {
          op: "not",
          args: [
            {
              op: "like",
              args: [{ property: "name" }, "McCartney%"],
            },
          ],
        },
      },
    },
    {
      name: "between",
      input: {
        op: "between",
        args: [{ property: "depth" }, 123, 456.7],
      },
      expected: {
        text: "depth BETWEEN 123 AND 456.7",
        json: {
          op: "between",
          args: [{ property: "depth" }, 123, 456.7],
        },
      },
    },
    {
      name: "complex between",
      input: {
        op: "between",
        args: [
          { op: "-", args: [{ property: "depth" }, 1] },
          { op: "+", args: [2, 3] },
          { op: "*", args: [4, 5] },
        ],
      },
      expected: {
        text: "depth - 1 BETWEEN 2 + 3 AND 4 * 5",
        json: {
          op: "between",
          args: [
            { op: "-", args: [{ property: "depth" }, 1] },
            { op: "+", args: [2, 3] },
            { op: "*", args: [4, 5] },
          ],
        },
      },
    },
    {
      name: "in",
      input: {
        op: "in",
        args: [{ property: "cityName" }, ["Toronto", "Frankfurt", "Tokyo", "New York"]],
      },
      expected: {
        text: "cityName IN ('Toronto', 'Frankfurt', 'Tokyo', 'New York')",
        json: {
          op: "in",
          args: [{ property: "cityName" }, ["Toronto", "Frankfurt", "Tokyo", "New York"]],
        },
      },
    },
    {
      name: "not in",
      input: {
        op: "not",
        args: [
          {
            op: "in",
            args: [{ property: "category" }, [1, 2, 3, 4]],
          },
        ],
      },
      expected: {
        text: "category NOT IN (1, 2, 3, 4)",
        json: {
          op: "not",
          args: [
            {
              op: "in",
              args: [{ property: "category" }, [1, 2, 3, 4]],
            },
          ],
        },
      },
    },

    // insensitive comparison
    {
      name: "case-insensitive comparison",
      input: {
        op: "in",
        args: [
          {
            op: "casei",
            args: [{ property: "road_class" }],
          },
          [
            { op: "casei", args: ["Οδος"] },
            { op: "casei", args: ["Straße"] },
          ],
        ],
      },
      expected: {
        text: "CASEI(road_class) IN (CASEI('Οδος'), CASEI('Straße'))",
        json: {
          op: "in",
          args: [
            {
              op: "casei",
              args: [{ property: "road_class" }],
            },
            [
              { op: "casei", args: ["Οδος"] },
              { op: "casei", args: ["Straße"] },
            ],
          ],
        },
      },
    },
    {
      name: "accent-insensitive comparison",
      input: {
        op: "=",
        args: [
          {
            op: "accenti",
            args: [{ property: "etat_vol" }],
          },
          {
            op: "accenti",
            args: ["débárquér"],
          },
        ],
      },
      expected: {
        text: "ACCENTI(etat_vol) = ACCENTI('débárquér')",
        json: {
          op: "=",
          args: [
            {
              op: "accenti",
              args: [{ property: "etat_vol" }],
            },
            {
              op: "accenti",
              args: ["débárquér"],
            },
          ],
        },
      },
    },
  ];

  test.each(tests)("Parse with $name", ({ input, expected }) => {
    const parsed = parseJSON(input);
    expect(parsed.toText()).toStrictEqual(expected.text);
    expect(parsed.toJSON()).toStrictEqual(expected.json);
  });

  const invalidTests = [
    {
      name: "undefined",
      input: undefined,
      message: "Failed to parse: node's value is 'undefined'",
    },
    {
      name: "undefined (nested)",
      input: { op: "a", args: [undefined] },
      message: "Failed to parse: node's value is 'undefined'",
    },
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
      input: { op: "-", args: true },
      message: `Failed to parse expression: expected args to be an array, in node '{"op":"-","args":true}'`,
    },
    {
      name: "op is not a string (nested)",
      input: { op: "*", args: [5, { op: "%", args: 123 }] },
      message: `Failed to parse expression: expected args to be an array, in node '{"op":"%","args":123}'`,
    },
    {
      name: "missing args in unary",
      input: { op: "not", args: [] },
      message: `Failed to parse expression: expected one arg in node '{"op":"not","args":[]}'`,
    },
    {
      name: "missing args in binary",
      input: { op: "*", args: [3] },
      message: `Failed to parse expression: expected two args in node '{"op":"*","args":[3]}'`,
    },
    {
      name: "incorrect args in 'like'",
      input: { op: "like", args: ["fail like"] },
      message: `Failed to parse expression: expected 'like' to have three args '{"op":"like","args":["fail like"]}'`,
    },
    {
      name: "incorrect args in 'between'",
      input: { op: "between", args: ["fail between"] },
      message: `Failed to parse expression: expected 'between' to have three args '{"op":"between","args":["fail between"]}'`,
    },
    {
      name: "incorrect args in 'in'",
      input: { op: "in", args: ["fail in"] },
      message: `Failed to parse expression: expected 'in' to have three args '{"op":"in","args":["fail in"]}'`,
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
