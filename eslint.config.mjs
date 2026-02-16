import js from "@eslint/js";
import tseslint from "typescript-eslint";

export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...tseslint.configs.strict,
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser: tseslint.parser,
    },
    rules: {
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      "no-console": "warn",
      "no-debugger": "error",
      "no-empty": "warn",
      "no-var": "error",
      "prefer-const": "warn",
      "no-duplicate-imports": "error",
      "no-unreachable": "error",
      "no-useless-catch": "warn",
      "no-extra-semi": "warn",
    },
  },
];
