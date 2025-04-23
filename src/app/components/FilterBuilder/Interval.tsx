import type { IntervalExpression } from "../../../cql/entities/Expression";
import type { IntervalValuePair, JSONPath } from "../../../cql/types";
import type { UserFilterState } from "../../hooks/useFilter";
import { Value } from "./Value";

interface IntervalProps {
  expr: IntervalExpression;
  path: JSONPath;
  updateNode: UserFilterState["updateNode"];
}

export function Interval({ expr, path, updateNode }: IntervalProps) {
  return (
    <>
      INTERVAL(
      <IntervalValue value={expr.start} path={[...path, "interval", 0]} updateNode={updateNode} />,
      <IntervalValue value={expr.end} path={[...path, "interval", 1]} updateNode={updateNode} />)
    </>
  );
}

interface IntervalValueProps {
  value: IntervalValuePair;
  path: JSONPath;
  updateNode: UserFilterState["updateNode"];
}

function IntervalValue({ value, path, updateNode }: IntervalValueProps) {
  if (value.type === "unbound") return "..";
  return <Value literalPair={value} path={path} updateNode={updateNode} />;
}
