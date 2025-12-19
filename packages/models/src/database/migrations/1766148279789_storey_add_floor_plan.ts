import type { Kysely } from "kysely"

export const up = async (db: Kysely<any>): Promise<void> => {
  await db.schema
    .alterTable("Storey")
    .addColumn("floorPlanImage", "text")
    .execute()
}

export const down = async (db: Kysely<any>): Promise<void> => {
  await db.schema.alterTable("Storey").dropColumn("floorPlanImage").execute()
}
