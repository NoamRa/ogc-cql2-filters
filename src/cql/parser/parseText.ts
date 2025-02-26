import {
  AdvancedComparisonExpression,
  ArrayExpression,
  BinaryExpression,
  Expression,
  FunctionExpression,
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
        consume("NULL", `Expect 'NULL' after '${not ? "IS NOT" : "IS"}' at character index ${peek().charIndex}.`);
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
      consume("AND", `Expect 'AND' after 'BETWEEN' at character index ${peek().charIndex}.`);
      const end = term();
      expr = new AdvancedComparisonExpression(new OperatorExpression(operator), [expr, start, end], not);
    }

    if (match("IN")) {
      const operator: Token = previous();
      consume("LEFT_PAREN", `Expect '(' after IN operator at character index ${peek().charIndex}.`);
      const values = [];
      do {
        values.push(term());
      } while (match("COMMA"));
      consume("RIGHT_PAREN", `Expect ')' after IN arguments at character index ${peek().charIndex}.`);
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
      consume("LEFT_PAREN", `Expect '(' after case-insensitive operator at character index ${peek().charIndex}.`);
      const right = unary();
      consume("RIGHT_PAREN", `Expect ')' after case-insensitive's value at character index ${peek().charIndex}.`);
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

    if (match("IDENTIFIER")) {
      const operator = previous();
      if (match("LEFT_PAREN")) {
        return funcExpr(operator);
      }

      return new PropertyExpression((previous().literal as string).toString());
    }

    if (match("LEFT_PAREN")) {
      const expr = expression();
      consume("RIGHT_PAREN", `Expect ')' after expression at character index ${peek().charIndex}.`);
      return new GroupingExpression(expr);
    }

    if (isAtEnd()) {
      // Handle edge case where we don't want to print EOF, but we've already advanced cursor
      current -= 1;
    }
    throw new ParseTextError(
      peek(),
      `Expect expression but found ${peek().lexeme} at character index ${peek().charIndex}.`,
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

    consume("RIGHT_PAREN", `Expect ')' after arguments at character index ${peek().charIndex}.`);
    return new FunctionExpression(new OperatorExpression(operator), args);
  }
  // #endregion

  // #region helpers
  function check(type: TokenType): boolean {
    if (isAtEnd()) return false;
    return peek().type === type;
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
