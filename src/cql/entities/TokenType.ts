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
  // https://www.opengis.net/spec/cql2/1.0/req/advanced-comparison-operators
  | "LIKE"
  | "BETWEEN"
  | "IN"

  // Insensitive comparison operators
  // https://www.opengis.net/spec/cql2/1.0/req/case-insensitive-comparison
  // https://www.opengis.net/spec/cql2/1.0/req/accent-insensitive-comparison
  | "CASEI"
  | "ACCENTI"

  // Spatial operators
  // https://www.opengis.net/spec/cql2/1.0/req/spatial-functions
  | "S_CONTAINS"
  | "S_CROSSES"
  | "S_DISJOINT"
  | "S_EQUALS"
  | "S_INTERSECTS"
  | "S_OVERLAPS"
  | "S_TOUCHES"
  | "S_WITHIN";

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

  // Keywords
  | "TRUE" // TRUE
  | "FALSE" // FALSE
  | "TIMESTAMP" // timestamp | TIMESTAMP
  | "DATE" // date | DATE
  | "INTERVAL"

  // Tokens IS and NULL are not considered operators (at least for now)
  | "IS"
  | "NULL"

  // Literals
  | "IDENTIFIER"
  | "STRING"
  | "NUMBER"
  // Spatial literals
  | "BBOX"
  | "POINT"
  | "MULTIPOINT"
  | "LINESTRING"
  | "MULTILINESTRING"
  | "POLYGON"
  | "MULTIPOLYGON"
  | "GEOMETRYCOLLECTION"

  // That's all, folks
  | "EOF";
