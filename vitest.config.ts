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
      },
      setupFiles: ["./ci/toBeIncrementedFrom.ts"],
    },
  }),
);
