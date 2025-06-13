import { sql } from "kysely"
import type { Kysely } from "kysely"

export const up = async (database: Kysely<any>): Promise<void> => {
  await sql`CREATE EXTENSION IF NOT EXISTS "unaccent"`.execute(database)
  await sql`CREATE EXTENSION IF NOT EXISTS "pg_trgm"`.execute(database)

  await database.schema
    .createTable("Furniture")
    .addColumn("id", "uuid", (column) => {
      return column
        .primaryKey()
        .defaultTo(sql`gen_random_uuid()`)
        .notNull()
    })
    .addColumn("name", "text", (column) => {
      return column.notNull()
    })
    .execute()
}

export const down = async (database: Kysely<any>): Promise<void> => {
  await database.schema.dropTable("Furniture").ifExists().execute()
}
