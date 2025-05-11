import type { Kysely } from "kysely"

export const up = async (database: Kysely<any>): Promise<void> => {
  await database.schema
    .alterTable("Furniture")
    .addColumn("locationId", "uuid", (column) => {
      return column.notNull().references("Location.id").onDelete("cascade")
    })
    .addColumn("typeId", "uuid", (column) => {
      return column.notNull().references("Type.id").onDelete("cascade")
    })
    .addColumn("stateId", "uuid", (column) => {
      return column.notNull().references("State.id").onDelete("cascade")
    })
    .execute()
}

export const down = async (database: Kysely<any>): Promise<void> => {
  await database.schema
    .alterTable("Furniture")
    .dropColumn("locationId")
    .dropColumn("typeId")
    .dropColumn("stateId")
    .execute()
}
