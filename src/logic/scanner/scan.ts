import type { RunOptions } from "../run";
import ScanError from "./scanError";
import scanJSON from "./scanJSON";
import scanText from "./scanText";

export default function scan(input: string, options: RunOptions) {
  switch (options.inputType) {
    case "text": {
      return scanText(input);
    }
    case "JSON": {
      try {
        return scanJSON(JSON.parse(input) as object);
      } catch (error) {
        throw new ScanError(`Failed to parse JSON input: ${(error as SyntaxError).message}.`);
      }
    }
    default: {
      throw new ScanError("Invalid input type option");
    }
  }
}
