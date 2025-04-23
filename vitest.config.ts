/// <reference types="vitest/config" />
import { defineConfig, mergeConfig } from "vite";

import viteConfig from "./vite.config.ts";

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      globals: true,
      coverage: {
        provider: "istanbul",
        reporter: ["text", "html"],
        include: ["src/cql"],
        exclude: ["src/cql/main.ts", "src/cql/parse.ts"], // IO files
        thresholds: { 100: true },
      },
      setupFiles: ["./ci/toBeIncrementedFrom.ts"],
    },
  }),
);
