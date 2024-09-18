import { describe, expect, test } from "vitest";
import { scanJSON, scanText, scan } from "./scan";

describe("Test scanner", () => {
  describe("Test scan", () => {
    test("scan string", () => {
      expect(scan("", { inputType: "text" })).toStrictEqual([]);
    });

    test("scan JSON", () => {
      expect(scan("{}", { inputType: "JSON" })).toStrictEqual([]);
    });

    test("throws if can't parse JSON", () => {
      expect(() => scan("a string", { inputType: "JSON" })).toThrowError(
        "Failed to parse JSON input"
      );
    });
  });

  describe("Test scanning JSON", () => {
    test("empty", () => {
      expect(scanJSON({})).toStrictEqual([]);
    });
  });

  describe("Test scanning text", () => {
    test("empty", () => {
      expect(scanText("")).toStrictEqual([]);
    });
  });
});
