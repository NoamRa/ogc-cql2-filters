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
    // {
    //   input: "avg(windSpeed)",
    //   expected: [],
    // },
    // {
    //   input: "city='Toronto'",
    //   expected: [],
    // },
    // {
    //   input: "avg(windSpeed) < 4",
    //   expected: [],
    // },
    // {
    //   input: "balance-150.0 > 0",
    //   expected: [],
    // },
    // {
    //   input: "updated >= date('1970-01-01')",
    //   expected: [],
    // },
    // {
    //   input: "geometry IS NOT NULL",
    //   expected: [],
    // },
  ];

  test.each(tests)("test $name", ({ input, expected }) => {
    expect(scanText(input)).toStrictEqual(expected);
  });
});
