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

interface LiteralPairBase {
  value: Literal | SpatialLiteral;
  type: LiteralType | SpatialLiteralType;
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

export type ScalarLiteralPair = StringLiteralPair | NumberLiteralPair | BooleanLiteralPair | NullLiteralPair;
export type TimeLiteralPair = CalendarDateLiteralPair | TimestampLiteralPair;
export type SpatialLiteralPair = BBoxLiteral | PointLiteral;
export type LiteralPair = ScalarLiteralPair | TimeLiteralPair | SpatialLiteralPair;

type Position2D = [number, number];
type Position3D = [number, number, number];
export type Position = Position2D | Position3D;

type BBox2D = [...Position2D, ...Position2D];
type BBox3D = [...Position3D, ...Position3D];
export type BBox = BBox2D | BBox3D;

export type SpatialLiteral = BBox | Position;

export type SpatialLiteralType = "bbox" | "point";

export interface BBoxLiteral extends LiteralPairBase {
  type: "bbox";
  value: BBox;
}
export interface PointLiteral extends LiteralPairBase {
  type: "point";
  value: Position;
}

// https://www.opengis.net/spec/cql2/1.0/req/basic-cql2_property
export interface PropertyRef<T extends Scalar> {
  name: string;
  type: T;
}

// Path related
export type JSONPathItem = string | number;
export type JSONPath = JSONPathItem[];
