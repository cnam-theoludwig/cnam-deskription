import typescriptESLint from "typescript-eslint"
import { defineConfig } from "eslint/config"
import config from "@repo/config-eslint"

export default defineConfig(...config, {
  files: ["**/*.ts", "**/*.tsx"],
  languageOptions: {
    parser: typescriptESLint.parser,
    parserOptions: {
      projectService: true,
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
