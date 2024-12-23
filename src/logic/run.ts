import type { Expression } from "./Entities/Expression";
import parseJSON from "./parser/parseJSON";
import parseText from "./parser/parseText";
import scanText from "./scanner/scanText";

type InputType = string | object;

export function run(input: InputType): Expression {
  try {
    if (typeof input === "object") {
      return parseJSON(input);
    }
    if (typeof input === "string") {
      if (input.startsWith("{")) {
        return parseJSON(JSON.parse(input) as object);
      }
      return parseText(scanText(input));
    }

    // failed to detect encoding
    throw new Error("Failed to detect input type");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to parse input";
    return {
      toText: () => message,
      toJSON: () => message,
      accept: () => message,
    } as Expression;
  }
}
