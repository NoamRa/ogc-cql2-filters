import { parse } from "./parse";

/**
 * IIFE that parses expression and prints Text and JSON results
 * Expect to be using Node.js
 */
(function main() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_node, _script, ...args] = process.argv;
  if (args.length === 0) {
    process.stderr.write("Please provide CQL2 filter to parse");
    process.exit(1);
  } else if (args.length > 1) {
    process.stderr.write("Too many arguments provided. Did you forget to wrap CQL2 in quotes?");
    process.exit(1);
  }

  const cql = parse(args[0]);
  process.stdout.write("CQL2 Text:\n");
  process.stdout.write(cql.toText());
  process.stdout.write("\n");
  process.stdout.write("\n");

  process.stdout.write("CQL2 JSON:\n");
  process.stdout.write(JSON.stringify(cql.toJSON(), null, 2));
  process.stdout.write("\n");

  process.exit(0);
})();
