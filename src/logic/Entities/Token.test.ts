import { describe, expect, test } from "vitest";
import Token from "./Token";

describe("Test Token", () => {
  test("Tokens are serializable", () => {
    const token = new Token(3, "TRUE", "true", true);
    expect(token.toText()).toStrictEqual("TRUE true true");
    expect(token.toJSON()).toStrictEqual({
      charIndex: 3,
      type: "TRUE",
      lexeme: "true",
      literal: true,
    });
  });

  describe("Test immutability", () => {
    test("Tokens are immutable", () => {
      const token = new Token(2, "NOT_EQUAL", "<>");

      expect(() => {
        token.toText = () => "foo";
      }).toThrow("Cannot add property toText, object is not extensible");

      expect(() => {
        token.toJSON = () => token.toJSON();
      }).toThrow("Cannot add property toJSON, object is not extensible");

      for (const key in token) {
        expect(() => {
          // @ts-expect-error because assigning to implicit any
          token[key] = "baz";
        }).toThrow(`Cannot assign to read only property '${key}' of object '#<Token>'`);
      }
    });
  });
});
