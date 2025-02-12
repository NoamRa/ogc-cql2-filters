export type OperatorTokenType =
  // Tokens with one character
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
  | "AND"
  | "OR"
  | "NOT"

  // Advanced Comparison Operators
  // https://docs.ogc.org/DRAFTS/21-065r3.html#advanced-comparison-operators
  | "LIKE"
  | "BETWEEN"
  | "IN";

export type TokenType =
  | OperatorTokenType

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

  // Keywords
  | "TRUE" // TRUE
  | "FALSE" // FALSE
  | "TIMESTAMP" // timestamp | TIMESTAMP
  | "DATE" // date | DATE

  // Tokens IS and NULL are not considered operators (at least for now)
  | "IS"
  | "NULL"

  // Literals
  | "IDENTIFIER"
  | "STRING"
  | "NUMBER"

  // That's all, folks
  | "EOF";
