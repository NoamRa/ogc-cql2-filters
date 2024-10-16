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
  | "EQUAL" // =

  // Tokens with one or two characters
  | "GREATER" // >
  | "GREATER_EQUAL" // >=
  | "LESS" // <
  | "LESS_EQUAL" // <=

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
  | { timestamp: Timestamp } // TIMESTAMP('1969-07-20T20:17:40Z') OR { "timestamp": "1969-07-20T20:17:40Z" }
  | { date: CalendarDate }; // DATE('1969-07-20') OR { "date": "1969-07-20" }

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

//#region date / time

type Timestamp = string; // TODO type 1969-07-20T20:17:40Z
type CalendarDate = string; // TODO type 1969-07-20 // `Date` object already used in JS

//#endregion
