import { describe, expect, test } from "vitest";
import { parse } from "./parse";
import { FunctionExpression, LiteralExpression } from "./entities/Expression";

describe("Test parse", () => {
  test("Text input", () => {
    const parsed = parse("'foo'");
    expect(parsed.encoding).toEqual("Text");
    expect(parsed.expression).toBeInstanceOf(LiteralExpression);
    expect(parsed.error).toBeUndefined();
  });

  test("JSON as text", () => {
    const parsed = parse('{ "op": "add", "args": [2,3] }');
    expect(parsed.encoding).toEqual("JSON");
    expect(parsed.expression).toBeInstanceOf(FunctionExpression);
    expect(parsed.error).toBeUndefined();
  });

  test("JSON as object", () => {
    const parsed = parse({ op: "add", args: [2, 3] });
    expect(parsed.error).toBeUndefined();
    expect(parsed.encoding).toEqual("JSON");
    expect(parsed.expression).toBeInstanceOf(FunctionExpression);
  });

  test("Malformed JSON", () => {
    const parsed = parse("{");
    expect(parsed.error).toBeInstanceOf(Error);
    expect(parsed.error?.message).toEqual("Expected property name or '}' in JSON at position 1");
    expect(parsed.encoding).toBeUndefined();
    expect(parsed.expression).toBeUndefined();
  });

  test("Malformed CQL", () => {
    const parsed = parse("'hey");
    expect(parsed.error).toBeInstanceOf(Error);
    expect(parsed.error?.message).toEqual("Unterminated string at character index 4");
    expect(parsed.encoding).toBeUndefined();
    expect(parsed.expression).toBeUndefined();
  });

  test("Failed to detect input", () => {
    const parsed = parse(123 as unknown as string);
    expect(parsed.error?.message).toEqual(
      "Failed to detect input type, expecting string for CQL2 Text or object for CQL2 JSON",
    );
    expect(parsed.error).toBeInstanceOf(Error);
    expect(parsed.encoding).toBeUndefined();
    expect(parsed.expression).toBeUndefined();
  });
});
