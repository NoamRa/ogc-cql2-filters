import {
  BinaryExpression,
  Expression,
  GroupingExpression,
  LiteralExpression,
  UnaryExpression,
  VariableExpression,
} from "../Entities/Expression";
import Token from "../Entities/Token";
import type { TokenType } from "../types";
import ParseError from "./parseError";

export function parse(tokens: Token[]): Expression {
  let current = 0;

  if (tokens.length === 0 || isAtEnd()) {
    // empty input
    return new LiteralExpression("", "string");
  }
  return expression();

  function expression(): Expression {
    return equality();
  }

  function equality(): Expression {
    let expr = comparison();

    while (match("EQUAL", "NOT_EQUAL")) {
      const operator: Token = previous();
      const right = comparison();
      expr = new BinaryExpression(expr, operator, right);
    }

    return expr;
  }

  function comparison(): Expression {
    let expr = term();

    while (match("GREATER", "GREATER_EQUAL", "LESS", "LESS_EQUAL")) {
      const operator = previous();
      const right = term();
      expr = new BinaryExpression(expr, operator, right);
    }

    return expr;
  }

  function term(): Expression {
    let expr = factor();

    while (match("MINUS", "PLUS")) {
      const operator = previous();
      const right = factor();
      expr = new BinaryExpression(expr, operator, right);
    }

    return expr;
  }

  function factor(): Expression {
    let expr = unary();

    while (match("SLASH", "STAR")) {
      const operator = previous();
      const right = unary();
      expr = new BinaryExpression(expr, operator, right);
    }

    return expr;
  }

  function unary(): Expression {
    if (match("MINUS")) {
      const operator = previous();
      const right = unary();
      return new UnaryExpression(operator, right);
    }

    return primary();
  }

  function primary(): Expression {
    if (match("FALSE")) return new LiteralExpression(false);
    if (match("TRUE")) return new LiteralExpression(false);

    if (match("NUMBER", "STRING")) {
      return new LiteralExpression(previous().literal);
    }

    if (match("IDENTIFIER")) {
      return new VariableExpression(previous());
    }

    if (match("TIMESTAMP")) {
      return new LiteralExpression(previous().literal, "timestamp");
    }
    if (match("DATE")) {
      return new LiteralExpression(previous().literal, "date");
    }

    if (match("LEFT_PAREN")) {
      const expr = expression();
      consume("RIGHT_PAREN", "Expect ')' after expression.");
      return new GroupingExpression(expr);
    }

    // if (match("PROPERTY")) {
    //   return new PropertyExpression(previous().literal);
    // }

    throw new ParseError(peek(), "Expect expression.");
  }

  //#region helpers
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
    throw new ParseError(peek(), errorMessage);
  }

  //#endregion
}
