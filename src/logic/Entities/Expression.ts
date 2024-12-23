import { Arity, type OperatorMeta, operatorMetadata } from "../operatorMetadata";
import { LiteralPair, Serializable } from "../types";

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
  operator: OperatorExpression;
  right: Expression;

  constructor(operator: OperatorExpression, right: Expression) {
    this.operator = operator;
    this.right = right;
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
  left: Expression;
  operator: OperatorExpression;
  right: Expression;

  constructor(left: Expression, operator: OperatorExpression, right: Expression) {
    this.left = left;
    this.operator = operator;
    this.right = right;
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
  operator: OperatorExpression;
  args: Expression[];

  constructor(operator: OperatorExpression, args: Expression[]) {
    this.operator = operator;
    this.args = args;
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
  expression: Expression;

  constructor(expression: Expression) {
    this.expression = expression;
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
  literalPair: LiteralPair;

  constructor(literalPair: LiteralPair) {
    this.literalPair = literalPair;
  }

  toText() {
    if (this.literalPair.value === null) return "NULL";
    if (this.literalPair.value instanceof Date) {
      const { type, value } = this.#getDateValue();
      return `${type.toUpperCase()}('${value}')`;
    }
    if (this.literalPair.type === "boolean") {
      return this.literalPair.value.toString().toUpperCase();
    }
    return this.literalPair.value.toString();
  }

  toJSON() {
    if (this.literalPair.value instanceof Date) {
      const { type, value } = this.#getDateValue();
      return { [type]: value };
    }
    return this.literalPair.value;
  }

  // Date helpers
  #getDateValue(): DateValuePair {
    const date = (this.literalPair.value as Date).toISOString();
    return {
      value: this.literalPair.type === "date" ? date.split("T")[0] : date,
      type: this.literalPair.type as "date" | "timestamp",
    };
  }

  accept<ReturnType>(visitor: ExpressionVisitor<ReturnType>): ReturnType {
    return visitor.visitLiteralExpression(this);
  }
}

// unfortunately not possible to declare type inside class
interface DateValuePair {
  value: string;
  type: "date" | "timestamp";
}

export class PropertyExpression implements Expression {
  name: string;

  constructor(name: string) {
    this.name = name;
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
  operator: string;
  #meta: OperatorMeta;

  static getMetadata(operator: string): OperatorMeta {
    return (
      operatorMetadata[operator] ?? {
        label: operator,
        outputType: "unknown",
        inputTypes: ["unknown"],
        arity: Arity.Variadic,
        notation: "prefix",
      }
    );
  }

  constructor(operator: string) {
    this.operator = operator;
    this.#meta = OperatorExpression.getMetadata(this.operator);
  }

  toText() {
    return this.operator;
  }

  toJSON() {
    return this.operator;
  }

  accept<ReturnType>(visitor: ExpressionVisitor<ReturnType>): ReturnType {
    return visitor.visitOperatorExpression(this);
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
}

export class IsNullOperatorExpression implements Expression, OperatorMeta {
  expression: Expression;
  isNot: boolean;

  constructor(expression: Expression, isNot: boolean) {
    this.expression = expression;
    this.isNot = isNot;
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
