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
      input: "{}()[].,+-",
      expected: [
        new Token(0, "LEFT_BRACE", ""),
        new Token(1, "RIGHT_BRACE", ""),
        new Token(2, "LEFT_PAREN", ""),
        new Token(3, "RIGHT_PAREN", ""),
        new Token(4, "LEFT_BRACKET", ""),
        new Token(5, "RIGHT_BRACKET", ""),
        new Token(6, "DOT", ""),
        new Token(7, "COMMA", ""),
        new Token(8, "PLUS", ""),
        new Token(9, "MINUS", ""),
        new Token(10, "EOF", ""),
      ],
    },
    {
      name: "identifiers",
      input: "avg(windSpeed)",
      expected: [
        new Token(0, "IDENTIFIER", "avg", "avg"),
        new Token(3, "LEFT_PAREN", ""),
        new Token(4, "IDENTIFIER", "windSpeed", "windSpeed"),
        new Token(13, "RIGHT_PAREN", ""),
        new Token(14, "EOF", ""),
      ],
    },
    {
      name: "identifier with string",
      input: "city='Toronto'",
      expected: [
        new Token(0, "IDENTIFIER", "city", "city"),
        new Token(4, "EQUAL", ""),
        new Token(5, "STRING", "'Toronto'", "Toronto"),
        new Token(14, "EOF", ""),
      ],
    },
    // {
    //   name: '',
    //   input: "avg(windSpeed) < 4",
    //   expected: [],
    // },
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
