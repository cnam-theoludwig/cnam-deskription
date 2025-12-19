import { database } from "@repo/models/database"
import * as z from "zod"
import { publicProcedure } from "../oRPC"
import {
  FurnitureCreateZodObject,
  FurnitureWithRelationsZodObject,
  FurnitureZod,
} from "@repo/models/Furniture"
import type { Insertable } from "kysely"
import type { Database } from "@repo/models/database/types"
import type { Location } from "@repo/models/Location"
import { furnitureSelect } from "./furnitures"

export const historylogs = {
  update: publicProcedure
    .route({ method: "PUT", path: "/historylogs", tags: ["HistoryLog"] })
    .input(
      z.object({ id: FurnitureZod.id, furniture: FurnitureCreateZodObject }),
    )
    .output(FurnitureWithRelationsZodObject)
    .handler(async ({ input }) => {
      const oldFurniture = await furnitureSelect
        .where("Furniture.id", "=", input.id)
        .executeTakeFirstOrThrow()

      const historyLogs: Array<Insertable<Database["HistoryLog"]>> = []

      if (oldFurniture.name !== input.furniture.name) {
        historyLogs.push({
          column: "Name",
          newValue: input.furniture.name,
          oldValue: oldFurniture.name,
          furnitureId: input.id,
        })
      }

      if (oldFurniture.locationId !== input.furniture.locationId) {
        const getLocationNewValue = async (
          locationId: Location["id"],
        ): Promise<string> => {
          const newLocation = await database
            .selectFrom("Location")
            .where("id", "=", locationId)
            .selectAll()
            .executeTakeFirstOrThrow()
          const [newBuilding, newStorey, newRoom] = await Promise.all([
            database
              .selectFrom("Building")
              .where("id", "=", newLocation.buildingId)
              .selectAll()
              .executeTakeFirstOrThrow(),
            database
              .selectFrom("Storey")
              .where("id", "=", newLocation.storeyId)
              .selectAll()
              .executeTakeFirstOrThrow(),
            database
              .selectFrom("Room")
              .where("id", "=", newLocation.roomId)
              .selectAll()
              .executeTakeFirstOrThrow(),
          ])

          return `${newBuilding.name}, ${newStorey.name}, ${newRoom.name}`
        }

        historyLogs.push({
          column: "Location",
          newValue: await getLocationNewValue(input.furniture.locationId),
          oldValue: await getLocationNewValue(oldFurniture.locationId),
          furnitureId: input.id,
        })
      }

      if (oldFurniture.typeId !== input.furniture.typeId) {
        const [oldType, newType] = await Promise.all([
          database
            .selectFrom("Type")
            .where("id", "=", oldFurniture.typeId)
            .selectAll()
            .executeTakeFirstOrThrow(),
          database
            .selectFrom("Type")
            .where("id", "=", input.furniture.typeId)
            .selectAll()
            .executeTakeFirstOrThrow(),
        ])
        historyLogs.push({
          column: "Type",
          newValue: newType.name,
          oldValue: oldType.name,
          furnitureId: input.id,
        })
      }

      if (oldFurniture.stateId !== input.furniture.stateId) {
        const [oldState, newState] = await Promise.all([
          database
            .selectFrom("State")
            .where("id", "=", oldFurniture.stateId)
            .selectAll()
            .executeTakeFirstOrThrow(),
          database
            .selectFrom("State")
            .where("id", "=", input.furniture.stateId)
            .selectAll()
            .executeTakeFirstOrThrow(),
        ])
        historyLogs.push({
          column: "State",
          newValue: newState.name,
          oldValue: oldState.name,
          furnitureId: input.id,
        })
      }

      await database.transaction().execute(async (database) => {
        if (historyLogs.length > 0) {
          await database
            .insertInto("HistoryLog")
            .values(historyLogs)
            .executeTakeFirstOrThrow()
        }

        await database
          .updateTable("Furniture")
          .set(input.furniture)
          .where("id", "=", input.id)
          .executeTakeFirstOrThrow()
      })

      const newFurniture = await furnitureSelect
        .where("Furniture.id", "=", input.id)
        .executeTakeFirstOrThrow()
      return newFurniture
    }),
}
