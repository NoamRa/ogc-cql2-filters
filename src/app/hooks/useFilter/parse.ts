import type { Expression } from "../../../cql/Entities/Expression";
import { parseJSON } from "../../../cql/parser/parseJSON";
import { parseText } from "../../../cql/parser/parseText";
import { scanText } from "../../../cql/scanner/scanText";

export type ParseResult =
  | { encoding: "Text"; expression: Expression }
  | { encoding: "JSON"; expression: Expression }
  | { error: Error };

export function parse(input: string | object): ParseResult {
  try {
    if (typeof input === "object") {
      return {
        expression: parseJSON(input),
        encoding: "JSON",
      };
    }
    if (typeof input === "string") {
      if (input.startsWith("{")) {
        return {
          expression: parseJSON(JSON.parse(input) as object),
          encoding: "JSON",
        };
      }
      return {
        expression: parseText(scanText(input)),
        encoding: "Text",
      };
    }
    return { error: new Error("Failed to detect input type, expecting string for CQL2 Text or object for CQL2 JSON") };
  } catch (error) {
    return { error: error instanceof Error ? error : new Error("Failed to parse input") };
  }
}
