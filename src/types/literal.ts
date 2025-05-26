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

interface PairBase {
  value: Literal;
  type: string;
}
interface LiteralPairBase extends PairBase {
  value: Literal;
  type: LiteralType;
}
export interface StringLiteralPair extends LiteralPairBase {
  value: string;
  type: "string";
}
export interface NumberLiteralPair extends LiteralPairBase {
  value: number;
  type: "number";
}
export interface BooleanLiteralPair extends LiteralPairBase {
  value: boolean;
  type: "boolean";
}
export interface NullLiteralPair extends LiteralPairBase {
  value: null;
  type: "null";
}
export interface CalendarDateLiteralPair extends LiteralPairBase {
  value: Date;
  type: "date";
}
export interface TimestampLiteralPair extends LiteralPairBase {
  value: Date;
  type: "timestamp";
}
export interface UnboundLiteralPair extends PairBase {
  value: "..";
  type: "unbound";
}

export type ScalarLiteralPair = StringLiteralPair | NumberLiteralPair | BooleanLiteralPair | NullLiteralPair;
export type TemporalLiteralPair = CalendarDateLiteralPair | TimestampLiteralPair;
export type LiteralPair = ScalarLiteralPair | TemporalLiteralPair;
export type IntervalValuePair = TemporalLiteralPair | UnboundLiteralPair;

// https://www.opengis.net/spec/cql2/1.0/req/basic-cql2_property
export interface PropertyRef<T extends Scalar> {
  name: string;
  type: T;
}

// Path related
export type JSONPathItem = string | number;
export type JSONPath = JSONPathItem[];
