import { scan } from "./scan";

export type RunOptions = {
  inputType: "text" | "JSON";
};

const defaultOptions: RunOptions = {
  inputType: "JSON",
};

export function run(input: string, options: RunOptions) {
  const opts = { ...defaultOptions, ...options };
  const tokens = scan(input, opts);
}
