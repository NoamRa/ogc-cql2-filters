import { Literal, LiteralType, Serializable } from "../types";
import Token from "./Token";

export type Expression = Serializable;

export class UnaryExpression implements Expression {
  operator: Token;
  right: Expression;

  constructor(operator: Token, right: Expression) {
    this.operator = operator;
    this.right = right;
  }

  toString() {
    return `${this.operator.literal.toString()}${this.right.toString()}`;
  }

  toJSON() {
    return { op: this.operator.literal, args: [this.right.toJSON()] };
  }
}

export class BinaryExpression implements Expression {
  left: Expression;
  operator: Token;
  right: Expression;

  constructor(left: Expression, operator: Token, right: Expression) {
    this.left = left;
    this.operator = operator;
    this.right = right;
  }

  toString() {
    return `${this.left.toString()} ${this.operator.lexeme} ${this.right.toString()}`;
  }

  toJSON() {
    return { op: this.operator.literal, args: [this.left.toJSON(), this.right.toJSON()] };
  }
}

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

export class VariableExpression implements Expression {
  name: Token;

  constructor(name: Token) {
    this.name = name;
  }

  toString() {
    return this.name.lexeme;
  }

  toJSON() {
    return {};
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

// export class PropertyExpression implements Expression {
//   name: string;

//   constructor(name: string) {
//     this.name = name;
//   }

//   toString() {
//     return this.name;
//   }

//   toJSON(): object {
//     return { property: this.name };
//   }
// }
