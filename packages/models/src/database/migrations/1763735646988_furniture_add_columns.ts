import type { Kysely } from "kysely"

export const up = async (database: Kysely<any>): Promise<void> => {
  await database.schema
    .alterTable("Furniture")
    .addColumn("x", "numeric", (column) => {
      return column.notNull().defaultTo(0)
    })
    .addColumn("z", "numeric", (column) => {
      return column.notNull().defaultTo(0)
    })
    .addColumn("model", "text")
    .execute()
}

export const down = async (database: Kysely<any>): Promise<void> => {
  await database.schema
    .alterTable("Furniture")
    .dropColumn("x")
    .dropColumn("z")
    .dropColumn("model")
    .execute()
}
