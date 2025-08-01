# Open Geospatial Consortium (OGC) Common Query Language (CQL2) filter tooling

A browser-oriented implementation of OGC CQL2 filters in TypeScript. The goal of this library is to enable Javascript based application (Web apps, Node.js, etc) to search STAC catalogs.

[OGC CQL2 Filters playground](https://noamra.github.io/ogc-cql2-filters/). Sourcemaps are available, feel free to look under the hood.

![NPM Version](https://img.shields.io/npm/v/cql2-filters-parser)

## Installation

Getting [cql2-filters-parser from npm](https://www.npmjs.com/package/cql2-filters-parser):

```sh
npm install cql2-filters-parser
```

Browsers can load the library directly from unpkg.com:

```javascript
import { parse } from "https://unpkg.com/cql2-filters-parser"
```

`cql2-filters-parser` library is published as ES module and is dependency free.

## Usage

Both CQL2 Text and JSON encodings are supported. Parsing functions return an expression in tree structure. Expressions have `toText` and `toJSON` methods, which produce encoding in string or object respectively.

- `parseText(string)` parses CQL2 Text
- `parseJSON(object)` parses CQL2 JSON
- `parse(input)` wraps parsing functions + simple heuristic

### Using library in node module

```javascript
import { parse, parseJSON, parseText } from "cql2-filters-parser";

const filter = parse("2+3");
console.log(filter.encoding); // Text
console.log(filter.expression.toJSON()); // { op: '+', args: [ 2, 3 ] }
console.log(filter.expression.toText()); // 2 + 3
```

### Using from terminal

The `npm run parse "my cql"` script will parse and print both Text and JSON results

```console
npm run parse "depth BETWEEN 100.0 AND 150.0"
```

Will output:

```console
CQL2 Text:
depth BETWEEN 100 AND 150

CQL2 JSON:
{
  "op": "between",
  "args": [
    {
      "property": "depth"
    },
    100,
    150
  ]
}
```

---

## Links

- [Common Query Language (CQL2) Standard page](https://www.ogc.org/standard/cql2/)
- [The standard itself](https://www.opengis.net/doc/is/cql2/1.0)
- [BNF](https://schemas.opengis.net/cql2/1.0/cql2.bnf)
- [JSON Schema](https://schemas.opengis.net/cql2/1.0/cql2.json)
- [Examples](https://schemas.opengis.net/cql2/1.0/examples/) - Folder with Text and JSON examples.

### Implemented classes

- [Basic CQL2](https://www.opengis.net/spec/cql2/1.0/req/basic-cql2)
- [Advanced Comparison Operators](https://www.opengis.net/spec/cql2/1.0/req/advanced-comparison-operators)
- [Case-insensitive Comparison](https://www.opengis.net/spec/cql2/1.0/req/case-insensitive-comparison)
- [Accent-insensitive Comparison](https://www.opengis.net/spec/cql2/1.0/req/accent-insensitive-comparison)
- [Basic Spatial Functions](https://www.opengis.net/spec/cql2/1.0/req/basic-spatial-functions)
- [Basic Spatial Functions with additional Spatial Literals](https://www.opengis.net/spec/cql2/1.0/req/basic-spatial-functions-plus)
- [Spatial Functions](https://www.opengis.net/spec/cql2/1.0/req/spatial-functions)
- [Temporal Functions](https://www.opengis.net/spec/cql2/1.0/req/temporal-functions)
- [Array Functions](https://www.opengis.net/spec/cql2/1.0/req/array-functions)
- [Arithmetic Expressions](https://www.opengis.net/spec/cql2/1.0/req/arithmetic)

## High level design

```mermaid
---
Note: Mermaid diagrams don't work in npm. Please head over to GitHub.
title: CQL2 filter parser high level design
---
flowchart TD
    JS[JavaScript] --> IN[Input]
    SI["Standard input (stdin)"] --> IN[Input]
    FI[File input] --> IN[Input]
    IN --> |"&nbsp;parse(input)&nbsp;"| D{Detect encoding}

    %% CQL2 Text
    D --> |&nbsp;CQL2 Text&nbsp;| TS[Text scanner]
    TS --> |&nbsp;Tokens&nbsp;| TP[Text parser]

    %% CQL2 JSON
    D --> |&nbsp;CQL2 JSON&nbsp;| JSONP["JSON.parse()"]
    JSONP --> |&nbsp;JS object&nbsp;| JP[JSON parser]
    JP --> E

    %% Results
    TP --> E["Expression tree (AST)"]
    E --> TT[".toText()"]
    E --> VIS[".accept(visitor)"]
    E --> TJ[".toJSON()"]

    %% Visitor
    VIS --> |&nbsp;extend&nbsp;| Val[Validation]
    VIS --> |&nbsp;extend&nbsp;| UI[UI]
    VIS --> |&nbsp;extend&nbsp;| Eval[Evaluation]
```

### Visitor

Expression tree also has `accept(visitor, context)` method that receive a [visitor object](https://en.wikipedia.org/wiki/Visitor_pattern) as input. The visitor object should implement all visit functions. This enable producing output when traversing the expression tree. The optional context parameter enabled passing additional information for the visitor, such as current path to the expression.

```javascript
import { parse } from "cql2-filters-parser";

const minimalArithmeticVisitor = {
  visitBinaryExpression: (expr) => {
    return [
      "Left side is " + expr.left.accept(minimalArithmeticVisitor),
      "Operator is " + expr.operator.accept(minimalArithmeticVisitor),
      "Right side is " + expr.right.accept(minimalArithmeticVisitor),
    ].join(". ");
  },
  visitLiteralExpression: (expr) => `${expr.type} ${expr.toText()}`,
  visitOperatorExpression: (expr) => expr.label,
};

const expr = parseText("2 + 3");
console.log(filter.expression.accept(minimalArithmeticVisitor)); // Left side is number 2. Operator is addition. Right side is number 3
```

More Visitor examples can be found in `Expression.test.ts` suite, or check out ReactVisitor for an advanced implementation.

### Dependencies

The parsers runtime are dependency free. I'd like to publish the parsers as a separate module, but ATM that's not the case. In development there are multiple dependencies, but trying to keep them to minimum.

Playground is built with React.

## Development

PRs welcome.

### Folder structure

- `src` - library root.
  - `parse.ts` - main parse function.
  - `main.ts` - for CLI.
  - `entities` - Expression classes, Tokens, operator's metadata.
  - `parser` - Text and JSON parsers.
  - `types` - folder with types that don't belong directly to either parser or entities folders.
- `examples` - ATM only one: filter builder react app.
- `ci` - Continues integration related files.

### First time only

- Clone the repository
- Install dependencies `npm install`

### Parsers development

Test driven development is advised, using `npm run test`. Vitest is the test runner.

### Playground development

The Playground is powered by Vite and React, and can be found in `examples` folder. Run `npm run dev` to start dev server. For real experience use `npm run build && npm run preview`.

### Checking everything

In no particular order:

- Make sure you created a new branch, and commit changes
- Run all checks (lint, type check, tests) - `npm run checks`.
- ESlint + Prettier - `npm run lint`.
- TypeScript type check - `npm run type-check`.
- Tests - `npm run tests` for continues running test suite on fule change, or run just once using `npm run tests:once`.
- Code coverage - `npm run test:coverage` - coverage is not enforced, but for parsers I try to have close to 100%. Exceptions are edge cases, which should throw.
- Increment version - Each PR must increment version properly using `npm version <major | minor | patch>`. The CI test (`npm run test:ci`) enforces that.

When done, push branch and create a PR. Github Actions will run checks.

#### Publishing

Done manually. `npm run publish:dry` will run checks, create fresh build and display which files will be bundled. If everything's OK, `npm publish` will publish. Note that version must be incremented.
