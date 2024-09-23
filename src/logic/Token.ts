import { Literal, TokenType } from "./types";

export default class Token {
  charIndex: number;
  type: TokenType;
  /**
   * Lexemes are only the raw substrings of the source code, including quotations.
   * ex. add (function identifier), "Berlin" (string, with string ), 1.23 (number)
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

  toString() {
    return [this.type, this.lexeme, this.literal]
      .filter(
        // literal can be zero or false, and should be included
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        (v) => v !== undefined,
      )
      .join(" ");
  }
}
