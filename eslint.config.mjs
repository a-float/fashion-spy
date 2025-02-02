import pluginJs from "@eslint/js";
import pluginReact from "eslint-plugin-react";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import globals from "globals";
import tseslint from "typescript-eslint";

/** @type {import('eslint').Linter.Config[]} */
export default [
  { files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"] },
  { languageOptions: { globals: { ...globals.browser, ...globals.node } } },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  pluginReact.configs.flat.recommended,
  { plugins: { "simple-import-sort": simpleImportSort } },
  {
    settings: {
      react: {
        version: "detect",
      },
    },
  },
  {
    rules: {
      // not necessary in React 19
      "react/jsx-uses-react": "off",
      "react/react-in-jsx-scope": "off",
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
          ignoreRestSiblings: true,
        },
      ],
      "simple-import-sort/imports": [
        "error",
        {
          groups: [
            ["^react$", "^node:", "^@?\\w", "^", "^(ui|plugins|db)", "^\\."],
          ],
        },
      ],
      "simple-import-sort/exports": "error",
    },
  },
  { ignores: ["public/*"] },
];
