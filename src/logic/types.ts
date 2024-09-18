export type TokenType =
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

  // Keywords
  | "TRUE" // true | True | TRUE
  | "FALSE" // false | False | FALSE
  // | "TIMESTAMP" // timestamp | TIMESTAMP
  // | "DATE" // date | DATE
  | "property" // property
  // | "OP" // op
  // | "ARGS" // args

  // Literals
  | "IDENTIFIER"
  | "STRING"
  | "NUMBER"

  // That's all, folks
  | "EOF";

// https://docs.ogc.org/is/21-065r2/21-065r2.html#scalar-data-types
type Scalar = string | number | boolean;
// | "timestamp" // TODO - TIMESTAMP('1969-07-20T20:17:40Z') OR   { "timestamp": "1969-07-20T20:17:40Z" }
// | "date"; // TODO - DATE('1969-07-20') OR { "date": "1969-07-20" }

export type Literal = Scalar;

// https://docs.ogc.org/is/21-065r2/21-065r2.html#basic-cql2_property
export interface PropertyRef<T extends Scalar> {
  name: string;
  type: T;
}

export interface Expression {
  op: any; // TODO
  args: any[]; // TODO
}
