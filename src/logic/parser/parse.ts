import {
  BinaryExpression,
  Expression,
  GroupingExpression,
  LiteralExpression,
  UnaryExpression,
  PropertyExpression,
  FunctionExpression,
  OperatorExpression,
} from "../Entities/Expression";
import Token from "../Entities/Token";
import type { TokenType } from "../types";
import ParseError from "./parseError";

export default function parse(tokens: Token[]): Expression {
  /**
   * Index of token in tokens where we currently read.
   */
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
      expr = new BinaryExpression(expr, new OperatorExpression(operator), right);
    }

    return expr;
  }

  function comparison(): Expression {
    let expr = term();

    while (match("GREATER", "GREATER_EQUAL", "LESS", "LESS_EQUAL")) {
      const operator = previous();
      const right = term();
      expr = new BinaryExpression(expr, new OperatorExpression(operator), right);
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
    if (match("MINUS")) {
      const operator = previous();
      const right = unary();
      return new UnaryExpression(new OperatorExpression(operator), right);
    }

    return primary();
  }

  function func(operator: Token) {
    const args = [];
    if (!check("RIGHT_PAREN")) {
      do {
        args.push(expression());
      } while (match("COMMA"));
    }

    consume("RIGHT_PAREN", "Expect ')' after arguments.");
    return new FunctionExpression(new OperatorExpression(operator), args);
  }

  function primary(): Expression {
    if (match("TRUE")) return new LiteralExpression(true);
    if (match("FALSE")) return new LiteralExpression(false);

    if (match("NUMBER", "STRING")) {
      return new LiteralExpression(previous().literal);
    }

    if (match("TIMESTAMP")) {
      return new LiteralExpression(previous().literal, "timestamp");
    }
    if (match("DATE")) {
      return new LiteralExpression(previous().literal, "date");
    }

    if (match("IDENTIFIER")) {
      const operator = previous();
      if (match("LEFT_PAREN")) {
        return func(operator);
      }

      return new PropertyExpression(previous().literal.toString());
    }

    if (match("LEFT_PAREN")) {
      const expr = expression();
      consume("RIGHT_PAREN", `Expect ')' after expression at character index ${peek().charIndex}.`);
      return new GroupingExpression(expr);
    }

    throw new ParseError(
      peek(),
      `Expect expression but found ${peek().lexeme} at character index ${peek().charIndex}.`,
    );
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
