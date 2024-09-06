# Open Geospatial Consortium (GCQ) Common Query Language (CQL2) filter tooling

A browser-oriented implementation of OGC CQL2 filters in TypeScript

### Links:
- https://www.ogc.org/standard/cql2/
- https://docs.ogc.org/is/21-065r2/21-065r2.html
- https://schemas.opengis.net/cql2/1.0/cql2.bnf
- https://schemas.opengis.net/cql2/1.0/cql2.json
- https://schemas.opengis.net/cql2/1.0/examples/ (will be useful for tests)

---

## Theoretical high level design

```mermaid
flowchart TD
    JS[JavaScript] --> IN[Input]
    SI["Standard input (stdin)"] --> IN[Input]
    FI[File input] --> IN[Input]
    IN --> D{Detect encoding}
    D --> CT[CQL2 Text]
    D --> CJ[CQL2 JSON]
    CT --> SC[Scanner]
    CJ --> SC[Scanner]
    SC --> |Tokens| PR[Parser]
    PR --> |AST| V[Validator]

```

