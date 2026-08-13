import js from "@eslint/js";
import tseslint from "typescript-eslint";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import globals from "globals";
import prettierConfig from "eslint-config-prettier";

export default [
  {
    ignores: [
      "node_modules/**",
      "**/node_modules/**",
      "frontend/dist/**",
      "frontend/build/**",
      "coverage/**",
    ],
  },
  js.configs.recommended,
  {
    files: ["backend/**/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "commonjs",
      globals: {
        ...globals.node,
      },
    },
    rules: {
      "no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  },
  ...tseslint.configs.recommended.map((config) => ({
    ...config,
    files: ["backend/**/*.ts"],
  })),
  {
    files: ["backend/**/*.ts"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "commonjs",
      globals: {
        ...globals.node,
      },
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      // The backend stays CommonJS by design (no ESM migration bundled into
      // this TS migration - see todo.md), so require() is the expected way
      // to pull in sibling modules, not a mistake to flag.
      "@typescript-eslint/no-require-imports": "off",
      // models/ hasn't been retrofitted to TypeScript yet (dedicated later
      // pass - see todo.md), so anything crossing that boundary is
      // necessarily `any` for now. Downgraded to warn, matching this
      // project's existing no-unused-vars precedent, rather than off - it
      // should keep being visible as debt to pay down once models are
      // typed, not silenced.
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },
  {
    files: ["frontend/src/**/*.{js,jsx}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
      globals: {
        ...globals.browser,
      },
    },
    plugins: {
      react,
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    settings: {
      react: { version: "19" },
    },
    rules: {
      ...react.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
      "react-refresh/only-export-components": "warn",
      "no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  },
  {
    // vitest.config.js sets `test.globals: true`, so these files use
    // describe/it/test/expect/vi as globals rather than importing them
    // from "vitest" - the "globals" package has no vitest set, so they're
    // listed explicitly here.
    files: [
      "frontend/src/**/*.test.{js,jsx}",
      "backend/**/*.test.js",
      "**/setupTests.js",
      "vitest.config.js",
    ],
    languageOptions: {
      globals: {
        ...globals.node,
        describe: "readonly",
        it: "readonly",
        test: "readonly",
        expect: "readonly",
        vi: "readonly",
        beforeAll: "readonly",
        beforeEach: "readonly",
        afterAll: "readonly",
        afterEach: "readonly",
      },
    },
  },
  prettierConfig,
];
