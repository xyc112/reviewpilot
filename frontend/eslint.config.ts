/// <reference types="node" />
import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "eslint/config";
import js from "@eslint/js";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import tseslint from "typescript-eslint";
import globals from "globals";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(
  js.configs.recommended,
  ...tseslint.configs.strict,
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  {
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: { ...globals.browser },
    },
  },
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parserOptions: {
        ecmaFeatures: { jsx: true },
        projectService: true,
        tsconfigRootDir: __dirname,
      },
    },
  },
  {
    files: ["**/*.tsx", "**/*.jsx"],
    plugins: { react, "react-hooks": reactHooks as import("eslint").Linter.Config["plugins"] extends Record<string, infer P> ? P : never },
    settings: { react: { version: "detect" } },
    rules: {
      ...react.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
      "react/jsx-no-leaked-render": [
        "warn",
        { validStrategies: ["ternary", "coerce"] },
      ],
    },
  },
  {
    rules: {
      eqeqeq: ["error", "always", { null: "ignore" }],
      "prefer-const": "error",
      "no-var": "error",
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { prefer: "type-imports", fixStyle: "separate-type-imports" },
      ],
      "no-console": ["warn", { allow: ["warn", "error"] }],
    },
  },
  { ignores: ["dist", "node_modules", "**/*.config.ts", "**/*.config.js"] },
);
