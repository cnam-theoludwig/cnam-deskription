import { database, searchStringExpression } from "@repo/models/database"
import type { Database } from "@repo/models/database/types"
import {
  FurnitureCreateZodObject,
  FurnitureWithRelationsZodObject,
  FurnitureZod,
  FurnitureZodObject,
} from "@repo/models/Furniture"
import type { Insertable } from "kysely"
import { jsonArrayFrom } from "kysely/helpers/postgres"
import * as z from "zod"
import { publicProcedure } from "../oRPC"
import type { Location } from "@repo/models/Location"
import { RoomZod } from "@repo/models/Room"

const furnitureSelect = database
  .selectFrom("Furniture")
  .innerJoin("State", "Furniture.stateId", "State.id")
  .innerJoin("Type", "Furniture.typeId", "Type.id")
  .innerJoin("Location", "Furniture.locationId", "Location.id")
  .innerJoin("Room", "Location.roomId", "Room.id")
  .innerJoin("Storey", "Room.storeyId", "Storey.id")
  .innerJoin("Building", "Storey.buildingId", "Building.id")
  .select((expression) => {
    return [
      "Furniture.id",
      "Furniture.name",
      "Furniture.locationId",
      "Location.buildingId",
      "Location.storeyId",
      "Location.roomId",
      "Furniture.stateId",
      "Furniture.typeId",
      "Furniture.x",
      "Furniture.z",
      "Furniture.model",
      "State.name as state",
      "Type.name as type",
      "Building.name as building",
      "Storey.name as storey",
      "Room.name as room",
      jsonArrayFrom(
        expression
          .selectFrom("HistoryLog")
          .whereRef("furnitureId", "=", "Furniture.id")
          .orderBy("modifiedAt", "desc")
          .selectAll(),
      ).as("historyLogs"),
    ]
  })

export const furnitures = {
  get: publicProcedure
    .route({ method: "GET", path: "/furnitures", tags: ["Furniture"] })
    .output(z.array(FurnitureWithRelationsZodObject))
    .handler(async () => {
      return furnitureSelect.execute()
    }),

  getByRoomId: publicProcedure
    .route({
      method: "GET",
      path: "/furnitures/room/{roomId}",
      tags: ["Furniture"],
    })
    .input(z.object({ roomId: RoomZod.id }))
    .output(z.array(FurnitureWithRelationsZodObject))
    .handler(async ({ input }) => {
      return furnitureSelect
        .where("Location.roomId", "=", input.roomId)
        .execute()
    }),

  create: publicProcedure
    .route({ method: "POST", path: "/furnitures", tags: ["Furniture"] })
    .input(FurnitureCreateZodObject)
    .output(FurnitureWithRelationsZodObject)
    .handler(async ({ input }) => {
      const { id } = await database
        .insertInto("Furniture")
        .values(input)
        .returning(["id"])
        .executeTakeFirstOrThrow()
      return furnitureSelect
        .where("Furniture.id", "=", id)
        .executeTakeFirstOrThrow()
    }),

  update: publicProcedure
    .route({ method: "PUT", path: "/furnitures", tags: ["Furniture"] })
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

  search: publicProcedure
    .route({ method: "GET", path: "/furnitures/search", tags: ["Furniture"] })
    .input(
      FurnitureWithRelationsZodObject.omit({ name: true })
        .extend({ name: z.string().trim() })
        .partial(),
    )
    .output(z.array(FurnitureWithRelationsZodObject))
    .handler(async ({ input }) => {
      let query = furnitureSelect
      if (input.name != null && input.name.length > 0) {
        query = query.where(
          searchStringExpression({
            column: "Furniture.name",
            query: input.name,
          }),
        )
      }
      if (input.buildingId != null) {
        query = query.where("Building.id", "=", input.buildingId)
      }
      if (input.storeyId != null) {
        query = query.where("Storey.id", "=", input.storeyId)
      }
      if (input.roomId != null) {
        query = query.where("Room.id", "=", input.roomId)
      }
      if (input.typeId != null) {
        query = query.where("Furniture.typeId", "=", input.typeId)
      }
      if (input.stateId != null) {
        query = query.where("Furniture.stateId", "=", input.stateId)
      }
      return query.execute()
    }),

  delete: publicProcedure
    .route({ method: "DELETE", path: "/furnitures", tags: ["Furniture"] })
    .input(FurnitureZod.id)
    .output(FurnitureZodObject)
    .handler(async ({ input }) => {
      return database
        .deleteFrom("Furniture")
        .where("id", "=", input)
        .returningAll()
        .executeTakeFirstOrThrow()
    }),
}
