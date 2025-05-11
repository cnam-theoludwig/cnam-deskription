import type { Kysely } from "kysely"

export const up = async (database: Kysely<any>): Promise<void> => {
  await database.schema
    .alterTable("Furniture")
    .addColumn("location_id", "uuid", (column) => {
      return column.notNull().references("Location.id").onDelete("cascade")
    })
    .addColumn("type_id", "uuid", (column) => {
      return column.notNull().references("Type.id").onDelete("cascade")
    })
    .addColumn("state_id", "uuid", (column) => {
      return column.notNull().references("State.id").onDelete("cascade")
    })
    .execute()
}

export const down = async (database: Kysely<any>): Promise<void> => {
  await database.schema
    .alterTable("Furniture")
    .dropColumn("location_id")
    .dropColumn("type_id")
    .dropColumn("state_id")
    .execute()
}
