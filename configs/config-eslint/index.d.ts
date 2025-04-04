import type typescriptESLint from "typescript-eslint"

declare const eslintConfigConventions: ReturnType<
  typeof typescriptESLint.config
>

export default eslintConfigConventions
