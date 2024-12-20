import { ReactNode } from "react";
import {
  BinaryExpression,
  Expression,
  ExpressionVisitor,
  FunctionExpression,
  GroupingExpression,
  IsNullOperatorExpression,
  LiteralExpression,
  OperatorExpression,
  PropertyExpression,
  UnaryExpression,
} from "../../logic/Entities/Expression";

const visitor: ExpressionVisitor<ReactNode> = {
  visitBinaryExpression(expr: BinaryExpression): ReactNode {
    return (
      <>
        {expr.left.accept(visitor)} {expr.operator.accept(visitor)} {expr.right.accept(visitor)}
      </>
    );
  },

  visitGroupingExpression(expr: GroupingExpression): ReactNode {
    return <>( {expr.expression.accept(visitor)} )</>;
  },

  visitLiteralExpression(expr: LiteralExpression): ReactNode {
    switch (expr.literalPair.type) {
      case "string":
      case "number": {
        return <input type={expr.literalPair.type} defaultValue={expr.literalPair.value} />;
      }

      case "boolean": {
        return (
          <select>
            <option selected={expr.literalPair.value}>True</option>
            <option selected={!expr.literalPair.value}>False</option>
          </select>
        );
      }

      case "date":
      case "timestamp": {
        return <input type="date" defaultValue={expr.toText()} />;
      }

      case "null": {
        return <>null</>;
      }
    }
  },

  visitUnaryExpression(expr: UnaryExpression): ReactNode {
    return (
      <>
        {expr.operator.accept(visitor)}
        {expr.right.accept(visitor)}
      </>
    );
  },

  visitFunctionExpression(expr: FunctionExpression): ReactNode {
    return (
      <>
        {expr.operator.accept(visitor)}( {expr.args.map((arg) => arg.accept(visitor))} )
      </>
    );
  },

  visitPropertyExpression(expr: PropertyExpression): ReactNode {
    return <input type="text" defaultValue={expr.toText()} />;
  },

  visitOperatorExpression(expr: OperatorExpression): ReactNode {
    console.log(expr.toText());
    const arithmeticOpe = ["+", "-", "*", "/"];
    const logicalOps = ["<", ">", ">=", "<=", "=", "<>"];

    if (arithmeticOpe.includes(expr.toText())) {
      return (
        <select>
          {arithmeticOpe.map((op) => (
            <option key={op} selected={expr.toText() === op}>
              {op}
            </option>
          ))}
        </select>
      );
    } else if (logicalOps.includes(expr.toText())) {
      return (
        <select>
          {logicalOps.map((op) => (
            <option key={op} selected={expr.toText() === op}>
              {op}
            </option>
          ))}
        </select>
      );
    }

    return <input type="text" defaultValue={expr.toText()} />;
  },

  visitIsNullOperatorExpression(expr: IsNullOperatorExpression): ReactNode {
    return (
      <select>
        <option selected={!expr.isNot}>is null</option>
        <option selected={expr.isNot}>is not null</option>
      </select>
    );
  },
};
// const visitor = new FilterVisitor();

interface FilterRendererProps {
  expr: Expression;
}

export function FilterRenderer({ expr }: FilterRendererProps) {
  return expr.accept(visitor);
}
