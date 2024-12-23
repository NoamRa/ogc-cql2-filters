import { ChangeEvent, ReactNode } from "react";
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

const logEvent = (e: ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
  console.log(e.target.value);
};

const ReactVisitor: ExpressionVisitor<ReactNode> = {
  visitBinaryExpression(expr: BinaryExpression): ReactNode {
    return (
      <>
        {expr.left.accept(ReactVisitor)} {expr.operator.accept(ReactVisitor)} {expr.right.accept(ReactVisitor)}
      </>
    );
  },

  visitGroupingExpression(expr: GroupingExpression): ReactNode {
    return <>( {expr.expression.accept(ReactVisitor)} )</>;
  },

  visitLiteralExpression(expr: LiteralExpression): ReactNode {
    switch (expr.literalPair.type) {
      case "string":
      case "number": {
        return <input type={expr.literalPair.type} value={expr.literalPair.value} onChange={logEvent} />;
      }

      case "boolean": {
        return (
          <select value={expr.literalPair.value.toString()} onChange={logEvent}>
            <option value={true.toString()}>True</option>
            <option value={false.toString()}>False</option>
          </select>
        );
      }

      case "date":
      case "timestamp": {
        const { type, value } = LiteralExpression.getDateValue(expr.literalPair);
        if (type === "date") {
          return <input type="date" value={value} onChange={logEvent} />;
        }

        return <input type="datetime-local" value={value.split("Z")[0]} onChange={logEvent} />;
      }

      case "null": {
        return <>null</>;
      }
    }
  },

  visitUnaryExpression(expr: UnaryExpression): ReactNode {
    return (
      <>
        {expr.operator.accept(ReactVisitor)}
        {expr.right.accept(ReactVisitor)}
      </>
    );
  },

  visitFunctionExpression(expr: FunctionExpression): ReactNode {
    return (
      <>
        {expr.operator.accept(ReactVisitor)}( {expr.args.map((arg) => arg.accept(ReactVisitor))} )
      </>
    );
  },

  visitPropertyExpression(expr: PropertyExpression): ReactNode {
    return <input type="text" defaultValue={expr.toText()} onChange={logEvent} />;
  },

  visitOperatorExpression(expr: OperatorExpression): ReactNode {
    const arithmeticOpe = ["+", "-", "*", "/"];
    const logicalOps = ["<", ">", ">=", "<=", "=", "<>"];

    if (arithmeticOpe.includes(expr.toText())) {
      return (
        <select value={expr.toText()} onChange={logEvent}>
          {arithmeticOpe.map((op) => (
            <option key={op} value={op}>
              {op}
            </option>
          ))}
        </select>
      );
    } else if (logicalOps.includes(expr.toText())) {
      return (
        <select value={expr.toText()} onChange={logEvent}>
          {logicalOps.map((op) => (
            <option key={op} value={op}>
              {op}
            </option>
          ))}
        </select>
      );
    }

    return <input type="text" value={expr.toText()} />;
  },

  visitIsNullOperatorExpression(expr: IsNullOperatorExpression): ReactNode {
    return (
      <select value={expr.isNot.toString()} onChange={logEvent}>
        <option value={true.toString()}>is null</option>
        <option value={false.toString()}>is not null</option>
      </select>
    );
  },
};

interface FilterRendererProps {
  expr: Expression;
}

export function FilterBuilder({ expr }: FilterRendererProps) {
  return expr.accept(ReactVisitor);
}
