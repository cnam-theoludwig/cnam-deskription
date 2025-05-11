import type { Kysely } from "kysely"
import { sql } from "kysely"

export const up = async (database: Kysely<any>): Promise<void> => {
  await database.schema
    .createTable("Type")
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
  await database.schema.dropTable("Type").ifExists().execute()
}
