import type { LiteralPair, Scalar, TimeLiteral } from "../types";
import { Arity, type OperatorMeta, operatorMetadata } from "./operatorMetadata";
import type { Token } from "./Token";
import type { OperatorTokenType } from "./TokenType";

/**
 * Visitor pattern. See https://en.wikipedia.org/wiki/Visitor_pattern
 */
export interface ExpressionVisitor<TReturn, TContext = undefined> {
  visitAdvancedComparisonExpression(expr: AdvancedComparisonExpression, context?: TContext): TReturn;
  visitArrayExpression(expr: ArrayExpression, context?: TContext): TReturn;
  visitBinaryExpression(expr: BinaryExpression, context?: TContext): TReturn;
  visitFunctionExpression(expr: FunctionExpression, context?: TContext): TReturn;
  visitGroupingExpression(expr: GroupingExpression, context?: TContext): TReturn;
  visitIsNullOperatorExpression(expr: IsNullOperatorExpression, context?: TContext): TReturn;
  visitLiteralExpression(expr: LiteralExpression, context?: TContext): TReturn;
  visitOperatorExpression(expr: OperatorExpression, context?: TContext): TReturn;
  visitPropertyExpression(expr: PropertyExpression, context?: TContext): TReturn;
  visitUnaryExpression(expr: UnaryExpression, context?: TContext): TReturn;
}

/**
 * Expression objects represents a single node in CQL2 abstract syntax tree (AST).
 * All Expressions implement at least 3 methods:
 * @method toText() - returns the expression tree in text encoding
 * @method toJSON() - returns the expression tree in JSON encoding
 * @method accept(visitor,context?) - Using the Visitor pattern, accept method can perform operations on Expression objects
 * Depending on the given visitor object. The visitor object should implement all the visit functions (see ExpressionVisitor interface).
 * Additional context object can be passed to accept method.
 * Expression objects are immutable
 */
export interface Expression {
  toText(): string;
  toJSON(): Scalar | object | null;
  accept<TReturn, TContext>(visitor: ExpressionVisitor<TReturn, TContext>, context?: TContext): TReturn;
}

// #region combining expressions
/**
 * Unary expression accepts operator and one operand
 * Good for negation, ex "-3", or CASEI(Straße) and other prefix
 */
export class UnaryExpression implements Expression {
  readonly operator: OperatorExpression;
  readonly right: Expression;

  constructor(operator: OperatorExpression, right: Expression) {
    this.operator = operator;
    this.right = right;
    Object.freeze(this);
  }

  toText() {
    return this.operator.textFormatter(this.operator.toText(), this.right.toText());
  }

  toJSON() {
    return { op: this.operator.toJSON(), args: [this.right.toJSON()] };
  }

  accept<TReturn, TContext>(visitor: ExpressionVisitor<TReturn, TContext>, context?: TContext): TReturn {
    return visitor.visitUnaryExpression(this, context);
  }
}

/**
 * Binary expression accepts operator and two operands
 * Good for comparison operators and other infix operators
 */
export class BinaryExpression implements Expression {
  readonly left: Expression;
  readonly operator: OperatorExpression;
  readonly right: Expression;

  constructor(left: Expression, operator: OperatorExpression, right: Expression) {
    this.left = left;
    this.operator = operator;
    this.right = right;
    Object.freeze(this);
  }

  toText() {
    return this.operator.textFormatter(this.operator.toText(), this.left.toText(), this.right.toText());
  }

  toJSON() {
    return { op: this.operator.toJSON(), args: [this.left.toJSON(), this.right.toJSON()] };
  }

  accept<TReturn, TContext>(visitor: ExpressionVisitor<TReturn, TContext>, context?: TContext): TReturn {
    return visitor.visitBinaryExpression(this, context);
  }
}

/**
 * Function expression accepts operator and arbitrary number of operands
 * Good for... functions, unknown operators
 */
export class FunctionExpression implements Expression {
  readonly operator: OperatorExpression;
  readonly args: Expression[];

  constructor(operator: OperatorExpression, args: Expression[]) {
    this.operator = operator;
    this.args = args;
    Object.freeze(this);
  }

  toText() {
    return this.operator.textFormatter(this.operator.toText(), ...this.args.map((arg) => arg.toText()));
  }

  toJSON() {
    return { op: this.operator.toJSON(), args: this.args.map((arg) => arg.toJSON()) };
  }

  accept<TReturn, TContext>(visitor: ExpressionVisitor<TReturn, TContext>, context?: TContext): TReturn {
    return visitor.visitFunctionExpression(this, context);
  }
}

/**
 * AdvancedComparisonExpression handles LIKE, BETWEEN, and IN.
 * They are expressions and not operators because they have complex infix syntax (mixfix?) and can be negated:
 * @example depth BETWEEN 100.0 AND 150.0
 * @example depth NOT BETWEEN 100.0 AND 150.0
 * See https://docs.ogc.org/DRAFTS/21-065r3.html#advanced-comparison-operators
 */
export class AdvancedComparisonExpression implements Expression {
  readonly operator: OperatorExpression;
  readonly args: Expression[];
  readonly negate: boolean;

  constructor(operator: OperatorExpression, args: Expression[], negate = false) {
    this.operator = operator;
    this.args = args;
    this.negate = negate;
    Object.freeze(this);
  }

  toText() {
    return this.operator.textFormatter(
      this.operator.toText(),
      this.negate.toString(),
      ...this.args.map((arg) => arg.toText()),
    );

    // @ts-expect-error unreachable path
    return undefined as string;
  }

  toJSON() {
    const expr = { op: this.operator.toJSON(), args: this.args.map((arg) => arg.toJSON()) };
    return this.negate ? { op: "not", args: [expr] } : expr;
  }

  accept<TReturn, TContext>(visitor: ExpressionVisitor<TReturn, TContext>, context?: TContext): TReturn {
    return visitor.visitAdvancedComparisonExpression(this, context);
  }
}

export class GroupingExpression implements Expression {
  readonly expression: Expression;

  constructor(expression: Expression) {
    this.expression = expression;
    Object.freeze(this);
  }

  toText() {
    return `(${this.expression.toText()})`;
  }

  toJSON() {
    return this.expression.toJSON();
  }

  accept<TReturn, TContext>(visitor: ExpressionVisitor<TReturn, TContext>, context?: TContext): TReturn {
    return visitor.visitGroupingExpression(this, context);
  }
}

/**
 * ArrayExpression is good for list of values
 * Arrays are needed for coordinates, geometries, etc,
 * and are used as arguments for IN, A_CONTAINS functions.
 * https://docs.ogc.org/is/21-065r2/21-065r2.html#array-functions
 */
export class ArrayExpression implements Expression {
  readonly expressions: Expression[];

  constructor(expressions: Expression[]) {
    this.expressions = expressions;
    Object.freeze(this);
  }

  toText() {
    return `(${this.expressions.map((expr) => expr.toText()).join(", ")})`;
  }

  toJSON() {
    return this.expressions.map((expr) => expr.toJSON());
  }

  accept<TReturn, TContext>(visitor: ExpressionVisitor<TReturn, TContext>, context?: TContext): TReturn {
    return visitor.visitArrayExpression(this, context);
  }
}
// #endregion

// #region Atomic expressions
// literals, property, etc
export class LiteralExpression implements Expression {
  readonly literalPair: LiteralPair;

  constructor(literalPair: LiteralPair) {
    this.literalPair = literalPair;
    Object.freeze(this);
  }

  toText() {
    if (this.literalPair.type === "null") return "NULL";
    if (this.literalPair.type === "string") {
      // Wrap string with quotes only if the string is not empty
      return this.literalPair.value.length === 0 ? "" : `'${this.literalPair.value}'`;
    }
    if (LiteralExpression.isTimeLiteralPair(this.literalPair)) {
      const { type, value } = LiteralExpression.getDateValue(this.literalPair);
      return `${type.toUpperCase()}('${value}')`;
    }
    if (this.literalPair.type === "boolean") {
      return this.literalPair.value.toString().toUpperCase();
    }
    return this.literalPair.value.toString();
  }

  toJSON() {
    if (LiteralExpression.isTimeLiteralPair(this.literalPair)) {
      const { type, value } = LiteralExpression.getDateValue(this.literalPair);
      return { [type]: value };
    }
    return this.literalPair.value;
  }

  accept<TReturn, TContext>(visitor: ExpressionVisitor<TReturn, TContext>, context?: TContext): TReturn {
    return visitor.visitLiteralExpression(this, context);
  }

  // Date helpers
  static getDateValue(literalPair: TimeLiteral): DateValuePair {
    const date = literalPair.value.toISOString();
    return {
      value: literalPair.type === "date" ? date.split("T")[0] : date,
      type: literalPair.type,
    };
  }

  static isTimeLiteralPair(literalPair: LiteralPair): literalPair is TimeLiteral {
    return literalPair.value instanceof Date;
  }
}

// unfortunately not possible to declare type inside class
interface DateValuePair {
  value: string;
  type: "date" | "timestamp";
}

export class PropertyExpression implements Expression {
  readonly name: string;

  constructor(name: string) {
    this.name = name;
    Object.freeze(this);
  }

  toText() {
    return this.name;
  }

  toJSON() {
    return { property: this.name };
  }

  accept<TReturn, TContext>(visitor: ExpressionVisitor<TReturn, TContext>, context?: TContext): TReturn {
    return visitor.visitPropertyExpression(this, context);
  }
}

export class OperatorExpression implements Expression, OperatorMeta {
  readonly operator: Token;
  readonly #meta: OperatorMeta;

  constructor(operator: Token) {
    this.operator = operator;
    this.#meta = OperatorExpression.getMetadata(this.operator);
    Object.freeze(this);
  }

  toText() {
    return this.#meta.text;
  }

  toJSON() {
    return this.#meta.json;
  }

  accept<TReturn, TContext>(visitor: ExpressionVisitor<TReturn, TContext>, context?: TContext): TReturn {
    return visitor.visitOperatorExpression(this, context);
  }

  get text() {
    return this.#meta.text;
  }
  get json() {
    return this.#meta.json;
  }
  get label() {
    return this.#meta.label;
  }
  get arity() {
    return this.#meta.arity;
  }
  get textFormatter() {
    return this.#meta.textFormatter;
  }

  static getMetadata(operator: Token): OperatorMeta {
    const operatorMeta = operatorMetadata.get(operator.type as OperatorTokenType);
    if (operatorMeta) {
      return operatorMeta;
    }

    return {
      text: operator.lexeme,
      json: operator.lexeme,
      label: operator.lexeme,
      outputType: "unknown",
      inputTypes: ["unknown"],
      arity: Arity.Variadic,
      textFormatter: (op, ...args) => `${op}(${args.join(", ")})`,
    } as OperatorMeta;
  }
}

export class IsNullOperatorExpression implements Expression, OperatorMeta {
  readonly expression: Expression;
  readonly negate: boolean;

  constructor(expression: Expression, negate = false) {
    this.expression = expression;
    this.negate = negate;
    Object.freeze(this);
  }

  toText() {
    return `${this.expression.toText()} IS${this.negate ? " NOT" : ""} NULL`;
  }

  toJSON() {
    const isNullExpr = { op: "isNull", args: [this.expression.toJSON()] };
    if (this.negate) {
      return { op: "not", args: [isNullExpr] };
    }
    return isNullExpr;
  }

  accept<TReturn, TContext>(visitor: ExpressionVisitor<TReturn, TContext>, context?: TContext): TReturn {
    return visitor.visitIsNullOperatorExpression(this, context);
  }

  get text() {
    return this.negate ? "is not null" : "is null";
  }
  get json() {
    // TODO what to replace with "is not null" ?
    return this.negate ? "is not null" : "isNull";
  }
  get label() {
    return this.negate ? "is not null" : "is null";
  }
  get arity() {
    return Arity.Unary;
  }
  get textFormatter() {
    return (op: string, negate: string, arg: string) => `${arg} IS${negate ? " NOT" : ""} NULL`;
  }
}
// #endregion
