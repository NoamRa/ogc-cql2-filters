import type { RunOptions } from "../run";
import ScanError from "./scanError";
import scanJSON from "./scanJSON";
import scanText from "./scanText";

export default function scan(input: string, options: RunOptions) {
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
