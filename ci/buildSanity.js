import assert from "node:assert";
import { parse, parseJSON, parseText } from "../dist/cq2-filter-parser.es.js";

try {
  assert.equal(typeof parse, "function");
  assert.equal(typeof parseJSON, "function");
  assert.equal(typeof parseText, "function");

  const parsed = parse('{ "op": "add", "args": [2,3] }');
  assert.equal(parsed.encoding, "JSON");

  console.log("Build sanity test passed. 🎉");
  process.exit(0);
} catch (err) {
  console.error(err);
  process.exit(1);
}
