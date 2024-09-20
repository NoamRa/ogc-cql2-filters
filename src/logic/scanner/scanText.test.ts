import { describe, expect, test } from "vitest";
import scanText from "./scanText";
import Token from "../Token";
import ScanError from "./scanError";

describe("Test scanning text", () => {
  test("empty, just EOF", () => {
    expect(scanText("")).toStrictEqual([new Token(0, "EOF", "")]);
  });

  const tests = [
    {
      name: "just single token characters",
      input: "{} () [] .,+-*",
      expected: [
        new Token(0, "LEFT_BRACE", "{"),
        new Token(1, "RIGHT_BRACE", "}"),
        new Token(3, "LEFT_PAREN", "("),
        new Token(4, "RIGHT_PAREN", ")"),
        new Token(6, "LEFT_BRACKET", "["),
        new Token(7, "RIGHT_BRACKET", "]"),
        new Token(9, "DOT", "."),
        new Token(10, "COMMA", ","),
        new Token(11, "PLUS", "+"),
        new Token(12, "MINUS", "-"),
        new Token(13, "STAR", "*"),
        new Token(14, "EOF", ""),
      ],
    },
    {
      name: "identifiers",
      input: "avg(windSpeed)",
      expected: [
        new Token(0, "IDENTIFIER", "avg", "avg"),
        new Token(3, "LEFT_PAREN", "("),
        new Token(4, "IDENTIFIER", "windSpeed", "windSpeed"),
        new Token(13, "RIGHT_PAREN", ")"),
        new Token(14, "EOF", ""),
      ],
    },
    {
      name: "string identifier",
      input: "city='Toronto'",
      expected: [
        new Token(0, "IDENTIFIER", "city", "city"),
        new Token(4, "EQUAL", "="),
        new Token(5, "STRING", "'Toronto'", "Toronto"),
        new Token(14, "EOF", ""),
      ],
    },
    {
      name: "two character tokens - joins greater equal, less equal",
      input: "<=<>==<=> < = > ",
      expected: [
        new Token(0, "LESS_EQUAL", "<="),
        new Token(2, "LESS", "<"),
        new Token(3, "GREATER_EQUAL", ">="),
        new Token(5, "EQUAL", "="),
        new Token(6, "LESS_EQUAL", "<="),
        new Token(8, "GREATER", ">"),
        new Token(10, "LESS", "<"),
        new Token(12, "EQUAL", "="),
        new Token(14, "GREATER", ">"),
        new Token(16, "EOF", ""),
      ],
    },
    {
      name: "number",
      input: "avg(windSpeed) < 4",
      expected: [
        new Token(0, "IDENTIFIER", "avg"),
        new Token(3, "LEFT_PAREN", "("),
        new Token(4, "IDENTIFIER", "windSpeed", "windSpeed"),
        new Token(13, "RIGHT_PAREN", ")"),
        new Token(15, "LESS", "<"),
        new Token(17, "NUMBER", "4", 4),
        new Token(18, "EOF", ""),
      ],
    },
    {
      name: "decimal number",
      input: "4.56 = avg(windSpeed)",
      expected: [
        new Token(0, "NUMBER", "4.56", 4.56),
        new Token(5, "EQUAL", "="),
        new Token(7, "IDENTIFIER", "avg"),
        new Token(10, "LEFT_PAREN", "("),
        new Token(11, "IDENTIFIER", "windSpeed", "windSpeed"),
        new Token(20, "RIGHT_PAREN", ")"),
        new Token(21, "EOF", ""),
      ],
    },
    {
      name: "minus and subtraction",
      input: "balance -150.0 > -3.4",
      expected: [
        new Token(0, "IDENTIFIER", "balance"),
        new Token(8, "MINUS", "-"),
        new Token(9, "NUMBER", "150.0", 150),
        new Token(15, "GREATER", ">"),
        new Token(17, "MINUS", "-"),
        new Token(18, "NUMBER", "3.4", 3.4),
        new Token(21, "EOF", ""),
      ],
    },
    // {
    //   name: 'date',
    //   input: "updated >= date('1970-01-01')",
    //   expected: [],
    // },
    // {
    //   name: 'is, not, null',
    //   input: "geometry IS NOT NULL",
    //   expected: [],
    // },
  ];

  test.each(tests)("Expression with $name", ({ input, expected }) => {
    expect(scanText(input)).toStrictEqual(expected);
  });

  test("Throws on unterminated string", () => {
    const throws = () => scanText("city='Toronto")
    expect(throws).toThrowError(ScanError);
    expect(throws).toThrowError('Unterminated string');
  });
});
