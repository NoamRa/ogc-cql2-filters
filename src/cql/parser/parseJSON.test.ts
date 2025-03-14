import { describe, expect, test } from "vitest";
import { parseJSON } from "./parseJSON";
import { ParseJSONError } from "./ParseJSONError";
import { testCases } from "./testCases.test";

describe("Test parsing tokens (JSON)", () => {
  describe("Valid inputs", () => {
    test.each(testCases)("Parse with $name", ({ input, expected }) => {
      const parsed = parseJSON(input.json);
      expect(parsed.toText()).toStrictEqual(expected.textForJson ?? expected.text);
      expect(parsed.toJSON()).toStrictEqual(expected.json);
    });
  });

  describe("Invalid inputs", () => {
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
        name: "un-probable input",
        input: Symbol("foo"),
        message: "Failed to parse",
      },
      {
        name: "un-probable input",
        input: { op: "+", args: [BigInt(3)] },
        message: "Failed to parse",
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
      // Advanced comparison
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
      // Spatial
      {
        name: "point - incorrect number of coordinates",
        input: { type: "Point", coordinates: [] },
        message: `Expected point's to have either 4 or 6 coordinates`,
      },
      {
        name: "point - coordinate(s) not number",
        input: { type: "Point", coordinates: [48, "ab"] },
        message: `Expected all point's coordinates to be numbers, but found [48, ab]`,
      },
      {
        name: "bbox - incorrect number of coordinates",
        input: { bbox: [456, 789, 369] },
        message: `Expected bbox to have either 4 or 6 coordinates, but found 3`,
      },
      {
        name: "bbox - coordinate(s) not number",
        input: { bbox: [48, "ab", 5, 6] },
        message: `Expected all bbox's coordinates to be numbers, but found [48, ab, 5, 6]`,
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
});
