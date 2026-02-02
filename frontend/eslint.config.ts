import js from "@eslint/js";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import tseslint from "typescript-eslint";
import globals from "globals";

export default tseslint.config(
  js.configs.recommended,
  // 使用 strict 替代 recommended，包含更严格的 TypeScript 规则
  ...tseslint.configs.strict,
  // 启用类型检查规则（需配合 parserOptions.project）
  ...tseslint.configs.strictTypeChecked,
  // 代码风格规则
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
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    files: ["**/*.tsx", "**/*.jsx"],
    plugins: { react: react, "react-hooks": reactHooks },
    settings: { react: { version: "detect" } },
    rules: {
      ...react.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
      // 禁止在 JSX 中通过 && 渲染可能为 0 的值（会显示 "0"）
      "react/jsx-no-leaked-render": [
        "warn",
        { validStrategies: ["ternary", "coerce"] },
      ],
    },
  },
  {
    rules: {
      // 强制使用 === / !==
      eqeqeq: ["error", "always", { null: "ignore" }],
      // 优先使用 const
      "prefer-const": "error",
      // 禁止 var
      "no-var": "error",
      // 强制 type 导入使用 type 关键字
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { prefer: "type-imports", fixStyle: "separate-type-imports" },
      ],
      // 生产代码中不鼓励 console，设为 warn 便于开发调试
      "no-console": ["warn", { allow: ["warn", "error"] }],
    },
  },
  { ignores: ["dist", "node_modules", "**/*.config.ts", "**/*.config.js"] },
);
