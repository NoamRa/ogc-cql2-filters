import { FilterBuilder } from "./components/FilterBuilder/FilterBuilder";
import { ResultCode } from "./components/ResultCode";
import { JSONExamples, textExamples } from "./examples";
import { useFilterState } from "./hooks/useFilter";

export function App() {
  const { filterState, setFilter, updateNode } = useFilterState(textExamples[0].value);

  return (
    <div style={{ maxWidth: "1200px", margin: "auto" }}>
      <header>
        <h1>OGC CQL2 Filters playground</h1>
      </header>
      <main style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <section id="input" style={{ display: "flex", flexDirection: "row", gap: "16px" }}>
          <section id="user-input" style={{ flex: 2 }}>
            <div>
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
                  <option disabled>Preset values</option>
                  <option label="Empty"></option>
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
            </div>
          </section>
          <section id="builder" style={{ flex: 3 }}>
            <h2>Filter Builder</h2>
            {"error" in filterState ?
              filterState.error.message
            : <FilterBuilder expr={filterState.expression} updateNode={updateNode} />}
          </section>
        </section>
        <section id="results">
          <h2>Results:</h2>
          <div style={{ display: "flex", flexDirection: "row", gap: "16px" }}>
            <ResultCode
              title="Text"
              code={"error" in filterState ? filterState.error.message : filterState.expression.toText()}
            />
            <ResultCode
              title="JSON"
              code={
                "error" in filterState ?
                  filterState.error.message
                : JSON.stringify(filterState.expression.toJSON(), null, 2)
              }
            />
          </div>
        </section>
      </main>
      <hr />
      <footer>
        <p>Open Geospatial Consortium (OGC) Common Query Language (CQL2) filter builder</p>
        <p>
          <a href="https://www.ogc.org/standard/cql2/" target="_blank" rel="noreferrer noopener">
            Common Query Language (CQL2) Standard page
          </a>
          &nbsp;&bull;&nbsp;
          <a href="https://www.opengis.net/doc/IS/cql2/1.0" target="_blank" rel="noreferrer noopener">
            The standard itself
          </a>
        </p>
        <p>
          <a
            href="https://github.com/NoamRa/ogc-cql2-filters#implemented-classes"
            target="_blank"
            rel="noreferrer noopener"
          >
            List of implemented classes from the standard can be found in README
          </a>
        </p>
        <p>
          <a href="https://github.com/NoamRa/ogc-cql2-filters" target="_blank" rel="noreferrer noopener">
            Source on GitHub
          </a>
        </p>
      </footer>
    </div>
  );
}
