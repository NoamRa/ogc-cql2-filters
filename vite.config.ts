import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import dts from "vite-plugin-dts";

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    target: "esnext",
    sourcemap: true,
    lib: {
      name: "cq2-filter-parser",
      entry: ["src/index.ts"],
      fileName: (format, _entryName) => `cq2-filter-parser.${format}.js`,
      formats: ["es"],
    },
  },
  plugins: [react(), dts({ tsconfigPath: "tsconfig.node.json", rollupTypes: true })],
});
