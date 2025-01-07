import type { Literal, Serializable } from "../types";
import type { TokenType } from "./TokenType";

export default class Token implements Serializable {
  readonly charIndex: number;
  readonly type: TokenType;
  /**
   * Lexemes are only the raw substrings of the source code, including quotations.
   * ex. add (function identifier), "Berlin" (string, wrapped with string quotes), 1.23 (string)
   */
  readonly lexeme: string;
  /**
   * Literals are identifiers, strings, or numbers. These are values.
   * ex. add (function identifier as string), Berlin (string), 1.23 (number)
   */
  readonly literal: Literal;

  constructor(charIndex: number, type: TokenType, lexeme: string, literal?: Literal) {
    this.type = type;
    this.lexeme = lexeme;
    this.literal = literal ?? lexeme;
    this.charIndex = charIndex;
    Object.freeze(this);
  }

  toText() {
    return [this.type, this.lexeme, this.literal].join(" ");
  }

  toJSON() {
    return { type: this.type, lexeme: this.lexeme, literal: this.literal, charIndex: this.charIndex };
  }
}
