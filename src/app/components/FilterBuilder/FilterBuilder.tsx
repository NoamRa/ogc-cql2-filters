import { Fragment, type ReactNode } from "react";
import {
  AdvancedComparisonExpression,
  ArrayExpression,
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
import type { JSONPath } from "../../../logic/types";
import type { UserFilterState } from "../../hooks/useFilter";
import { Select } from "./Select";
import { SelectPrimitive } from "./SelectPrimitive";
import { Value } from "./Value";

interface ReactVisitorContext {
  path: JSONPath;
  updateNode: UserFilterState["updateNode"];
}

const ReactVisitor: ExpressionVisitor<ReactNode, ReactVisitorContext> = {
  visitBinaryExpression: function RenderBinaryExpression(
    expr: BinaryExpression,
    { path, updateNode }: ReactVisitorContext,
  ): ReactNode {
    if (["AND", "OR"].includes(expr.operator.toText())) {
      return (
        <
          // and / or group
        >
          <div
            // and / or selection and actions
            style={{ display: "flex", justifyContent: "space-between", paddingBottom: "8px" }}
          >
            <span>{expr.operator.accept(ReactVisitor, { updateNode, path: [...path, "op"] })}</span>
            <button
              onClick={() => {
                updateNode(path, { op: "=", args: [{ property: "" }, 0] });
              }}
            >
              Convert to rule
            </button>
          </div>
          <div
            // rules
            style={{ border: "1px var(--text) solid", padding: "8px" }}
          >
            {expr.left.accept(ReactVisitor, { updateNode, path: [...path, "args", 0] })}
            <br />
            {expr.right.accept(ReactVisitor, { updateNode, path: [...path, "args", 1] })}
          </div>
        </>
      );
    }

    return (
      <div
        // rule
        style={{ display: "flex", justifyContent: "space-between", paddingBottom: "8px" }}
      >
        <div>
          {expr.left.accept(ReactVisitor, { updateNode, path: [...path, "args", 0] })}{" "}
          {expr.operator.accept(ReactVisitor, { updateNode, path: [...path, "op"] })}{" "}
          {expr.right.accept(ReactVisitor, { updateNode, path: [...path, "args", 1] })}
        </div>
        <button
          onClick={() => {
            updateNode(path, {
              op: "and",
              args: [
                { op: "=", args: [{ property: "" }, 0] },
                { op: "=", args: [{ property: "" }, 0] },
              ],
            });
          }}
        >
          Convert to AND / OR
        </button>
      </div>
    );
  },

  visitGroupingExpression: function RenderGroupingExpression(
    expr: GroupingExpression,
    { path, updateNode }: ReactVisitorContext,
  ): ReactNode {
    return <>( {expr.expression.accept(ReactVisitor, { path, updateNode })} )</>;
  },

  visitArrayExpression: function RenderArrayExpression(
    expr: ArrayExpression,
    { path, updateNode }: ReactVisitorContext,
  ): ReactNode {
    return (
      <>
        {"( "}
        {expr.expressions.map((e, index, exprs) => (
          <Fragment key={index}>
            {e.accept(ReactVisitor, { path: [...path, index], updateNode })}
            {exprs.length - 1 !== index ? ", " : ""}
          </Fragment>
        ))}
        {" )"}
      </>
    );
  },

  visitAdvancedComparisonExpression: function RenderAdvancedComparisonExpression(
    expr: AdvancedComparisonExpression,
    { path, updateNode }: ReactVisitorContext,
  ): ReactNode {
    // TODO improve
    const [value, a, b] = expr.args;
    const Arg = ({ arg, index }: { arg: Expression; index: number }) => {
      const pathToUpdate = expr.negate ? [...path, "args", 0, "args", index] : [...path, "args", index];
      return arg.accept(ReactVisitor, { path: pathToUpdate, updateNode });
    };
    const Operator = () => expr.operator.text;

    return (
      <>
        <Arg arg={value} index={0} />
        &nbsp;
        {expr.negate && <>NOT&nbsp;</>}
        <Operator />
        &nbsp;
        <Arg arg={a} index={1} />
        {expr.operator.text === "BETWEEN" && (
          <>
            &nbsp;AND&nbsp;
            <Arg arg={b} index={2} />
          </>
        )}
      </>
    );
  },

  visitLiteralExpression: function RenderLiteralExpression(
    expr: LiteralExpression,
    { path, updateNode }: ReactVisitorContext,
  ): ReactNode {
    return (
      <>
        <SelectPrimitive
          path={path}
          type={expr.literalPair.type}
          onChange={(value) => {
            updateNode(path, value);
          }}
        />
        <Value literalPair={expr.literalPair} path={path} updateNode={updateNode} />
      </>
    );
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
      <>
        <SelectPrimitive
          path={path}
          type="propertyRef"
          onChange={(value) => {
            updateNode(path, value);
          }}
        />
        <input
          type="text"
          value={expr.toText()}
          onChange={(e) => {
            updateNode(path, { property: e.target.value });
          }}
          placeholder="Property name"
        />
      </>
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

    if (expr.negate) {
      return (
        <>
          {expr.expression.accept(ReactVisitor, { updateNode, path: [...path, "args", 0, "args", 0] })}&nbsp;
          <Select
            value={expr.negate.toString()}
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
          value={expr.negate.toString()}
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
  updateNode: UserFilterState["updateNode"];
}

export function FilterBuilder({ expr, updateNode }: FilterRendererProps) {
  const isEmpty = expr.toText() === "";

  return (
    <div style={{ border: "1px var(--text) solid", padding: "8px" }}>
      {isEmpty ?
        <button
          onClick={() => {
            updateNode([], {
              op: "and",
              args: [
                { op: "=", args: [{ property: "" }, 0] },
                { op: "=", args: [{ property: "" }, 0] },
              ],
            });
          }}
        >
          Init builder
        </button>
      : expr.accept(ReactVisitor, { path: [], updateNode })}
    </div>
  );
}
