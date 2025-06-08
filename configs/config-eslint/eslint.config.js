import typescriptESLint from "typescript-eslint"
import configConventions from "eslint-config-conventions"
import importX from "eslint-plugin-import-x"

export default typescriptESLint.config(
  {
    ignores: ["**/eslint.config.js", "**/kysely.config.ts"],
  },
  ...configConventions,
  {
    name: "config-eslint",
    plugins: {
      "import-x": importX,
    },
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "zod",
              message: "Please import from `zod/v4` instead.",
            },
          ],
        },
      ],
      // "import-x/extensions": [
      //   "error",
      //   "ignorePackages",
      //   {
      //     ts: "always",
      //     tsx: "always",
      //     js: "never",
      //     jsx: "never",
      //   },
      // ],
    },
  },
)
