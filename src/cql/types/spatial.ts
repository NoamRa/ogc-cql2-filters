export type SpatialLiteralPair =
  | BBoxLiteral
  | PointLiteral
  | LineStringLiteral
  | PolygonLiteral
  | MultiPointLiteral
  | MultiLineStringLiteral
  | MultiPolygonLiteral
  | GeometryCollectionLiteral;

type Position2D = [number, number];
type Position3D = [number, number, number];
export type Position = Position2D | Position3D;

type BBox2D = [...Position2D, ...Position2D];
type BBox3D = [...Position3D, ...Position3D];
export type BBox = BBox2D | BBox3D;

export type LineString = Position[];
export type Polygon = Position[][];
export type MultiPoint = Position[];
export type MultiLineString = LineString[];
export type MultiPolygon = Polygon[];
export type Geometry = Position | LineString | Polygon | MultiPoint | MultiLineString | MultiPolygon;
export type GeometryCollection = Geometry[];

export type SpatialLiteral =
  | BBox
  | Position
  | LineString
  | Polygon
  | MultiPoint
  | MultiLineString
  | MultiPolygon
  | GeometryCollection;

export type SpatialLiteralType =
  | "bbox"
  | "point"
  | "lineString"
  | "polygon"
  | "multiPoint"
  | "multiLineString"
  | "multiPolygon"
  | "geometryCollection";

interface SpatialLiteralPairBase {
  value: SpatialLiteral;
  type: SpatialLiteralType;
}

export interface BBoxLiteral extends SpatialLiteralPairBase {
  type: "bbox";
  value: BBox;
}
export interface PointLiteral extends SpatialLiteralPairBase {
  type: "point";
  value: Position;
}
export interface LineStringLiteral extends SpatialLiteralPairBase {
  type: "lineString";
  value: LineString;
}
export interface PolygonLiteral extends SpatialLiteralPairBase {
  type: "polygon";
  value: Polygon;
}
export interface MultiPointLiteral extends SpatialLiteralPairBase {
  type: "multiPoint";
  value: MultiPoint;
}
export interface MultiLineStringLiteral extends SpatialLiteralPairBase {
  type: "multiLineString";
  value: MultiLineString;
}
export interface MultiPolygonLiteral extends SpatialLiteralPairBase {
  type: "multiPolygon";
  value: MultiPolygon;
}
export interface GeometryCollectionLiteral extends SpatialLiteralPairBase {
  type: "geometryCollection";
  value: GeometryCollection;
}
