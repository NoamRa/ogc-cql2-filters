import { describe, expect, test } from "vitest";
import { scanText } from "../scanner/scanText";
import { ParseTextError } from "./ParseTextError";
import { parseText } from "./parseText";
import { testCases } from "./testCases.test";

describe("Test parsing tokens (text)", () => {
  test.each(testCases)("Parse with $name", ({ input, expected }) => {
    const parsed = parseText(scanText(input.text));
    expect(parsed.toText()).toStrictEqual(expected.text);
    expect(parsed.toJSON()).toStrictEqual(expected.json);
  });

  const invalidTests = [
    {
      name: "just starting parenthesis",
      input: "(",
      message: "Expect expression but found ( at character index 0.",
    },
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
