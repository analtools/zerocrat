import js from "@eslint/js";
import tsEslint from "typescript-eslint";
import { defineConfig, globalIgnores } from "eslint/config";
import simpleImportSort from "eslint-plugin-simple-import-sort";

export default defineConfig([
  globalIgnores(["dist", "node_modules", "coverage", ".husky", ".idea"]),
  {
    files: ["packages/cli/src/**/*.{ts,tsx}", "packages/sources/*/src/**/*.{ts,tsx}"],
    extends: [js.configs.recommended, tsEslint.configs.recommended],
    languageOptions: {
      ecmaVersion: 2020,
    },
    rules: {
      "simple-import-sort/imports": "error",
      "simple-import-sort/exports": "error",
      "@typescript-eslint/no-explicit-any": "off",
    },
    plugins: {
      "simple-import-sort": simpleImportSort,
    },
  },
]);
