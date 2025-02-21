// https://www.opengis.net/spec/cql2/1.0/req/scalar-data-types
export type Scalar = string | number | boolean;

export type Literal =
  | Scalar
  /** Type Date is timestamp or calendar date
   * TIMESTAMP('1969-07-20T20:17:40Z') OR { "timestamp": "1969-07-20T20:17:40Z" }
   * DATE('1969-07-20') OR { "date": "1969-07-20" }
   */
  | Date
  | null;

export type LiteralType = "string" | "number" | "boolean" | "null" | "timestamp" | "date";

interface LiteralBase {
  value: Literal;
  type: LiteralType;
}
export interface StringLiteral extends LiteralBase {
  value: string;
  type: "string";
}
export interface NumberLiteral extends LiteralBase {
  value: number;
  type: "number";
}
export interface BooleanLiteral extends LiteralBase {
  value: boolean;
  type: "boolean";
}
export interface NullLiteral extends LiteralBase {
  value: null;
  type: "null";
}
export interface CalendarDateLiteral extends LiteralBase {
  value: Date;
  type: "date";
}
export interface TimestampLiteral extends LiteralBase {
  value: Date;
  type: "timestamp";
}
export type TimeLiteral = CalendarDateLiteral | TimestampLiteral; // Joined for Convenient
export type LiteralPair = StringLiteral | NumberLiteral | BooleanLiteral | NullLiteral | TimeLiteral;

// https://www.opengis.net/spec/cql2/1.0/req/basic-cql2_property
export interface PropertyRef<T extends Scalar> {
  name: string;
  type: T;
}

// Path related
export type JSONPathItem = string | number;
export type JSONPath = JSONPathItem[];
