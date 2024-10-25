import { useState } from "react";
import { run } from "./logic/run";
import Result from "./components/Result";
import Code from "./components/Code";

export function App() {
  const [filter, setFilter] = useState(expressionExamples[0]);
  const ast = run(filter, { inputType: "text" });

  return (
    <div style={{ width: "800px", margin: "auto" }}>
      <main>
        <h1>OGC CQL2 Filters playground</h1>
        <section>
          <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <h2>CQL2 text</h2>
            <select
              onChange={(evt) => {
                setFilter(evt.target.value);
              }}
              style={{ display: "inline-block" }}
            >
              <option disabled>Choose example</option>
              {expressionExamples.map((example, index) => (
                <option key={index}>{example}</option>
              ))}
            </select>
          </div>
          <textarea
            value={filter}
            onChange={(evt) => {
              setFilter(evt.target.value);
            }}
            placeholder="Type CQL2 text expression"
            style={{ width: "99%" }}
            rows={8}
          />
        </section>
        <section>
          <h2>Results:</h2>
          <div style={{ display: "flex", flexDirection: "row", gap: "16px" }}>
            <Result title="Text">
              <Code>{ast.toString()}</Code>
            </Result>
            <Result title="JSON">
              <Code>{JSON.stringify(ast.toJSON(), null, 2)}</Code>
            </Result>
          </div>
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

const expressionExamples = [
  "vehicle_height > (bridge_clearance-1)",
  `updated >= DATE('${new Date().toISOString().split("T")[0]}')`,
  `updated > TIMESTAMP('${new Date().toISOString()}')`,
  "2+4*3",
  "4*3+2",
  "add(2,3,4)",
];
