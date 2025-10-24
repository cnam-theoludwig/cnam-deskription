import { sql } from "kysely"
import type { Kysely } from "kysely"

export const up = async (database: Kysely<any>): Promise<void> => {
  await database.schema
    .createType("HistoryLogColumn")
    .asEnum(["Name", "Location", "Type", "State"])
    .execute()

  await database.schema
    .createTable("HistoryLog")
    .addColumn("id", "uuid", (column) => {
      return column
        .primaryKey()
        .defaultTo(sql`gen_random_uuid()`)
        .notNull()
    })
    .addColumn("modifiedAt", "timestamp", (column) => {
      return column.defaultTo(sql`now()`).notNull()
    })
    .addColumn("furnitureId", "uuid", (column) => {
      return column.notNull().references("Furniture.id").onDelete("cascade")
    })
    .addColumn("column", sql`"HistoryLogColumn"`, (column) => {
      return column.notNull()
    })
    .addColumn("oldValue", "text", (column) => {
      return column.notNull()
    })
    .addColumn("newValue", "text", (column) => {
      return column.notNull()
    })
    .execute()
}

export const down = async (database: Kysely<any>): Promise<void> => {
  await database.schema.dropTable("HistoryLog").ifExists().execute()
  await database.schema.dropType("HistoryLogColumn").ifExists().execute()
}
