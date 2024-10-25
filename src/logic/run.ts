import parse from "./parser/parse";
import scan from "./scanner/scan";
import { Serializable } from "./types";

export interface RunOptions {
  inputType: "text" | "JSON";
}

const defaultOptions: RunOptions = {
  inputType: "JSON",
};

export function run(input: string, options: RunOptions): Serializable {
  const opts = { ...defaultOptions, ...options };
  try {
    return parse(scan(input, opts));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to parse input";
    return {
      toString: () => message,
      toJSON: () => message,
    };
  }
}
