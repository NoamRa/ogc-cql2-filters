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
import { Select } from "./Select";

interface ReactVisitorContext {
  path: JSONPath;
  updateNode: (path: JSONPath, value: unknown) => void;
}

const ReactVisitor: ExpressionVisitor<ReactNode, ReactVisitorContext> = {
  visitBinaryExpression: function RenderBinaryExpression(
    expr: BinaryExpression,
    { path, updateNode }: ReactVisitorContext,
  ): ReactNode {
    if (["AND", "OR"].includes(expr.operator.toText())) {
      return (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: "8px" }}>
            <span id="selection">{expr.operator.accept(ReactVisitor, { updateNode, path: [...path, "op"] })}</span>
            <span id="actions">
              <button disabled>Add rule</button>&nbsp;
              <button disabled>Add &quot;And&quot;; / &quot;;OR&quot;;</button>
            </span>
          </div>
          <div style={{ border: "1px var(--text) solid", padding: "8px" }}>
            {expr.left.accept(ReactVisitor, { updateNode, path: [...path, "args", 0] })}
            <br />
            {expr.right.accept(ReactVisitor, { updateNode, path: [...path, "args", 1] })}
          </div>
        </div>
      );
    }

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
          <Select
            value={expr.literalPair.value.toString()}
            options={["true", "false"]}
            onChange={(value) => {
              updateNode(path, value);
            }}
          />
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
        value={expr.toText()}
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
    const andOr = ["AND", "OR"];
    if (andOr.includes(expr.toText())) {
      return (
        <Select
          value={expr.toText()}
          options={andOr}
          onChange={(value) => {
            updateNode(path, value);
          }}
        />
      );
    }

    const arithmeticOpe = ["+", "-", "*", "/"];
    if (arithmeticOpe.includes(expr.toText())) {
      return (
        <Select
          value={expr.toText()}
          options={arithmeticOpe}
          onChange={(value) => {
            updateNode(path, value);
          }}
        />
      );
    }

    const logicalOps = ["<", ">", ">=", "<=", "=", "<>"];
    if (logicalOps.includes(expr.toText())) {
      return (
        <Select
          value={expr.toText()}
          options={logicalOps}
          onChange={(value) => {
            updateNode(path, value);
          }}
        />
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
    // TODO better implementation

    const options = [
      { value: "true", text: "is not null" },
      { value: "false", text: "is null" },
    ];

    if (expr.isNot) {
      return (
        <>
          {expr.expression.accept(ReactVisitor, { updateNode, path: [...path, "args", 0, "args", 0] })}&nbsp;
          <Select
            value={expr.isNot.toString()}
            options={options}
            onChange={() => {
              updateNode(path, { op: "isNull", args: [expr.expression.toJSON()] });
            }}
          />
        </>
      );
    }

    return (
      <>
        {expr.expression.accept(ReactVisitor, { updateNode, path: [...path, "args", 0] })}&nbsp;
        <Select
          value={expr.isNot.toString()}
          options={options}
          onChange={() => {
            updateNode(path, { op: "not", args: [{ op: "isNull", args: [expr.expression.toJSON()] }] });
          }}
        />
      </>
    );
  },
};

interface FilterRendererProps {
  expr: Expression;
  updateNode: (path: JSONPath, value: unknown) => void;
}

export function FilterBuilder({ expr, updateNode }: FilterRendererProps) {
  return (
    <div style={{ border: "1px var(--text) solid", padding: "8px" }}>
      {expr.accept(ReactVisitor, { path: [], updateNode })}
    </div>
  );
}
