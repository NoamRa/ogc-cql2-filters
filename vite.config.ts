import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import dts from "vite-plugin-dts";

// https://vitejs.dev/config/
export default defineConfig({
  base: "/src/cql",
  build: {
    sourcemap: true,
    lib: {
      name: "cq2-filter-parser",
      entry: ["src/cql/index.ts"],
      fileName: (format, _entryName) => `cq2-filter-parser.${format}.js`,
      formats: ["es"],
    },
    target: "esnext",
  },
  plugins: [react(), dts({ tsconfigPath: "tsconfig.node.json", exclude: ["favicon"] })],
});
