import { describe, expect, test } from "vitest";
import Token from "../Entities/Token";
import ScanError from "./scanError";
import scanText from "./scanText";

describe("Test scanning text", () => {
  test("Empty, just EOF", () => {
    expect(scanText("")).toStrictEqual([new Token(0, "EOF", "")]);
  });

  const tests = [
    {
      name: "just single token characters",
      input: "{} () [] .,+-*/",
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
        new Token(14, "SLASH", "/"),
        new Token(15, "EOF", ""),
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
      input: "<=<>==<=> < = > <> ",
      expected: [
        new Token(0, "LESS_EQUAL", "<="),
        new Token(2, "NOT_EQUAL", "<>"),
        new Token(4, "EQUAL", "="),
        new Token(5, "EQUAL", "="),
        new Token(6, "LESS_EQUAL", "<="),
        new Token(8, "GREATER", ">"),
        new Token(10, "LESS", "<"),
        new Token(12, "EQUAL", "="),
        new Token(14, "GREATER", ">"),
        new Token(16, "NOT_EQUAL", "<>"),
        new Token(19, "EOF", ""),
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
    {
      name: "line breaks (\\n)",
      input: ["1", ">", "2"].join("\n"),
      expected: [
        new Token(0, "NUMBER", "1", 1),
        new Token(2, "GREATER", ">"),
        new Token(4, "NUMBER", "2", 2),
        new Token(5, "EOF", ""),
      ],
    },
    {
      name: "line breaks (\\r)",
      input: ["3", ">", "4"].join("\r"),
      expected: [
        new Token(0, "NUMBER", "3", 3),
        new Token(2, "GREATER", ">"),
        new Token(4, "NUMBER", "4", 4),
        new Token(5, "EOF", ""),
      ],
    },
    {
      name: "tabs (\\t)",
      input: ["5", ">", "6"].join("\t"),
      expected: [
        new Token(0, "NUMBER", "5", 5),
        new Token(2, "GREATER", ">"),
        new Token(4, "NUMBER", "6", 6),
        new Token(5, "EOF", ""),
      ],
    },
    {
      name: "timestamp",
      input: "updated >= TIMESTAMP('1969-07-20T20:17:40Z')",
      expected: [
        new Token(0, "IDENTIFIER", "updated"),
        new Token(8, "GREATER_EQUAL", ">="),
        new Token(11, "TIMESTAMP", "TIMESTAMP('1969-07-20T20:17:40Z')", new Date("1969-07-20T20:17:40Z")),
        new Token(44, "EOF", ""),
      ],
    },
    {
      name: "date",
      input: "updated >= DATE('1999-11-05')",
      expected: [
        new Token(0, "IDENTIFIER", "updated"),
        new Token(8, "GREATER_EQUAL", ">="),
        new Token(11, "DATE", "DATE('1999-11-05')", new Date("1999-11-05")),
        new Token(29, "EOF", ""),
      ],
    },
    {
      name: "is null",
      input: "geometry IS NULL",
      expected: [
        new Token(0, "IDENTIFIER", "geometry"),
        new Token(9, "IS", "IS"),
        new Token(12, "NULL", "NULL"),
        new Token(16, "EOF", ""),
      ],
    },
    {
      name: "is not null",
      input: "geometry IS NOT NULL",
      expected: [
        new Token(0, "IDENTIFIER", "geometry"),
        new Token(9, "IS", "IS"),
        new Token(12, "NOT", "NOT"),
        new Token(16, "NULL", "NULL"),
        new Token(20, "EOF", ""),
      ],
    },
    {
      name: "grouping with parenthesis",
      input: "2 * ( 3 + 1 )",
      expected: [
        new Token(0, "NUMBER", "2", 2),
        new Token(2, "STAR", "*"),
        new Token(4, "LEFT_PAREN", "("),
        new Token(6, "NUMBER", "3", 3),
        new Token(8, "PLUS", "+"),
        new Token(10, "NUMBER", "1", 1),
        new Token(12, "RIGHT_PAREN", ")"),
        new Token(13, "EOF", ""),
      ],
    },
  ];

  test.each(tests)("Expression with $name", ({ input, expected }) => {
    expect(scanText(input)).toStrictEqual(expected);
  });

  test("Throws on unterminated string", () => {
    const throws = () => scanText("city='Toronto");
    expect(throws).toThrowError(ScanError);
    expect(throws).toThrowError("Unterminated string at character index 13");
  });

  const malformedDatesTest = [
    {
      name: "missing open parenthesis",
      input: "TIMESTAMP'1969-",
      message: "Expected open parenthesis after TIMESTAMP at character index 9",
    },
    {
      name: "missing open quote",
      input: "TIMESTAMP(1969-15-20)",
      message: "Expected quote after TIMESTAMP( at character index 10",
    },
    {
      name: "missing closing quote",
      input: "DATE('1969-12-12)",
      message: "Expected closing quote after DATE('1969-12-12 at character index 16",
    },
    {
      name: "missing closing parenthesis",
      input: "DATE('1969-12-12'",
      message: "Expected closing parenthesis after DATE('1969-12-12' at character index 17",
    },
    {
      name: "invalid calendar date - bad date",
      input: "DATE('2020-02-32')",
      message: "Invalid date value at character index 6 - 2020-02-32')",
    },
    {
      name: "invalid calendar date - timestamp and not date",
      input: "DATE('1969-07-20T20:17:40Z')",
      message: "Expected closing quote after DATE('1969-07-20 at character index 16",
    },
    {
      name: "invalid timestamp - date and not timestamp",
      input: "TIMESTAMP('2020-02-02')",
      message: "Invalid timestamp value at character index 11 - 2020-02-02')",
    },
    {
      name: "invalid timestamp - bad timestamp",
      input: "TIMESTAMP('1969-07-20T25:17:40Z')",
      message: "Invalid timestamp value at character index 11 - 1969-07-20T25:17:40Z')",
    },
  ];

  test.each(malformedDatesTest)("Throws on $name", ({ input, message }) => {
    const throws = () => scanText(input);
    expect(throws).toThrowError(ScanError);
    expect(throws).toThrowError(message);
  });
});
