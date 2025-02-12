import type { Expression } from "./Entities/Expression";
import { parseJSON } from "./parser/parseJSON";
import { parseText } from "./parser/parseText";
import { scanText } from "./scanner/scanText";

/**
 * Generic CQL2 parse function
 * Includes basic heuristic to determine input's encoding
 * @param {string | object} input
 * @returns {Expression} Expression AST
 * @throws {ScanError | ParseJSONError | ParseTextError} Error
 */
export function parse(input: string | object): Expression {
  if (typeof input === "object") {
    return parseJSON(input);
  }
  if (typeof input === "string") {
    if (input.startsWith("{")) {
      return parseJSON(JSON.parse(input) as object);
    }
    return parseText(scanText(input));
  }

  // Failed to detect encoding
  throw new Error("Failed to detect input type");
}
