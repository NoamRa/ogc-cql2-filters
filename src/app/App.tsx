import Result from "./components/Result";
import Code from "./components/Code";
import { FilterBuilder } from "./components/FilterBuilder/FilterBuilder";
import { useFilterState } from "./hooks/useFilter";

export function App() {
  const { filterState, setFilter, updateNode } = useFilterState(textExamples[0].value);

  return (
    <div style={{ width: "1200px", margin: "auto" }}>
      <header>
        <h1>OGC CQL2 Filters playground</h1>
      </header>
      <main style={{ display: "flex", flexDirection: "row", gap: "16px" }}>
        <section id="input-output">
          <section>
            <div
              style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}
            >
              <h2>CQL2 text or JSON</h2>
              <select
                onChange={(evt) => {
                  let selected = evt.target.value;
                  // try to apply formatting to JSON
                  if (selected.startsWith("{")) {
                    try {
                      selected = JSON.stringify(JSON.parse(selected), null, 2);
                    } catch {
                      // don't care
                    }
                  }
                  setFilter(selected);
                }}
                style={{ display: "inline-block" }}
              >
                <option disabled>Choose example</option>
                <optgroup label="Text Expressions">
                  {textExamples.map(({ value, label }, index) => (
                    <option key={index} label={label}>
                      {value}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="JSON Expressions">
                  {JSONExamples.map(({ value, label }, index) => (
                    <option key={index} label={label}>
                      {value}
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>
            <textarea
              value={filterState.filter}
              onChange={(evt) => {
                setFilter(evt.target.value);
              }}
              placeholder="Type CQL2 text expression"
              style={{ width: "99%" }}
              rows={12}
              spellCheck={false}
            />
          </section>
          <section>
            <h2>Results:</h2>
            <div style={{ display: "flex", flexDirection: "row", gap: "16px" }}>
              <Result title="Text">
                <Code>{"error" in filterState ? filterState.error.message : filterState.expression.toText()}</Code>
              </Result>
              <Result title="JSON">
                <Code>
                  {"error" in filterState ?
                    filterState.error.message
                  : JSON.stringify(filterState.expression.toJSON(), null, 2)}
                </Code>
              </Result>
            </div>
          </section>
        </section>
        <section id="builder">
          <h2>Filter Builder</h2>
          {"error" in filterState ?
            filterState.error.message
          : <FilterBuilder expr={filterState.expression} updateNode={updateNode} />}
        </section>
      </main>
      <hr />
      <footer>
        Open Geospatial Consortium (GCQ) Common Query Language (CQL2) filter builder
        <br />
        <a href="https://www.ogc.org/standard/cql2/" target="_blank" rel="noreferrer noopener">
          Common Query Language (CQL2) Standard page
        </a>
        &nbsp;&bull;&nbsp;
        <a href="https://www.opengis.net/doc/IS/cql2/1.0" target="_blank" rel="noreferrer noopener">
          The standard itself
        </a>
        <br />
        <a href="https://github.com/NoamRa/ogc-cql2-filters" target="_blank" rel="noreferrer noopener">
          Source on GitHub
        </a>
      </footer>
    </div>
  );
}

const textExamples = [
  { label: "Property reference", value: "vehicle_height > (bridge_clearance- 1)" },
  { label: "Date", value: `updated >= DATE('${new Date().toISOString().split("T")[0]}')` },
  { label: "Timestamp", value: `updated > TIMESTAMP('${new Date().toISOString()}')` },
  { label: "Arithmetic", value: "4*3+2" },
  { label: "Function", value: "add(2,3,4)" },
  { label: "Null value check", value: "geometry IS NULL" },
  { label: "Not null value check", value: "geometry IS NOT NULL" },
  { label: "And, or, not (precedence)", value: "'a' AND 'b' OR NOT 'c' AND 'd'" },
];

const JSONExamples = [
  { label: "Basic arithmetic", value: { op: "+", args: [4, 5] } },
  {
    label: "Property reference",
    value: {
      op: ">",
      args: [{ property: "vehicle_height" }, { op: "-", args: [{ property: "bridge_clearance" }, 1] }],
    },
  },
  { label: "Date", value: { op: ">=", args: [{ property: "updated" }, { date: "2024-11-27" }] } },
  { label: "Null value check", value: { op: "isNull", args: [{ property: "geometry" }] } },
  { label: "Not null value check", value: { op: "not", args: [{ op: "isNull", args: [{ property: "geometry" }] }] } },
].map((example) => ({ ...example, value: JSON.stringify(example.value, null, 2) }));
