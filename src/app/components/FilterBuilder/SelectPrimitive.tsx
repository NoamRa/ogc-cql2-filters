import { JSONPath, LiteralPair } from "../../../cql/types";
import { Select, SelectOption } from "./Select";

type PrimitiveType = LiteralPair["type"] | "propertyRef";

const defaultValue: Record<PrimitiveType, unknown> = {
  string: "",
  number: 0,
  boolean: true,
  null: null,
  timestamp: { timestamp: new Date().toISOString() },
  date: { date: new Date().toISOString().split("T")[0] },
  propertyRef: { property: "" },
  bbox: { bbox: [12, 52, 14, 53] },
  point: { type: "Point", coordinates: [15, 52] },
};
// We want SelectPrimitive to call onChange with relevant value (0, true, null, etc.),
// but option tag's value can accept only string.
// TODO unify default value and options into single data structure and then split,
// one for Select and one to map select's values to onChange's value.
const options: SelectOption[] = [
  { value: "propertyRef", text: "Property" },
  { value: "string", text: "String" },
  { value: "number", text: "Number" },
  { value: "boolean", text: "Boolean" },
  { value: "timestamp", text: "Timestamp" },
  { value: "date", text: "Date" },
  { value: "null", text: "Null value" },
  { value: "bbox", text: "Bounding box" },
  { value: "point", text: "Point" },
];

interface SelectPrimitiveProps {
  type: PrimitiveType;
  path: JSONPath;
  onChange: (value: unknown) => void;
}

export function SelectPrimitive({ type, onChange }: SelectPrimitiveProps) {
  return (
    <Select
      value={type}
      options={options}
      onChange={(type) => {
        onChange(defaultValue[type as PrimitiveType]);
      }}
    />
  );
}
