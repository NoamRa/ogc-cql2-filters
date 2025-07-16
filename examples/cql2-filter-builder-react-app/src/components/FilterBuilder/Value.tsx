import { LiteralExpression, type JSONPath, type LiteralPair } from "cql2-filters-parser";
import type { UserFilterState } from "../../hooks/useFilter";
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
          style={{ width: "10ch" }}
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
          style={{ width: "10ch" }}
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
            value={value.split("Z")[0]}
            onChange={(e) => {
              const updatedValue = new Date(e.target.valueAsNumber).toISOString().split("T")[0];
              updateNode(path, { [type]: updatedValue });
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
            const updatedValue = new Date(e.target.valueAsNumber).toISOString();
            updateNode(path, { [type]: updatedValue });
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
