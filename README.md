# Open Geospatial Consortium (OGC) Common Query Language (CQL2) filter tooling

A browser-oriented implementation of OGC CQL2 filters in TypeScript. The goal of this tool is to enable Javascript based application (Web apps, Node.js, etc) to search STAC catalogs.

[OGC CQL2 Filters playground](https://noamra.github.io/ogc-cql2-filters/). Sourcemaps are available, feel free to look under the hood.

## Links

- [Common Query Language (CQL2) Standard page](https://www.ogc.org/standard/cql2/)
- [The standard itself](https://www.opengis.net/doc/IS/cql2/1.0)
- [BNF](https://schemas.opengis.net/cql2/1.0/cql2.bnf)
- [JSON Schema](https://schemas.opengis.net/cql2/1.0/cql2.json)
- [Examples](https://schemas.opengis.net/cql2/1.0/examples/) - Folder with Text and JSON examples.

---

## Theoretical high level design

```mermaid
flowchart TD
    JS[JavaScript] --> IN[Input]
    SI["Standard input (stdin)"] --> IN[Input]
    FI[File input] --> IN[Input]
    IN --> D{Detect encoding}

    %% CQL2 Text
    D --> |CQL2 Text| TS[Text scanner]
    TS --> |Tokens| TP[Text parser]
    TP --> E["Expression tree (AST)"]

    %% CQL2 JSON
    D --> |CQL2 JSON| JP[JSON parser]
    JP --> E

    E --> V[Validator]

```
