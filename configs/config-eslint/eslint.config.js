import configConventions from "eslint-config-conventions"
import importZod from "eslint-plugin-import-zod"
import { defineConfig, globalIgnores } from "eslint/config"

export default defineConfig(
  globalIgnores(["**/kysely.config.ts"]),
  importZod.configs.recommended,
  ...configConventions,
  {
    "@typescript-eslint/no-deprecated": "off",
  },
)
