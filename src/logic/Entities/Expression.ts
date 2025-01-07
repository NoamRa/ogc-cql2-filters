import { LiteralPair, Serializable, TimeLiteral } from "../types";
import { Arity, type OperatorMeta, operatorMetadata } from "./operatorMetadata";
import Token from "./Token";
import { OperatorTokenType } from "./TokenType";

export interface ExpressionVisitor<ReturnType> {
  visitBinaryExpression(expr: BinaryExpression): ReturnType;
  visitGroupingExpression(expr: GroupingExpression): ReturnType;
  visitLiteralExpression(expr: LiteralExpression): ReturnType;
  visitUnaryExpression(expr: UnaryExpression): ReturnType;
  visitFunctionExpression(expr: FunctionExpression): ReturnType;
  visitPropertyExpression(expr: PropertyExpression): ReturnType;
  visitOperatorExpression(expr: OperatorExpression): ReturnType;
  visitIsNullOperatorExpression(expr: IsNullOperatorExpression): ReturnType;
}

export interface Expression extends Serializable {
  accept<ReturnType>(visitor: ExpressionVisitor<ReturnType>): ReturnType;
}

// #region combining expressions
/**
 * Unary expression accepts operator and one operand
 * Good for negation, ex "-3", or "not null" and other prefix
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
    return this.operator.notation === "prefix" ?
        `${this.operator.toText()} ${this.right.toText()}`
      : `${this.right.toText()} ${this.operator.toText()}`;
  }

  toJSON() {
    return { op: this.operator.toJSON(), args: [this.right.toJSON()] };
  }

  accept<ReturnType>(visitor: ExpressionVisitor<ReturnType>): ReturnType {
    return visitor.visitUnaryExpression(this);
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
    return `${this.left.toText()} ${this.operator.toText()} ${this.right.toText()}`;
  }

  toJSON() {
    return { op: this.operator.toJSON(), args: [this.left.toJSON(), this.right.toJSON()] };
  }

  accept<ReturnType>(visitor: ExpressionVisitor<ReturnType>): ReturnType {
    return visitor.visitBinaryExpression(this);
  }
}

/**
 * Function expression accepts operator and arbitrary number of operands
 * Good for... functions
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
    return `${this.operator.toText()}(${this.args.map((arg) => arg.toText()).join(", ")})`;
  }

  toJSON() {
    return { op: this.operator.toJSON(), args: this.args.map((arg) => arg.toJSON()) };
  }

  accept<ReturnType>(visitor: ExpressionVisitor<ReturnType>): ReturnType {
    return visitor.visitFunctionExpression(this);
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

  accept<ReturnType>(visitor: ExpressionVisitor<ReturnType>): ReturnType {
    return visitor.visitGroupingExpression(this);
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

  accept<ReturnType>(visitor: ExpressionVisitor<ReturnType>): ReturnType {
    return visitor.visitLiteralExpression(this);
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

  accept<ReturnType>(visitor: ExpressionVisitor<ReturnType>): ReturnType {
    return visitor.visitPropertyExpression(this);
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

  accept<ReturnType>(visitor: ExpressionVisitor<ReturnType>): ReturnType {
    return visitor.visitOperatorExpression(this);
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
  get notation() {
    return this.#meta.notation;
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
      notation: "prefix",
    } as OperatorMeta;
  }
}

export class IsNullOperatorExpression implements Expression, OperatorMeta {
  readonly expression: Expression;
  readonly isNot: boolean;

  constructor(expression: Expression, isNot: boolean) {
    this.expression = expression;
    this.isNot = isNot;
    Object.freeze(this);
  }

  toText() {
    return `${this.expression.toText()} IS${this.isNot ? " NOT" : ""} NULL`;
  }

  toJSON() {
    const isNullExpr = { op: "isNull", args: [this.expression.toJSON()] };
    if (this.isNot) {
      return { op: "not", args: [isNullExpr] };
    }
    return isNullExpr;
  }

  accept<ReturnType>(visitor: ExpressionVisitor<ReturnType>): ReturnType {
    return visitor.visitIsNullOperatorExpression(this);
  }

  get text() {
    return this.isNot ? "is not null" : "is null";
  }
  get json() {
    return this.isNot ? "is not null" : "is null";
  }
  get label() {
    return this.isNot ? "is not null" : "is null";
  }
  get arity() {
    return Arity.Unary;
  }
  get notation() {
    return "postfix" as const;
  }
}
// #endregion
