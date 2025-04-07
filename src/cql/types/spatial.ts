/**
 * In order to keep things simple, naming follows GeoJSON format convention
 * https://datatracker.ietf.org/doc/html/rfc7946
 */
export type GeometryType = "Point" | "MultiPoint" | "LineString" | "MultiLineString" | "Polygon" | "MultiPolygon";
export type SpatialType = GeometryType | "bbox" | "GeometryCollection";
