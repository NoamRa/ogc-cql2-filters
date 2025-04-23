import { LiteralExpression } from "../../../cql/entities/Expression";
import { JSONPath, LiteralPair } from "../../../cql/types";
import { UserFilterState } from "../../hooks/useFilter";
import { Select } from "./Select";

interface ValueProps {
  literalPair: LiteralPair;
  path: JSONPath;
  updateNode: UserFilterState["updateNode"];
}

export function Value({ literalPair, path, updateNode }: ValueProps) {
  switch (literalPair.type) {
    case "string": {
      return (
        <input
          type={literalPair.type}
          value={literalPair.value}
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
          type={literalPair.type}
          value={literalPair.value}
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
          value={literalPair.value.toString()}
          options={["true", "false"]}
          onChange={(value) => {
            updateNode(path, value);
          }}
        />
      );
    }

    case "date":
    case "timestamp": {
      const { type, value } = LiteralExpression.getTemporalValue(literalPair);
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
}
