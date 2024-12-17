type TokenType =
  // Tokens with one character
  | "LEFT_PAREN" // (
  | "RIGHT_PAREN" // )
  | "LEFT_BRACE" // {
  | "RIGHT_BRACE" // }
  | "LEFT_BRACKET" // [
  | "RIGHT_BRACKET" // ]
  | "COMMA" // ]
  | "COLON" // :
  | "DOT" // .
  | "MINUS" // -
  | "PLUS" // +
  | "STAR" // *
  | "SLASH" // /
  | "EQUAL" // =

  // Tokens with one or two characters
  | "GREATER" // >
  | "GREATER_EQUAL" // >=
  | "LESS" // <
  | "LESS_EQUAL" // <=
  | "NOT_EQUAL" // <>

  // Keywords
  | "TRUE" // TRUE
  | "FALSE" // FALSE
  | "TIMESTAMP" // timestamp | TIMESTAMP
  | "DATE" // date | DATE
  | "IS"
  | "NOT"
  | "NULL"

  // Literals
  | "IDENTIFIER"
  | "STRING"
  | "NUMBER"

  // That's all, folks
  | "EOF";

export default TokenType;
