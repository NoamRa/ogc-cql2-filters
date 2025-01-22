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
} from "../../../logic/Entities/Expression";
import { JSONPath } from "../../../logic/types";

interface ReactVisitorContext {
  path: JSONPath;
  updateNode: (path: JSONPath, value: unknown) => void;
}

const ReactVisitor: ExpressionVisitor<ReactNode, ReactVisitorContext> = {
  visitBinaryExpression: function RenderBinaryExpression(
    expr: BinaryExpression,
    { path, updateNode }: ReactVisitorContext,
  ): ReactNode {
    return (
      <>
        {expr.left.accept(ReactVisitor, { updateNode, path: [...path, "args", 0] })}{" "}
        {expr.operator.accept(ReactVisitor, { updateNode, path: [...path, "op"] })}{" "}
        {expr.right.accept(ReactVisitor, { updateNode, path: [...path, "args", 1] })}
      </>
    );
  },

  visitGroupingExpression: function RenderGroupingExpression(
    expr: GroupingExpression,
    { path, updateNode }: ReactVisitorContext,
  ): ReactNode {
    return <>( {expr.expression.accept(ReactVisitor, { path, updateNode })} )</>;
  },

  visitLiteralExpression: function RenderLiteralExpression(
    expr: LiteralExpression,
    { path, updateNode }: ReactVisitorContext,
  ): ReactNode {
    switch (expr.literalPair.type) {
      case "string": {
        return (
          <input
            type={expr.literalPair.type}
            value={expr.literalPair.value}
            onChange={(e) => {
              updateNode(path, e.target.value);
            }}
            placeholder="String"
          />
        );
      }
      case "number": {
        return (
          <input
            type={expr.literalPair.type}
            value={expr.literalPair.value}
            onChange={(e) => {
              const value = Number.isFinite(e.target.valueAsNumber) ? e.target.valueAsNumber : 0;
              updateNode(path, value);
            }}
            placeholder="Number"
          />
        );
      }

      case "boolean": {
        return (
          <select
            value={expr.literalPair.value.toString()}
            onChange={(e) => {
              updateNode(path, e.target.value);
            }}
          >
            <option value={true.toString()}>True</option>
            <option value={false.toString()}>False</option>
          </select>
        );
      }

      case "date":
      case "timestamp": {
        const { type, value } = LiteralExpression.getDateValue(expr.literalPair);
        if (type === "date") {
          return (
            <input
              type="date"
              value={value}
              onChange={(e) => {
                updateNode(path, e.target.value);
              }}
              placeholder="Date (with time)"
            />
          );
        }

        return (
          <input
            type="datetime-local"
            value={value.split("Z")[0]}
            onChange={(e) => {
              updateNode(path, e.target.value);
            }}
            placeholder="Date (without time)"
          />
        );
      }

      case "null": {
        return <>null</>;
      }
    }
  },

  visitUnaryExpression: function RenderUnaryExpression(
    expr: UnaryExpression,
    { path, updateNode }: ReactVisitorContext,
  ): ReactNode {
    return (
      <>
        {expr.operator.accept(ReactVisitor, { updateNode, path: [...path, "op"] })}
        {expr.right.accept(ReactVisitor, { updateNode, path: [...path, "args", 0] })}
      </>
    );
  },

  visitFunctionExpression: function RenderFunctionExpression(
    expr: FunctionExpression,
    { path, updateNode }: ReactVisitorContext,
  ): ReactNode {
    return (
      <>
        {expr.operator.accept(ReactVisitor, { updateNode, path: [...path, "op"] })}({" "}
        {expr.args.map((arg, index) => arg.accept(ReactVisitor, { updateNode, path: [...path, "args", index] }))} )
      </>
    );
  },

  visitPropertyExpression: function RenderPropertyExpression(
    expr: PropertyExpression,
    { path, updateNode }: ReactVisitorContext,
  ): ReactNode {
    return (
      <input
        type="text"
        defaultValue={expr.toText()}
        onChange={(e) => {
          const property = e.target.value !== "" ? e.target.value : "property_name";
          updateNode(path, { property });
        }}
        placeholder="Property name"
      />
    );
  },

  visitOperatorExpression: function RenderOperatorExpression(
    expr: OperatorExpression,
    { path, updateNode }: ReactVisitorContext,
  ): ReactNode {
    const arithmeticOpe = ["+", "-", "*", "/"];
    const logicalOps = ["<", ">", ">=", "<=", "=", "<>"];

    if (arithmeticOpe.includes(expr.toText())) {
      return (
        <select
          value={expr.toText()}
          onChange={(e) => {
            updateNode(path, e.target.value);
          }}
        >
          {arithmeticOpe.map((op) => (
            <option key={op} value={op}>
              {op}
            </option>
          ))}
        </select>
      );
    } else if (logicalOps.includes(expr.toText())) {
      return (
        <select
          value={expr.toText()}
          onChange={(e) => {
            updateNode(path, e.target.value);
          }}
        >
          {logicalOps.map((op) => (
            <option key={op} value={op}>
              {op}
            </option>
          ))}
        </select>
      );
    }

    return (
      <input
        type="text"
        value={expr.toText()}
        onChange={(e) => {
          updateNode(path, e.target.value);
        }}
        placeholder="Operator"
      />
    );
  },

  visitIsNullOperatorExpression: function RenderIsNullOperatorExpression(
    expr: IsNullOperatorExpression,
    { path, updateNode }: ReactVisitorContext,
  ): ReactNode {
    return (
      <select
        value={expr.isNot.toString()}
        onChange={(e) => {
          updateNode(path, e.target.value);
        }}
      >
        <option value={true.toString()}>is null</option>
        <option value={false.toString()}>is not null</option>
      </select>
    );
  },
};

interface FilterRendererProps {
  expr: Expression;
  updateNode: (path: JSONPath, value: unknown) => void;
}

export function FilterBuilder({ expr, updateNode }: FilterRendererProps) {
  return expr.accept(ReactVisitor, { path: [], updateNode });
}
