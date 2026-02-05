import type { Kysely } from "kysely"

export const up = async function (db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable("Location")
    .dropConstraint("Location_building_id_fkey")
    .ifExists()
    .execute()

  await db.schema
    .alterTable("Location")
    .addForeignKeyConstraint(
      "Location_building_id_fkey",
      ["buildingId"],
      "Building",
      ["id"],
      (cb) => {
        return cb.onDelete("cascade")
      },
    )
    .execute()

  await db.schema
    .alterTable("Location")
    .dropConstraint("Location_storey_id_fkey")
    .execute()

  await db.schema
    .alterTable("Location")
    .addForeignKeyConstraint(
      "Location_storey_id_fkey",
      ["storeyId"],
      "Storey",
      ["id"],
      (cb) => {
        return cb.onDelete("cascade")
      },
    )
    .execute()

  await db.schema
    .alterTable("Location")
    .dropConstraint("Location_room_id_fkey")
    .execute()

  await db.schema
    .alterTable("Location")
    .addForeignKeyConstraint(
      "Location_room_id_fkey",
      ["roomId"],
      "Room",
      ["id"],
      (cb) => {
        return cb.onDelete("cascade")
      },
    )
    .execute()
}

export const down = async function (db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable("Location")
    .dropConstraint("Location_building_id_fkey")
    .execute()

  await db.schema
    .alterTable("Location")
    .addForeignKeyConstraint(
      "Location_building_id_fkey",
      ["buildingId"],
      "Building",
      ["id"],
      (cb) => {
        return cb.onDelete("set null")
      },
    )
    .execute()

  await db.schema
    .alterTable("Location")
    .dropConstraint("Location_storey_id_fkey")
    .execute()

  await db.schema
    .alterTable("Location")
    .addForeignKeyConstraint(
      "Location_storey_id_fkey",
      ["storeyId"],
      "Storey",
      ["id"],
      (cb) => {
        return cb.onDelete("set null")
      },
    )
    .execute()

  await db.schema
    .alterTable("Location")
    .dropConstraint("Location_room_id_fkey")
    .execute()

  await db.schema
    .alterTable("Location")
    .addForeignKeyConstraint(
      "Location_room_id_fkey",
      ["roomId"],
      "Room",
      ["id"],
      (cb) => {
        return cb.onDelete("set null")
      },
    )
    .execute()
}
