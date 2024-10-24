import { Literal, LiteralType, Serializable } from "../types";
import Token from "./Token";

export type Expression = Serializable;

//#region combining expressions
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

  toString() {
    return `${this.operator.toString()}${this.right.toString()}`;
  }

  toJSON() {
    return { op: this.operator.toString(), args: [this.right.toJSON()] };
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

  toString() {
    return `${this.left.toString()} ${this.operator.toString()} ${this.right.toString()}`;
  }

  toJSON() {
    return { op: this.operator.toString(), args: [this.left.toJSON(), this.right.toJSON()] };
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

  toString() {
    return `${this.operator.toString()}(${this.args.map((arg) => arg.toString()).join(", ")})`;
  }

  toJSON() {
    return { op: this.operator.toString(), args: this.args.map((arg) => arg.toJSON()) };
  }
}

export class GroupingExpression implements Expression {
  expression: Expression;

  constructor(expression: Expression) {
    this.expression = expression;
  }

  toString() {
    return `(${this.expression.toString()})`;
  }

  toJSON() {
    return this.expression.toJSON();
  }
}
//#endregion

//#region Atomic expressions
// literals, property, etc
export class LiteralExpression implements Expression {
  value: Literal;
  type: LiteralType;

  constructor(value: Literal, type?: LiteralType) {
    this.value = value;
    this.type = type ?? (typeof value as LiteralType);
  }

  toString() {
    if (this.value instanceof Date) {
      const date = this.value.toISOString();
      return this.type === "date" ? date.split("T")[0] : date;
    }
    return this.value.toString();
  }

  toJSON() {
    if (this.value instanceof Date) {
      const date = this.value.toISOString();
      return { [this.type]: this.type === "date" ? date.split("T")[0] : date };
    }
    return this.value;
  }
}

export class PropertyExpression implements Expression {
  name: string;

  constructor(name: string) {
    this.name = name;
  }

  toString() {
    return this.name;
  }

  toJSON() {
    return { property: this.name };
  }
}

export class OperatorExpression implements Expression {
  operator: Token;

  constructor(operator: Token) {
    this.operator = operator;
  }

  toString() {
    return this.operator.literal.toString();
  }

  toJSON() {
    return { op: this.operator.literal.toString() };
  }
}
//#endregion
