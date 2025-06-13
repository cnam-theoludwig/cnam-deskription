import { database } from "@repo/models/database"
import {
  FurnitureCreateZodObject,
  FurnitureWithRelations,
  FurnitureWithRelationsIds,
  FurnitureZod,
  FurnitureZodObject,
} from "@repo/models/Furniture"
import { z } from "zod/v4"
import { publicProcedure } from "../oRPC"

export const furnitures = {
  get: publicProcedure
    .route({ method: "GET", path: "/furnitures", tags: ["Furniture"] })
    .output(z.array(FurnitureWithRelations))
    .handler(async () => {
      const furnitures = await database
        .selectFrom("Furniture")
        .innerJoin("State", "Furniture.stateId", "State.id")
        .innerJoin("Type", "Furniture.typeId", "Type.id")
        .innerJoin("Location", "Furniture.locationId", "Location.id")
        .innerJoin("Room", "Location.roomId", "Room.id")
        .innerJoin("Storey", "Room.storeyId", "Storey.id")
        .innerJoin("Building", "Storey.buildingId", "Building.id")
        .select([
          "Furniture.id",
          "Furniture.name",
          "Furniture.locationId",
          "Furniture.stateId",
          "Furniture.typeId",
          "State.name as state",
          "Type.name as type",
          "Building.name as building",
          "Storey.name as storey",
          "Room.name as room",
        ])
        .execute()
      return furnitures
    }),

  create: publicProcedure
    .route({ method: "POST", path: "/furnitures", tags: ["Furniture"] })
    .input(FurnitureCreateZodObject)
    .output(FurnitureWithRelations)
    .handler(async ({ input }) => {
      const { id } = await database
        .insertInto("Furniture")
        .values(input)
        .returning(["id"])
        .executeTakeFirstOrThrow()
      const furniture = await database
        .selectFrom("Furniture")
        .innerJoin("State", "Furniture.stateId", "State.id")
        .innerJoin("Type", "Furniture.typeId", "Type.id")
        .innerJoin("Location", "Furniture.locationId", "Location.id")
        .innerJoin("Room", "Location.roomId", "Room.id")
        .innerJoin("Storey", "Room.storeyId", "Storey.id")
        .innerJoin("Building", "Storey.buildingId", "Building.id")
        .select([
          "Furniture.id",
          "Furniture.name",
          "Furniture.locationId",
          "Furniture.stateId",
          "Furniture.typeId",
          "State.name as state",
          "Type.name as type",
          "Building.name as building",
          "Storey.name as storey",
          "Room.name as room",
        ])
        .where("Furniture.id", "=", id)
        .executeTakeFirstOrThrow()
      return furniture
    }),

  search: publicProcedure
    .route({ method: "GET", path: "/furnitures/search", tags: ["Furniture"] })
    .input(FurnitureWithRelationsIds.partial())
    .output(z.array(FurnitureWithRelations))
    .handler(async ({ input }) => {
      let query = database
        .selectFrom("Furniture")
        .innerJoin("State", "Furniture.stateId", "State.id")
        .innerJoin("Type", "Furniture.typeId", "Type.id")
        .innerJoin("Location", "Furniture.locationId", "Location.id")
        .innerJoin("Room", "Location.roomId", "Room.id")
        .innerJoin("Storey", "Room.storeyId", "Storey.id")
        .innerJoin("Building", "Storey.buildingId", "Building.id")
        .select([
          "Furniture.id",
          "Furniture.name",
          "Furniture.locationId",
          "Furniture.stateId",
          "Furniture.typeId",
          "State.name as state",
          "Type.name as type",
          "Building.name as building",
          "Storey.name as storey",
          "Room.name as room",
        ])

      if (input.name !== undefined && input.name.trim() !== "") {
        query = query.where("Furniture.name", "like", `${input.name}%`)
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

      const furnitures = await query.execute()
      return furnitures
    }),

  delete: publicProcedure
    .route({ method: "DELETE", path: "/furnitures", tags: ["Furniture"] })
    .input(FurnitureZod.id)
    .output(FurnitureZodObject)
    .handler(async ({ input }) => {
      const furniture = await database
        .deleteFrom("Furniture")
        .where("id", "=", input)
        .returningAll()
        .executeTakeFirstOrThrow()
      return furniture
    }),
}
