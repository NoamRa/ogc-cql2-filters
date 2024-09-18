import type { RunOptions } from "./run";
import { Token } from "./types";

export function scan(input: string, options: RunOptions) {
  if (options.inputType === "text") return scanText(input);
  if (options.inputType === "JSON") {
    let parsed;
    try {
      parsed = JSON.parse(input);
    } catch (error) {
      const message =
        "Failed to parse JSON input" +
        (error instanceof Error ? `: ${error.message}.` : ".");
      throw new ScanError(message);
    }
    return scanJSON(parsed);
  }

  throw new ScanError("Invalid input type option");
}
export default scan;

export function scanText(input: string): Token[] {
  return [];
}

export function scanJSON(input: object): Token[] {
  return [];
}

class ScanError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ScanError";
  }
}

