import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";

export default [
  { ignores: ["dist"] },
  {
    files: ["**/*.{js,jsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: "latest",
        ecmaFeatures: { jsx: true },
        sourceType: "module",
      },
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      // Providers and layout files export both components and hooks — this is intentional
      "react-refresh/only-export-components": "off",
      // Sub-components defined in the same file as the page they're used in
      // are flagged as "unused" because ESLint can't see JSX usage statically.
      // PascalCase names are React components — safe to ignore.
      "no-unused-vars": [
        "warn",
        {
          varsIgnorePattern: "^[A-Z_]|^_",
          argsIgnorePattern: "^_",
          caughtErrors: "none",
        },
      ],
    },
  },
];
