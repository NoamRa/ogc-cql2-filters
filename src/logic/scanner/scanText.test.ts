import { describe, expect, test } from "vitest";
import scanText from "./scanText";
import Token from "../Token";

describe("Test scanning text", () => {
  test("empty, just EOF", () => {
    expect(scanText("")).toStrictEqual([new Token(0, "EOF", "")]);
  });

  const tests = [
    {
      name: "just characters",
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
      name: "Two character tokens - greater equal, less equal",
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
        new Token(17, "NUMBER", '4', 4),
        new Token(18, "EOF", ""),
      ],
    },
    // {
    //   name: '',
    //   input: "balance-150.0 > 0",
    //   expected: [],
    // },
    // {
    //   name: '',
    //   input: "updated >= date('1970-01-01')",
    //   expected: [],
    // },
    // {
    //   name: '',
    //   input: "geometry IS NOT NULL",
    //   expected: [],
    // },
  ];

  test.each(tests)("test $name", ({ input, expected }) => {
    expect(scanText(input)).toStrictEqual(expected);
  });
});
