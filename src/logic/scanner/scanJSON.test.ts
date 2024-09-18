import { describe, expect, test } from "vitest";
import scanJSON from "./scanJSON";

describe("Test scanning JSON", () => {
  test("empty", () => {
    expect(scanJSON({})).toStrictEqual([]);
  });
});
