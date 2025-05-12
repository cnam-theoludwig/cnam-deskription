import { database } from "@repo/models/database"
import {
  FurnitureCreateZodObject,
  FurnitureWithRelations,
  FurnitureZod,
  FurnitureZodObject,
} from "@repo/models/Furniture"
import { z } from "zod"
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
