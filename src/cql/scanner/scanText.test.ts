import { describe, expect, test } from "vitest";
import { Token } from "../entities/Token";
import { ScanError } from "./scanError";
import { scanText } from "./scanText";

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
      input: "789",
      expected: [new Token(0, "NUMBER", "789", 789), new Token(3, "EOF", "")],
    },
    {
      name: "negative number",
      input: "-456",
      expected: [new Token(0, "NUMBER", "-456", -456), new Token(4, "EOF", "")],
    },
    {
      name: "negative decimal",
      input: "-4.56",
      expected: [new Token(0, "NUMBER", "-4.56", -4.56), new Token(5, "EOF", "")],
    },
    {
      name: "minus followed by space and number",
      input: "- 456",
      expected: [new Token(0, "MINUS", "-"), new Token(2, "NUMBER", "456", 456), new Token(5, "EOF", "")],
    },
    {
      name: "subtraction",
      input: "3 - 5",
      expected: [
        new Token(0, "NUMBER", "3", 3),
        new Token(2, "MINUS", "-"),
        new Token(4, "NUMBER", "5", 5),
        new Token(5, "EOF", ""),
      ],
    },
    {
      name: "subtracting negative",
      input: "3 - -5",
      expected: [
        new Token(0, "NUMBER", "3", 3),
        new Token(2, "MINUS", "-"),
        new Token(4, "NUMBER", "-5", -5),
        new Token(6, "EOF", ""),
      ],
    },
    {
      name: "two numbers, second is negative",
      input: "3 -5",
      expected: [new Token(0, "NUMBER", "3", 3), new Token(2, "NUMBER", "-5", -5), new Token(4, "EOF", "")],
    },
    {
      name: "subtraction without space",
      input: "3-5",
      expected: [
        new Token(0, "NUMBER", "3", 3),
        new Token(1, "MINUS", "-"),
        new Token(2, "NUMBER", "5", 5),
        new Token(3, "EOF", ""),
      ],
    },
    {
      name: "subtraction with space",
      input: "3- 5",
      expected: [
        new Token(0, "NUMBER", "3", 3),
        new Token(1, "MINUS", "-"),
        new Token(3, "NUMBER", "5", 5),
        new Token(4, "EOF", ""),
      ],
    },
    {
      name: "subtraction of negative number without space",
      input: "3--5",
      expected: [
        new Token(0, "NUMBER", "3", 3),
        new Token(1, "MINUS", "-"),
        new Token(2, "NUMBER", "-5", -5),
        new Token(4, "EOF", ""),
      ],
    },

    {
      name: "subtraction of property",
      input: "x - 5",
      expected: [
        new Token(0, "IDENTIFIER", "x", "x"),
        new Token(2, "MINUS", "-"),
        new Token(4, "NUMBER", "5", 5),
        new Token(5, "EOF", ""),
      ],
    },
    {
      name: "subtracting negative from property",
      input: "x - -5",
      expected: [
        new Token(0, "IDENTIFIER", "x", "x"),
        new Token(2, "MINUS", "-"),
        new Token(4, "NUMBER", "-5", -5),
        new Token(6, "EOF", ""),
      ],
    },
    {
      name: "property and negative number",
      input: "x -5",
      expected: [new Token(0, "IDENTIFIER", "x", "x"), new Token(2, "NUMBER", "-5", -5), new Token(4, "EOF", "")],
    },
    {
      name: "subtraction from property without space",
      input: "x-5",
      expected: [
        new Token(0, "IDENTIFIER", "x", "x"),
        new Token(1, "MINUS", "-"),
        new Token(2, "NUMBER", "5", 5),
        new Token(3, "EOF", ""),
      ],
    },
    {
      name: "subtraction from property with space",
      input: "x- 5",
      expected: [
        new Token(0, "IDENTIFIER", "x", "x"),
        new Token(1, "MINUS", "-"),
        new Token(3, "NUMBER", "5", 5),
        new Token(4, "EOF", ""),
      ],
    },
    {
      name: "subtraction from property of negative number without space",
      input: "x--5",
      expected: [
        new Token(0, "IDENTIFIER", "x", "x"),
        new Token(1, "MINUS", "-"),
        new Token(2, "NUMBER", "-5", -5),
        new Token(4, "EOF", ""),
      ],
    },
    {
      name: "subtracting from a property",
      // This input is correct for scanning, but will throw parse error
      input: "vehicle_height > (bridge_clearance -1)",
      expected: [
        new Token(0, "IDENTIFIER", "vehicle_height"),
        new Token(15, "GREATER", ">"),
        new Token(17, "LEFT_PAREN", "("),
        new Token(18, "IDENTIFIER", "bridge_clearance", "bridge_clearance"),
        new Token(35, "NUMBER", "-1", -1),
        new Token(37, "RIGHT_PAREN", ")"),
        new Token(38, "EOF", ""),
      ],
    },
    {
      name: "comparison of function and number",
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
        new Token(8, "NUMBER", "-150.0", -150),
        new Token(15, "GREATER", ">"),
        new Token(17, "NUMBER", "-3.4", -3.4),
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
    {
      name: "booleans",
      input: "true false True False TRUE FALSE treu fales",
      expected: [
        new Token(0, "IDENTIFIER", "true"),
        new Token(5, "IDENTIFIER", "false"),
        new Token(11, "IDENTIFIER", "True"),
        new Token(16, "IDENTIFIER", "False"),
        new Token(22, "TRUE", "TRUE", true),
        new Token(27, "FALSE", "FALSE", false),
        new Token(33, "IDENTIFIER", "treu", "treu"),
        new Token(38, "IDENTIFIER", "fales", "fales"),
        new Token(43, "EOF", ""),
      ],
    },
    {
      name: "and",
      input: "foo AND bar",
      expected: [
        new Token(0, "IDENTIFIER", "foo"),
        new Token(4, "AND", "AND"),
        new Token(8, "IDENTIFIER", "bar"),
        new Token(11, "EOF", ""),
      ],
    },
    {
      name: "or",
      input: "foo OR bar",
      expected: [
        new Token(0, "IDENTIFIER", "foo"),
        new Token(4, "OR", "OR"),
        new Token(7, "IDENTIFIER", "bar"),
        new Token(10, "EOF", ""),
      ],
    },

    // advanced comparison
    {
      name: "like",
      input: "name LIKE 'Harrison%'",
      expected: [
        new Token(0, "IDENTIFIER", "name"),
        new Token(5, "LIKE", "LIKE"),
        new Token(10, "STRING", "'Harrison%'", "Harrison%"),
        new Token(21, "EOF", ""),
      ],
    },
    {
      name: "not like",
      input: "name NOT LIKE 'McCartney%'",
      expected: [
        new Token(0, "IDENTIFIER", "name"),
        new Token(5, "NOT", "NOT"),
        new Token(9, "LIKE", "LIKE"),
        new Token(14, "STRING", "'McCartney%'", "McCartney%"),
        new Token(26, "EOF", ""),
      ],
    },
    {
      name: "between",
      input: "depth BETWEEN 123 AND 456.7",
      expected: [
        new Token(0, "IDENTIFIER", "depth"),
        new Token(6, "BETWEEN", "BETWEEN"),
        new Token(14, "NUMBER", "123", 123),
        new Token(18, "AND", "AND"),
        new Token(22, "NUMBER", "456.7", 456.7),
        new Token(27, "EOF", ""),
      ],
    },
    {
      name: "not between",
      input: "depth NOT BETWEEN 123 AND 456.7",
      expected: [
        new Token(0, "IDENTIFIER", "depth"),
        new Token(6, "NOT", "NOT"),
        new Token(10, "BETWEEN", "BETWEEN"),
        new Token(18, "NUMBER", "123", 123),
        new Token(22, "AND", "AND"),
        new Token(26, "NUMBER", "456.7", 456.7),
        new Token(31, "EOF", ""),
      ],
    },
    {
      name: "between with complex start and end",
      input: "cloudCover BETWEEN 1+2 AND 3+4",
      expected: [
        new Token(0, "IDENTIFIER", "cloudCover", "cloudCover"),
        new Token(11, "BETWEEN", "BETWEEN"),
        new Token(19, "NUMBER", "1", 1),
        new Token(20, "PLUS", "+", "+"),
        new Token(21, "NUMBER", "2", 2),
        new Token(23, "AND", "AND", "AND"),
        new Token(27, "NUMBER", "3", 3),
        new Token(28, "PLUS", "+", "+"),
        new Token(29, "NUMBER", "4", 4),
        new Token(30, "EOF", "", ""),
      ],
    },
    {
      name: "in",
      input: "cityName IN ('Toronto','New York')",
      expected: [
        new Token(0, "IDENTIFIER", "cityName", "cityName"),
        new Token(9, "IN", "IN"),
        new Token(12, "LEFT_PAREN", "("),
        new Token(13, "STRING", "'Toronto'", "Toronto"),
        new Token(22, "COMMA", ","),
        new Token(23, "STRING", "'New York'", "New York"),
        new Token(33, "RIGHT_PAREN", ")"),
        new Token(34, "EOF", "", ""),
      ],
    },
    {
      name: "not in",
      input: "cityName NOT IN ('Toronto', 'New York' )",
      expected: [
        new Token(0, "IDENTIFIER", "cityName", "cityName"),
        new Token(9, "NOT", "NOT"),
        new Token(13, "IN", "IN"),
        new Token(16, "LEFT_PAREN", "("),
        new Token(17, "STRING", "'Toronto'", "Toronto"),
        new Token(26, "COMMA", ","),
        new Token(28, "STRING", "'New York'", "New York"),
        new Token(39, "RIGHT_PAREN", ")"),
        new Token(40, "EOF", "", ""),
      ],
    },
    {
      name: "not in",
      input: "cityName NOT IN ('Toronto', 'New York' )",
      expected: [
        new Token(0, "IDENTIFIER", "cityName", "cityName"),
        new Token(9, "NOT", "NOT"),
        new Token(13, "IN", "IN"),
        new Token(16, "LEFT_PAREN", "("),
        new Token(17, "STRING", "'Toronto'", "Toronto"),
        new Token(26, "COMMA", ","),
        new Token(28, "STRING", "'New York'", "New York"),
        new Token(39, "RIGHT_PAREN", ")"),
        new Token(40, "EOF", "", ""),
      ],
    },

    // insensitive comparison
    {
      name: "case-insensitive comparison",
      input: "CASEI(road_class) IN (CASEI('Οδος'),CASEI('Straße'))",
      expected: [
        new Token(0, "CASEI", "CASEI"),
        new Token(5, "LEFT_PAREN", "("),
        new Token(6, "IDENTIFIER", "road_class"),
        new Token(16, "RIGHT_PAREN", ")"),
        new Token(18, "IN", "IN"),
        new Token(21, "LEFT_PAREN", "("),
        new Token(22, "CASEI", "CASEI"),
        new Token(27, "LEFT_PAREN", "("),
        new Token(28, "STRING", "'Οδος'", "Οδος"),
        new Token(34, "RIGHT_PAREN", ")"),
        new Token(35, "COMMA", ","),
        new Token(36, "CASEI", "CASEI"),
        new Token(41, "LEFT_PAREN", "("),
        new Token(42, "STRING", "'Straße'", "Straße"),
        new Token(50, "RIGHT_PAREN", ")"),
        new Token(51, "RIGHT_PAREN", ")"),
        new Token(52, "EOF", "", ""),
      ],
    },
    {
      name: "accent-insensitive comparison",
      input: "ACCENTI(etat_vol) = ACCENTI('débárquér')",
      expected: [
        new Token(0, "ACCENTI", "ACCENTI"),
        new Token(7, "LEFT_PAREN", "("),
        new Token(8, "IDENTIFIER", "etat_vol"),
        new Token(16, "RIGHT_PAREN", ")"),
        new Token(18, "EQUAL", "="),
        new Token(20, "ACCENTI", "ACCENTI"),
        new Token(27, "LEFT_PAREN", "("),
        new Token(28, "STRING", "'débárquér'", "débárquér"),
        new Token(39, "RIGHT_PAREN", ")"),
        new Token(40, "EOF", "", ""),
      ],
    },

    // Spatial
    {
      name: "point",
      input: "POINT(43.5845 -79.5442)", // Note: no comma between numbers
      expected: [
        new Token(0, "POINT", "POINT"),
        new Token(5, "LEFT_PAREN", "("),
        new Token(6, "NUMBER", "43.5845", 43.5845),
        new Token(14, "NUMBER", "-79.5442", -79.5442),
        new Token(22, "RIGHT_PAREN", ")"),
        new Token(23, "EOF", "", ""),
      ],
    },
    {
      name: "bbox",
      input: "BBOX(160.6,-55.95, -170,-25.89)",
      expected: [
        new Token(0, "BBOX", "BBOX"),
        new Token(4, "LEFT_PAREN", "("),
        new Token(5, "NUMBER", "160.6", 160.6),
        new Token(10, "COMMA", ","),
        new Token(11, "NUMBER", "-55.95", -55.95),
        new Token(17, "COMMA", ","),
        new Token(19, "NUMBER", "-170", -170),
        new Token(23, "COMMA", ","),
        new Token(24, "NUMBER", "-25.89", -25.89),
        new Token(30, "RIGHT_PAREN", ")"),
        new Token(31, "EOF", "", ""),
      ],
    },
  ];

  test.each(tests)("Expression with $name", ({ input, expected }) => {
    expect(expected).toStrictEqual(scanText(input));

    expected.forEach((token) => {
      const word = input.slice(token.charIndex, token.charIndex + token.lexeme.length);
      expect(word).toBe(token.lexeme);
    });
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
