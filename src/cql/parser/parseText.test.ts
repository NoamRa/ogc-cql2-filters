import { describe, expect, test } from "vitest";
import { scanText } from "../scanner/scanText";
import { ParseTextError } from "./ParseTextError";
import { parseText } from "./parseText";
import { testCases } from "./testCases.test";

describe("Test parsing tokens (text)", () => {
  describe("Valid inputs", () => {
    test.each(testCases)("Parse with $name", ({ input, expected }) => {
      const parsed = parseText(scanText(input.text));
      expect(parsed.toText()).toStrictEqual(expected.text);
      expect(parsed.toJSON()).toStrictEqual(expected.json);
    });
  });

  describe("Invalid", () => {
    const invalidTests = [
      {
        name: "just starting parenthesis",
        input: "(",
        message: "Expected expression but found ( at character index 0.",
      },
      {
        name: "missing closing parenthesis",
        input: "(1 + 2",
        message: "Expected ')' after expression at character index 6.",
      },
      {
        name: "missing function arguments closing parenthesis",
        input: "add(1 + 2",
        message: "Expected ')' after arguments at character index 9.",
      },
      { name: "two operator", input: "1 + * 2", message: "Expected expression but found * at character index 4." },
      {
        name: "is without null",
        input: "test IS fun",
        message: "Expected 'NULL' after 'IS' at character index 8.",
      },
      {
        name: "is not without null",
        input: "test IS NOT fun",
        message: "Expected 'NULL' after 'IS NOT' at character index 12.",
      },
      // Spatial
      {
        name: "point - no ( after POINT",
        input: "POINT",
        message: "Expected '(' after POINT at character index 5",
      },
      {
        name: "point - no coordinates in point",
        input: "POINT()",
        message: "Expected coordinate to have two or three positions, but found 0.",
      },
      {
        name: "point - incorrect number of coordinates",
        input: "POINT(456)",
        message: "Expected coordinate to have two or three positions, but found 1.",
      },
      {
        name: "point - has , in point ",
        input: "POINT(123, 4.56)",
        message: "Expected coordinate to have two or three positions, but found 1.",
      },
      {
        name: "point - no ) after point",
        input: "POINT(456 789",
        message: "Expected expression but found 789 at character index 10.",
      },
      {
        name: "bbox - no ( after BBOX",
        input: "BBOX",
        message: "Expected '(' after BBOX at character index 4.",
      },
      {
        name: "bbox - No coordinates in point",
        input: "BBOX()",
        message: "Expected BBOX to have either 4 or 6 coordinates, but found 0.",
      },
      {
        name: "bbox - incorrect number of coordinates",
        input: "BBOX(456)",
        message: "Expected BBOX to have either 4 or 6 coordinates, but found 1.",
      },
      {
        name: "bbox - has , in point ",
        input: "BBOX(123, 4.56)",
        message: "Expected BBOX to have either 4 or 6 coordinates, but found 2.",
      },
      {
        name: "bbox - no ) after point",
        input: "BBOX(456 789",
        message: "Expected ')' after BBOX's coordinates at character index 9.",
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
});
