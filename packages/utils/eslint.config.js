import typescriptESLint from "typescript-eslint"
import config from "@repo/config-eslint"

export default typescriptESLint.config(...config, {
  files: ["**/*.ts", "**/*.tsx"],
  languageOptions: {
    parser: typescriptESLint.parser,
    parserOptions: {
      projectService: true,
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
