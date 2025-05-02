import { sql } from "kysely"
import type { Kysely } from "kysely"

export const up = async (database: Kysely<any>): Promise<void> => {
  await database.schema
    .createTable("Furniture")
    .addColumn("id", "uuid", (column) => {
      return column
        .primaryKey()
        .defaultTo(sql`gen_random_uuid()`)
        .notNull()
    })
    .addColumn("description", "text", (column) => {
      return column.notNull()
    })
    .execute()

}

export const down = async (database: Kysely<any>): Promise<void> => {
  await database.schema.dropTable("Furniture").ifExists().execute()
}
