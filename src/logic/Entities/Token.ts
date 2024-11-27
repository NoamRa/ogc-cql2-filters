import { Literal, Serializable, TokenType } from "../types";

export default class Token implements Serializable {
  charIndex: number;
  type: TokenType;
  /**
   * Lexemes are only the raw substrings of the source code, including quotations.
   * ex. add (function identifier), "Berlin" (string, wrapped with string quotes), 1.23 (string)
   */
  lexeme: string;
  /**
   * Literals are identifiers, strings, or numbers. These are values.
   * ex. add (function identifier as string), Berlin (string), 1.23 (number)
   */
  literal: Literal;

  constructor(charIndex: number, type: TokenType, lexeme: string, literal?: Literal) {
    this.type = type;
    this.lexeme = lexeme;
    this.literal = literal ?? lexeme;
    this.charIndex = charIndex;
  }

  toText() {
    return [this.type, this.lexeme, this.literal].join(" ");
  }

  toJSON() {
    return { type: this.type, lexeme: this.lexeme, literal: this.literal, charIndex: this.charIndex };
  }
}
