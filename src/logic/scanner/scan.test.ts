import { describe, expect, test } from "vitest";
import scan from "./scan";
import Token from "../Token";
import ScanError from "./scanError";

describe("Test scanner", () => {
  describe("Test scan", () => {
    test("scan string", () => {
      expect(scan("", { inputType: "text" })).toStrictEqual([
        new Token(0, "EOF", ""),
      ]);
    });

    test("scan JSON", () => {
      expect(scan("{}", { inputType: "JSON" })).toStrictEqual([]);
    });

    test("throws if can't parse JSON", () => {
      expect(() => scan("a string", { inputType: "JSON" })).toThrowError(ScanError);
      expect(() => scan("another string", { inputType: "JSON" })).toThrowError(
        "Failed to parse JSON input"
      );
    });
  });
});
