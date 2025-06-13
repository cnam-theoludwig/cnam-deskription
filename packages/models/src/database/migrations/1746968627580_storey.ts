import type { Kysely } from "kysely"
import { sql } from "kysely"

export const up = async (database: Kysely<any>): Promise<void> => {
  await database.schema
    .createTable("Storey")
    .addColumn("id", "uuid", (column) => {
      return column
        .primaryKey()
        .defaultTo(sql`gen_random_uuid()`)
        .notNull()
    })
    .addColumn("name", "text", (column) => {
      return column.notNull()
    })
    .addColumn("buildingId", "uuid", (column) => {
      return column.notNull().references("Building.id").onDelete("cascade")
    })
    .execute()
}

export const down = async (database: Kysely<any>): Promise<void> => {
  await database.schema.dropTable("Storey").ifExists().execute()
}
