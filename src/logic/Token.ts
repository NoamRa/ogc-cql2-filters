import { Literal, TokenType } from "./types";

export default class Token {
  charIndex: number;
  type: TokenType;
  lexeme: string; // lexemes are only the raw substrings of the source code, including quotations. ex. add (function identifier), "Berlin", "1.23"
  literal?: Literal; // Literals are identifiers, strings, or numbers. These are values. ex add (function identifier), Berlin, 1.23

  constructor(
    charIndex: number,
    type: TokenType,
    lexeme: string,
    literal?: Literal
  ) {
    this.type = type;
    this.lexeme = lexeme;
    this.literal = literal;
    this.charIndex = charIndex;
  }

  toString() {
    return [this.type, this.lexeme, this.literal].join(" ");
  }
}
