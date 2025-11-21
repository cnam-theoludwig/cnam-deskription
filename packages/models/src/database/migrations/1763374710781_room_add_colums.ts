import type { Kysely } from "kysely"

export const up = async (db: Kysely<any>): Promise<void> => {
  await db.schema
    .alterTable("Room")

    .addColumn("x", "numeric", (col) => {
      return col.notNull().defaultTo(0)
    })

    .addColumn("z", "numeric", (col) => {
      return col.notNull().defaultTo(0)
    })

    .addColumn("width", "numeric", (col) => {
      return col.notNull().defaultTo(50)
    })

    .addColumn("depth", "numeric", (col) => {
      return col.notNull().defaultTo(50)
    })

    .addColumn("color", "varchar(7)", (col) => {
      return col.notNull().defaultTo("#FFFFFF")
    })
    .execute()
}

export const down = async (db: Kysely<any>): Promise<void> => {
  await db.schema
    .alterTable("Room")
    .dropColumn("x")
    .dropColumn("z")
    .dropColumn("width")
    .dropColumn("depth")
    .dropColumn("color")
    .execute()
}
