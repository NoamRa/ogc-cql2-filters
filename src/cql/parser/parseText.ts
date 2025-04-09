import {
  AdvancedComparisonExpression,
  ArrayExpression,
  BBoxExpression,
  BinaryExpression,
  Expression,
  FunctionExpression,
  GeometryCollectionExpression,
  GeometryExpression,
  GroupingExpression,
  IsNullOperatorExpression,
  LiteralExpression,
  OperatorExpression,
  PropertyExpression,
  UnaryExpression,
} from "../entities/Expression";
import { Token } from "../entities/Token";
import type { TokenType } from "../entities/TokenType";
import { ParseTextError } from "./ParseTextError";

export function parseText(tokens: Token[]): Expression {
  /**
   * Index of token in tokens where we currently read.
   */
  let current = 0;

  if (tokens.length === 0 || isAtEnd()) {
    // empty input
    return new LiteralExpression({ value: "", type: "string" });
  }
  return expression();

  /**
   * expression is the first function in precedence chain. Precedence chains in ascending order,
   * while the "Grammar" chains in descending order. The Grammar is what you will see below.
   * This is implicitly described in CQL2 BNF https://docs.ogc.org/DRAFTS/21-065r3.html#cql2-bnf
   *
   * Non-comprehensive precedence, ascending:
   * logical or
   * logical and
   * negation (NOT)
   * equality (equal, not equal)
   * comparison (greater than, smaller than, etc.)
   * arithmetic plus and minus
   * arithmetic multiplication and division
   * unary operators
   * primary literals (numbers, string, booleans, properties, dates, etc.)
   */
  function expression(): Expression {
    return or();
  }

  function or() {
    let expr = and();

    while (match("OR")) {
      const operator: Token = previous();
      const right = and();
      expr = new BinaryExpression(expr, new OperatorExpression(operator), right);
    }

    return expr;
  }

  function and() {
    let expr = not();

    while (match("AND")) {
      const operator: Token = previous();
      const right = not();
      expr = new BinaryExpression(expr, new OperatorExpression(operator), right);
    }

    return expr;
  }

  function not() {
    if (match("NOT")) {
      const operator = previous();
      const right = unary();
      return new UnaryExpression(new OperatorExpression(operator), right);
    }

    return equality();
  }

  function equality(): Expression {
    let expr = comparison();

    while (match("EQUAL", "NOT_EQUAL")) {
      const operator: Token = previous();
      const right = comparison();
      expr = new BinaryExpression(expr, new OperatorExpression(operator), right);
    }

    return expr;
  }

  function comparison(): Expression {
    let expr = advancedComparison();

    while (match("GREATER", "GREATER_EQUAL", "LESS", "LESS_EQUAL", "IS")) {
      const operator = previous();
      if (operator.type === "IS") {
        const not = match("NOT");
        consume("NULL", `Expected 'NULL' after '${not ? "IS NOT" : "IS"}' at character index ${peek().charIndex}.`);
        expr = new IsNullOperatorExpression(expr, not);
        continue;
      }

      const right = advancedComparison();
      expr = new BinaryExpression(expr, new OperatorExpression(operator), right);
    }

    return expr;
  }

  function advancedComparison(): Expression {
    // Advanced comparison operators go here - LIKE, BETWEEN, IN
    // https://docs.ogc.org/DRAFTS/21-065r3.html#advanced-comparison-operators

    // Note to self: using 'term' below, and not 'expression', because I _think_ it makes sense to have comparison expressions or "higher",
    // which produce boolean values, as operands of advanced comparison, which usually has string, number, dates, etc as arguments
    let expr = term();
    const not = match("NOT");

    if (match("LIKE")) {
      const operator: Token = previous();
      const pattern = term();
      expr = new AdvancedComparisonExpression(new OperatorExpression(operator), [expr, pattern], not);
    }

    if (match("BETWEEN")) {
      const operator: Token = previous();
      const start = term();
      consume("AND", `Expected 'AND' after 'BETWEEN' at character index ${peek().charIndex}.`);
      const end = term();
      expr = new AdvancedComparisonExpression(new OperatorExpression(operator), [expr, start, end], not);
    }

    if (match("IN")) {
      const operator: Token = previous();
      consume("LEFT_PAREN", `Expected '(' after IN operator at character index ${peek().charIndex}.`);
      const values = [];
      do {
        values.push(term());
      } while (match("COMMA"));
      consume("RIGHT_PAREN", `Expected ')' after IN arguments at character index ${peek().charIndex}.`);
      expr = new AdvancedComparisonExpression(
        new OperatorExpression(operator),
        [expr, new ArrayExpression(values)],
        not,
      );
    }

    return expr;
  }

  function term(): Expression {
    let expr = factor();

    while (match("MINUS", "PLUS")) {
      const operator = previous();
      const right = factor();
      expr = new BinaryExpression(expr, new OperatorExpression(operator), right);
    }

    return expr;
  }

  function factor(): Expression {
    let expr = unary();

    while (match("SLASH", "STAR")) {
      const operator = previous();
      const right = unary();
      expr = new BinaryExpression(expr, new OperatorExpression(operator), right);
    }

    return expr;
  }

  function unary(): Expression {
    if (match("CASEI", "ACCENTI")) {
      const operator = previous();
      consume("LEFT_PAREN", `Expected '(' after case-insensitive operator at character index ${peek().charIndex}.`);
      const right = unary();
      consume("RIGHT_PAREN", `Expected ')' after case-insensitive's value at character index ${peek().charIndex}.`);
      return new UnaryExpression(new OperatorExpression(operator), right);
    }

    return primary();
  }

  function primary(): Expression {
    if (match("TRUE")) return new LiteralExpression({ value: true, type: "boolean" });
    if (match("FALSE")) return new LiteralExpression({ value: false, type: "boolean" });
    if (match("NULL")) return new LiteralExpression({ value: null, type: "null" });

    if (match("NUMBER")) {
      return new LiteralExpression({ value: previous().literal as number, type: "number" });
    }
    if (match("STRING")) {
      return new LiteralExpression({ value: previous().literal as string, type: "string" });
    }

    if (match("TIMESTAMP")) {
      return new LiteralExpression({ value: previous().literal as Date, type: "timestamp" });
    }
    if (match("DATE")) {
      return new LiteralExpression({ value: previous().literal as Date, type: "date" });
    }

    // #region spatial
    if (match("BBOX")) {
      return bboxExpr();
    }

    if (match("POINT")) {
      consume("LEFT_PAREN", `Expected '(' after POINT at character index ${peek().charIndex}.`);
      const expr = new GeometryExpression("Point", coordinateExpr());
      consume("RIGHT_PAREN", `Expected ')' after POINT's coordinates at character index ${peek().charIndex}.`);
      return expr;
    }
    if (match("MULTIPOINT")) {
      consume("LEFT_PAREN", `Expected '(' after MULTIPOINT at character index ${peek().charIndex}.`);
      const expr = new GeometryExpression("MultiPoint", coordinatesExpr());
      consume("RIGHT_PAREN", `Expected ')' after MULTIPOINT's coordinates at character index ${peek().charIndex}.`);
      return expr;
    }

    if (match("LINESTRING")) {
      consume("LEFT_PAREN", `Expected '(' after LINESTRING at character index ${peek().charIndex}.`);
      const expr = new GeometryExpression("LineString", coordinatesExpr());
      consume("RIGHT_PAREN", `Expected ')' after LINESTRING's coordinates at character index ${peek().charIndex}.`);
      return expr;
    }
    if (match("MULTILINESTRING")) {
      consume("LEFT_PAREN", `Expected '(' after MULTILINESTRING at character index ${peek().charIndex}.`);
      const lineStrings = [];
      do {
        consume("LEFT_PAREN", `Expected '(' opening line string at character index ${peek().charIndex}.`);
        lineStrings.push(new ArrayExpression(coordinatesExpr()));
        consume("RIGHT_PAREN", `Expected ')' closing line string at character index ${peek().charIndex}.`);
      } while (match("COMMA"));
      const expr = new GeometryExpression("MultiLineString", lineStrings);
      consume(
        "RIGHT_PAREN",
        `Expected ')' after MULTILINESTRING's coordinates at character index ${peek().charIndex}.`,
      );
      return expr;
    }

    if (match("POLYGON")) {
      consume("LEFT_PAREN", `Expected '(' after POLYGON at character index ${peek().charIndex}.`);
      const linearRings = [];
      do {
        consume("LEFT_PAREN", `Expected '(' opening linear ring at character index ${peek().charIndex}.`);
        linearRings.push(new ArrayExpression(coordinatesExpr()));
        consume("RIGHT_PAREN", `Expected ')' closing linear ring at character index ${peek().charIndex}.`);
      } while (match("COMMA"));

      const expr = new GeometryExpression("Polygon", linearRings);
      consume("RIGHT_PAREN", `Expected ')' after POLYGON's coordinates at character index ${peek().charIndex}.`);
      return expr;
    }
    if (match("MULTIPOLYGON")) {
      consume("LEFT_PAREN", `Expected '(' after MULTIPOLYGON at character index ${peek().charIndex}.`);
      const polygons = [];
      do {
        consume("LEFT_PAREN", `Expected '(' opening polygon at character index ${peek().charIndex}.`);
        const linearRings = [];
        do {
          consume("LEFT_PAREN", `Expected '(' opening linear ring at character index ${peek().charIndex}.`);
          linearRings.push(new ArrayExpression(coordinatesExpr()));
          consume("RIGHT_PAREN", `Expected ')' closing linear ring at character index ${peek().charIndex}.`);
        } while (match("COMMA"));
        polygons.push(new ArrayExpression(linearRings));
        consume("RIGHT_PAREN", `Expected ')' closing polygon at character index ${peek().charIndex}.`);
      } while (match("COMMA"));

      const expr = new GeometryExpression("MultiPolygon", polygons);
      consume("RIGHT_PAREN", `Expected ')' after MULTIPOLYGON's coordinates at character index ${peek().charIndex}.`);
      return expr;
    }

    if (match("GEOMETRYCOLLECTION")) {
      consume("LEFT_PAREN", `Expected '(' after GEOMETRYCOLLECTION at character index ${peek().charIndex}.`);
      const geometries = [];
      do {
        geometries.push(expression());
      } while (match("COMMA"));
      const expr = new GeometryCollectionExpression(geometries);
      consume(
        "RIGHT_PAREN",
        `Expected ')' after GEOMETRYCOLLECTION's geometries at character index ${peek().charIndex}.`,
      );
      return expr;
    }
    // #endregion

    if (match("IDENTIFIER")) {
      const operator = previous();
      if (match("LEFT_PAREN")) {
        return funcExpr(operator);
      }

      return new PropertyExpression((previous().literal as string).toString());
    }

    if (match("LEFT_PAREN")) {
      const expr = expression();
      consume("RIGHT_PAREN", `Expected ')' after expression at character index ${peek().charIndex}.`);
      return new GroupingExpression(expr);
    }

    if (isAtEnd()) {
      // Handle edge case where we don't want to print EOF, but we've already advanced cursor
      current -= 1;
    }
    throw new ParseTextError(
      peek(),
      `Expected expression but found ${peek().lexeme} at character index ${peek().charIndex}.`,
    );
  }

  // #region sub-logic
  function funcExpr(operator: Token) {
    const args = [];
    if (!check("RIGHT_PAREN")) {
      do {
        args.push(expression());
      } while (match("COMMA"));
    }

    consume("RIGHT_PAREN", `Expected ')' after arguments at character index ${peek().charIndex}.`);
    return new FunctionExpression(new OperatorExpression(operator), args);
  }

  function coordinateExpr() {
    const position: Expression[] = [];

    while (!check("RIGHT_PAREN", "COMMA")) {
      position.push(expression());
    }

    const numberOfCoordinates = position.length;
    if (numberOfCoordinates === 2 || numberOfCoordinates === 3) {
      // Happy path
      return position;
    }

    throw new ParseTextError(
      peek(),
      `Expected coordinate to have two or three positions, but found ${numberOfCoordinates}.`,
    );
  }

  function coordinatesExpr() {
    const coordinates: Expression[] = [];
    do {
      // consume("LEFT_PAREN", `Expected '(' at character index ${peek().charIndex}.`);
      coordinates.push(new ArrayExpression(coordinateExpr()));
      // consume("RIGHT_PAREN", `Expected ')' at character index ${peek().charIndex}.`);
    } while (match("COMMA"));
    return coordinates;
  }

  // /**
  //  * Constructs a list of positions lists (nested).
  //  * @returns {Position[]}
  //  */
  // function positionsArray(wrapped = true): Position[][] {
  //   const coordinates = [];
  //   do {
  //     consume("LEFT_PAREN", `Expected '(' at character index ${peek().charIndex}.`);
  //     coordinates.push(positions(wrapped));
  //     consume("RIGHT_PAREN", `Expected ')' at character index ${peek().charIndex}.`);
  //   } while (match("COMMA"));
  //   return coordinates;
  // }

  function bboxExpr() {
    consume("LEFT_PAREN", `Expected '(' after BBOX at character index ${peek().charIndex}.`);
    const coordinates = [];
    if (!check("RIGHT_PAREN")) {
      do {
        coordinates.push(expression());
      } while (match("COMMA"));
    }
    consume("RIGHT_PAREN", `Expected ')' after BBOX's coordinates at character index ${peek().charIndex}.`);

    const numberOfCoords = coordinates.length;
    if (numberOfCoords === 4 || numberOfCoords === 6) {
      return new BBoxExpression(coordinates);
    }

    throw new ParseTextError(peek(), `Expected BBOX to have either 4 or 6 coordinates, but found ${numberOfCoords}.`);
  }
  // #endregion

  // #region helpers
  function check(...types: TokenType[]): boolean {
    if (isAtEnd()) return false;
    return types.includes(peek().type);
  }

  function peek(): Token {
    return tokens[current];
  }

  function isAtEnd(): boolean {
    return peek().type == "EOF";
  }

  function advance(): Token {
    if (!isAtEnd()) {
      current += 1;
    }
    return previous();
  }

  function previous() {
    return tokens[current - 1];
  }

  function match(...types: TokenType[]): boolean {
    for (const type of types) {
      if (check(type)) {
        advance();
        return true;
      }
    }
    return false;
  }

  function consume(type: TokenType, errorMessage: string): Token {
    if (check(type)) return advance();
    throw new ParseTextError(peek(), errorMessage);
  }

  // #endregion
}
