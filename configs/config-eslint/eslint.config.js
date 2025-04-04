import typescriptESLint from "typescript-eslint"
import configConventions from "eslint-config-conventions"
import importX from "eslint-plugin-import-x"

export default typescriptESLint.config(
  {
    ignores: [
      "**/eslint.config.js",
      "**/kysely.config.ts",
    ],
  },
  ...configConventions,
  {
    name: "config-eslint",
    plugins: {
      "import-x": importX,
    },
    rules: {
      "import-x/extensions": [
        "error",
        "ignorePackages",
        {
          ts: "always",
          tsx: "always",
          js: "never",
          jsx: "never",
        },
      ],
    },
  },
)
