import type { RunOptions } from "../run";
import ScanError from "./scanError";
import scanJSON from "./scanJSON";
import scanText from "./scanText";

export default function scan(input: string, options: RunOptions) {
  if (options.inputType === "text") return scanText(input);
  if (options.inputType === "JSON") {
    try {
      return scanJSON(JSON.parse(input));
    } catch (error) {
      throw new ScanError(
        `Failed to parse JSON input: ${(error as SyntaxError)?.message}.`
      );
    }
  }

  throw new ScanError("Invalid input type option");
}
