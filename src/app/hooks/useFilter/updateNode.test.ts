import { describe, test, expect } from "vitest";
import { updateNode } from "./updateNode";
import type { JSONPath } from "../../../logic/types";

describe("Test updateNode", () => {
  describe("Positive test cases", () => {
    const tests = [
      {
        name: "updates a property in a nested object",
        input: { obj: { a: { b: { c: 1 } } }, path: ["a", "b", "c"], value: 24 },
        expected: { a: { b: { c: 24 } } },
      },
      {
        name: "updates a deeply nested object property",
        input: { obj: { a: { b: { c: { d: 1 } } } }, path: ["a", "b", "c", "d"], value: 41 },
        expected: { a: { b: { c: { d: 41 } } } },
      },
      {
        name: "replaces an existing value",
        input: { obj: { a: 10 }, path: ["a"], value: 20 },
        expected: { a: 20 },
      },
      {
        name: "adds a property if it exists in the parent but is undefined",
        input: { obj: { a: { b: undefined } }, path: ["a", "b"], value: 30 },
        expected: { a: { b: 30 } },
      },
      {
        name: "path is empty",
        input: { obj: { a: { b: 1 } }, path: [], value: 24 },
        expected: { a: { b: 1 } },
      },
      {
        name: "updates an element in an array within an object",
        input: { obj: { a: [1, 2, 3] }, path: ["a", 1], value: 24 },
        expected: { a: [1, 24, 3] },
      },
    ];

    test.each(tests)("$name", ({ input, expected }) => {
      const { obj, path, value } = input;
      const result = updateNode(obj, path, value);
      expect(result).toStrictEqual(expected);
    });
  });

  describe("Negative test cases", () => {
    const tests = [
      {
        name: "path does not exist in the object",
        input: { obj: { a: { b: 1 } }, path: ["a", "c"], value: 24 },
        expectedError: "Error in updateNode, object doesn't have property",
      },
      {
        name: "the object at the path is undefined",
        input: { obj: { a: { b: undefined } }, path: ["a", "b", "c"], value: 24 },
        expectedError: "Error in updateNode, path result is undefined",
      },
      {
        name: "the object at the path is a primitive",
        input: { obj: { a: { b: 24 } }, path: ["a", "b", "c"], value: 41 },
        expectedError: "Error in updateNode, object doesn't have property",
      },
      {
        name: "the parent object is null",
        input: { obj: { a: { b: null } }, path: ["a", "b", "c"], value: 24 },
        expectedError: "Error in updateNode, object doesn't have property",
      },
      {
        name: "throws an error if path refers to a non-existent array index",
        input: { obj: { a: [1, 2, 3] }, path: ["a", 5], value: 24 },
        expectedError: "Error in updateNode, object doesn't have property",
      },
    ];

    test.each(tests)("Throws when $name", ({ input, expectedError }) => {
      const { obj, path, value } = input;
      expect(() => updateNode(obj, path, value)).toThrow(expectedError);
    });
  });

  test("Object and path don't change", () => {
    const obj = { a: { b: { c: 1 } } };
    const clonedObj = JSON.parse(JSON.stringify(obj)) as object;

    const path = ["a", "b", "c"];
    const clonedPath = JSON.parse(JSON.stringify(path)) as JSONPath;

    const result = updateNode(obj, path, 24);
    expect(result).toStrictEqual({ a: { b: { c: 24 } } });

    expect(clonedObj).toStrictEqual(obj);
    expect(clonedPath).toStrictEqual(path);
  });
});
