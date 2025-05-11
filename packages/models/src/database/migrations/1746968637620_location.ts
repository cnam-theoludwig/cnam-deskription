import type { Kysely } from "kysely"
import { sql } from "kysely"

export const up = async (database: Kysely<any>): Promise<void> => {
  await database.schema
    .createTable("Location")
    .addColumn("id", "uuid", (column) => {
      return column
        .primaryKey()
        .defaultTo(sql`gen_random_uuid()`)
        .notNull()
    })
    .addColumn("building_id", "uuid", (column) => {
      return column.notNull().references("Building.id").onDelete("set null")
    })
    .addColumn("storey_id", "uuid", (column) => {
      return column.notNull().references("Storey.id").onDelete("set null")
    })
    .addColumn("room_id", "uuid", (column) => {
      return column.notNull().references("Room.id").onDelete("set null")
    })
    .execute()
}

export const down = async (database: Kysely<any>): Promise<void> => {
  await database.schema.dropTable("Location").ifExists().execute()
}
