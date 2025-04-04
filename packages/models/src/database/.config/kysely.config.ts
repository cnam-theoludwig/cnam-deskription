import { defineConfig } from "kysely-ctl"
import { database } from "../database.ts"

export default defineConfig({
  kysely: database,
})
