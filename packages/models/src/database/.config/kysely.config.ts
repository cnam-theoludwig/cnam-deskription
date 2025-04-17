import { defineConfig } from "kysely-ctl"
import { database } from "../database"

export default defineConfig({
  kysely: database,
})
