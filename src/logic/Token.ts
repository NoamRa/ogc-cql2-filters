import { Literal, TokenType } from "./types";

export default class Token {
  charIndex: number;
  type: TokenType;
  lexeme: string;
  literal?: Literal;

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
