import type { Literal } from "../types";
import type { TokenType } from "./TokenType";

/**
 * Token object represents a single "word" in CQL2.
 */
export class Token {
  /**
   * The first index of the lexeme.
   */
  readonly charIndex: number;

  /**
   * Type of the token.
   */
  readonly type: TokenType;

  /**
   * Lexemes are only the raw substrings of the source code, including quotations.
   * @example TRUE (string)
   * @example 'Berlin' (string, wrapped with string quotes)
   * @example 1.23 (digits as string)
   * @example DIV (function identifier as string)
   */
  readonly lexeme: string;

  /**
   * Literals are identifiers, strings, or numbers. These are values.
   * If literal is not provided, the lexeme will be used.
   * @example true (boolean)
   * @example Berlin (string, without wrapping quotes)
   * @example 1.23 (number)
   * @example DIV (function identifier)
   */
  readonly literal: Literal;

  constructor(charIndex: number, type: TokenType, lexeme: string, literal?: Literal) {
    this.charIndex = charIndex;
    this.type = type;
    this.lexeme = lexeme;
    this.literal = literal ?? lexeme;
    Object.freeze(this);
  }

  toText() {
    return [this.type, this.lexeme, this.literal].join(" ");
  }

  toJSON() {
    return {
      charIndex: this.charIndex,
      type: this.type,
      lexeme: this.lexeme,
      literal: this.literal,
    };
  }
}
