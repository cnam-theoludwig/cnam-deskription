import angular from "angular-eslint"
import configConventions from "@repo/config-eslint"
import typescriptESLint from "typescript-eslint"
import { defineConfig } from "eslint/config"

export default defineConfig(
  ...configConventions,
  {
    name: "config-eslint/typescript",
    files: ["**/*.ts", "**/*.tsx"],
    plugins: {
      "@typescript-eslint": typescriptESLint.plugin,
    },
    rules: {
      "@typescript-eslint/unbound-method": "off",
      "@typescript-eslint/consistent-type-imports": "off",
      "@typescript-eslint/explicit-function-return-type": "off",
      "unicorn/number-literal-case": "off",
      "arrow-body-style": "off",
      "@typescript-eslint/strict-boolean-expressions": "off",
      curly: "off",
      "unicorn/no-array-for-each": "off",
      "@angular-eslint/template/elements-content": "off",
    },
  },
  {
    name: "config-eslint/angular",
    files: ["**/*.ts"],
    extends: [...angular.configs.tsRecommended],
    processor: angular.processInlineTemplates,
  },
  {
    name: "config-eslint/angular-html",
    files: ["**/*.html"],
    extends: [
      ...angular.configs.templateRecommended,
      ...angular.configs.templateAccessibility,
    ],
    rules: {
      "@angular-eslint/template/eqeqeq": [
        "error",
        {
          allowNullOrUndefined: true,
        },
      ],
    },
  },
)
