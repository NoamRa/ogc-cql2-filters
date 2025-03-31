import js from "@eslint/js";
import eslintPluginPrettier from "eslint-plugin-prettier/recommended";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import globals from "globals";
import tseslint from "typescript-eslint";

import noSpecificVersionLink from "./ci/noSpecificVersionLink.mjs";

export default tseslint
  .config(
    { ignores: ["dist", "coverage", "vite.config.ts", "vitest.config.ts"] },
    {
      extends: [
        js.configs.recommended,
        ...tseslint.configs.strictTypeChecked,
        ...tseslint.configs.stylisticTypeChecked,
      ],
      files: ["**/*.{ts,tsx}"],
      settings: { react: { version: "18.3" } },
      languageOptions: {
        ecmaVersion: 2020,
        globals: globals.browser,
        parserOptions: {
          project: ["./tsconfig.node.json", "./tsconfig.app.json", "./vitest.config.ts"],
          tsconfigRootDir: import.meta.dirname,
        },
      },
      plugins: {
        custom: noSpecificVersionLink,
        react,
        "react-hooks": reactHooks,
        "react-refresh": reactRefresh,
      },
      rules: {
        "custom/no-specific-version-link": "error",
        ...reactHooks.configs.recommended.rules,
        ...react.configs.recommended.rules,
        ...react.configs["jsx-runtime"].rules,
        "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
        "@typescript-eslint/restrict-template-expressions": ["error", { allowNumber: true }],
        "react/no-is-mounted": "off",
        "no-restricted-syntax": ["error", { selector: "TSEnumDeclaration", message: "Don't declare enums" }],
      },
    },
  )
  .concat(eslintPluginPrettier);
