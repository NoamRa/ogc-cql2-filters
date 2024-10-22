import { describe, expect, test } from "vitest";
import scanText from "../scanner/scanText";
import { parse } from "./parse";
import ParseError from "./parseError";

describe("Test parsing tokens", () => {
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
      input: "123",
      expected: {
        string: "123",
        json: 123,
      },
    },
    {
      name: "decimal number",
      input: "123.456",
      expected: {
        string: "123.456",
        json: 123.456,
      },
    },
    {
      name: "negative number",
      input: "-456",
      expected: {
        string: "-456",
        json: { op: "-", args: [456] },
      },
    },
    {
      name: "string (wrapped in quotes)",
      input: "'hello world'",
      expected: {
        string: "hello world",
        json: "hello world",
      },
    },
    {
      name: "addition",
      input: "3+4",
      expected: {
        string: "3 + 4",
        json: { op: "+", args: [3, 4] },
      },
    },
    {
      name: "calendar date",
      input: "DATE('1999-11-05')",
      expected: {
        string: "1999-11-05",
        json: { date: "1999-11-05" },
      },
    },
    {
      name: "timestamp",
      input: "TIMESTAMP('1999-01-15T13:45:23.000Z')",
      expected: {
        string: "1999-01-15T13:45:23.000Z",
        json: { timestamp: "1999-01-15T13:45:23.000Z" },
      },
    },
    {
      name: "grouping",
      input: "2*(3+1)",
      expected: {
        string: "2 * (3 + 1)",
        json: { op: "*", args: [2, { op: "+", args: [3, 1] }] },
      },
    },
    // {
    //   name: "identifiers",
    //   input: "avg ( windSpeed )",
    //   expected: { string: "avg(windSpeed)", json: { op: "avg", args: [{ property: "windSpeed" }] } },
    // },
  ];

  test.each(tests)("Parse with $name", ({ input, expected }) => {
    const parsed = parse(scanText(input));
    expect(parsed.toString()).toStrictEqual(expected.string);
    expect(parsed.toJSON()).toStrictEqual(expected.json);
  });

  const invalidTests = [{ name: "closing parenthesis", input: "(1 + 2", message: "Expect ')' after expression." }];

  test.each(invalidTests)("Throws on $name", ({ input, message }) => {
    const throws = () => {
      const tokens = scanText(input);
      // console.log({ tokens });
      parse(tokens);
    };
    // console.log({ t: throws() });
    expect(throws).toThrowError(ParseError);
    expect(throws).toThrowError(message);
  });
});
