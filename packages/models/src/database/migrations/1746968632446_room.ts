import type { Kysely } from "kysely"
import { sql } from "kysely"

export const up = async (database: Kysely<any>): Promise<void> => {
  await database.schema
    .createTable("Room")
    .addColumn("id", "uuid", (column) => {
      return column
        .primaryKey()
        .defaultTo(sql`gen_random_uuid()`)
        .notNull()
    })
    .addColumn("name", "text", (column) => {
      return column.notNull()
    })
    .addColumn("storey_id", "uuid", (column) => {
      return column.notNull().references("Storey.id").onDelete("cascade")
    })
    .execute()
}

export const down = async (database: Kysely<any>): Promise<void> => {
  await database.schema.dropTable("Room").ifExists().execute()
}
