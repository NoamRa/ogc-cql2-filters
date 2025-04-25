import type { Expression } from "./entities/Expression";
import { parseJSON } from "./parser/parseJSON";
import { parseText } from "./parser/parseText";

/**
 * Generic CQL2 parse function
 * Includes basic heuristic to determine input's encoding
 * @param {string | object} input
 * @returns {ParseResult} Expression AST and the input's encoding
 * @throws {ScanError | ParseJSONError | ParseTextError} Error
 */
export type ParseResult =
  | { encoding: "Text"; expression: Expression; error?: never }
  | { encoding: "JSON"; expression: Expression; error?: never }
  | { encoding?: never; expression?: never; error: Error };

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
        expression: parseText(input),
        encoding: "Text",
      };
    }
    return { error: new Error("Failed to detect input type, expecting string for CQL2 Text or object for CQL2 JSON") };
  } catch (error) {
    return {
      error:
        /* istanbul ignore next // TODO how can parse throw something that's not an Error? */
        error instanceof Error ? error : new Error("Failed to parse input"),
    };
  }
}
