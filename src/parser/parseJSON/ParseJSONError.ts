import type { JSONPath } from "../../types";

export class ParseJSONError extends Error {
  path: JSONPath;

  constructor(path: JSONPath, message: string) {
    super(message);
    this.name = "ParseError";
    this.path = path;
  }
}
