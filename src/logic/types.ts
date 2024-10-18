export type TokenType =
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
  | "TRUE" // true | True | TRUE
  | "FALSE" // false | False | FALSE
  | "TIMESTAMP" // timestamp | TIMESTAMP
  | "DATE" // date | DATE
  | "property" // property
  // | "OP" // op
  // | "ARGS" // args
  | "IS"
  | "NOT"
  | "NULL"

  // Literals
  | "IDENTIFIER"
  | "STRING"
  | "NUMBER"

  // That's all, folks
  | "EOF";

// https://docs.ogc.org/is/21-065r2/21-065r2.html#scalar-data-types
type Scalar =
  | string
  | number
  | boolean
  // TIMESTAMP('1969-07-20T20:17:40Z') OR { "timestamp": "1969-07-20T20:17:40Z" }
  // DATE('1969-07-20') OR { "date": "1969-07-20" }
  | Date;

export type Literal = Scalar;
export type LiteralType = "string" | "number" | "boolean" | "timestamp" | "date";

// https://docs.ogc.org/is/21-065r2/21-065r2.html#basic-cql2_property
export interface PropertyRef<T extends Scalar> {
  name: string;
  type: T;
}

export interface Serializable {
  toString(): string;
  toJSON(): object;
}
