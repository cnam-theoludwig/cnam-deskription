import { database, searchStringExpression } from "@repo/models/database"
import {
  FurnitureCreateZodObject,
  FurnitureWithRelationsZodObject,
  FurnitureZod,
  FurnitureZodObject,
} from "@repo/models/Furniture"
import * as z from "zod"
import { publicProcedure } from "../oRPC"

const furnitureSelect = (): ReturnType<typeof database.selectFrom> => {
  return database
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
      "Location.buildingId",
      "Location.storeyId",
      "Location.roomId",
      "Furniture.stateId",
      "Furniture.typeId",
      "State.name as state",
      "Type.name as type",
      "Building.name as building",
      "Storey.name as storey",
      "Room.name as room",
    ])
}

export const furnitures = {
  get: publicProcedure
    .route({ method: "GET", path: "/furnitures", tags: ["Furniture"] })
    .output(z.array(FurnitureWithRelationsZodObject))
    .handler(async () => {
      return furnitureSelect().execute()
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
      return furnitureSelect()
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
      await database
        .updateTable("Furniture")
        .set(input.furniture)
        .where("id", "=", input.id)
        .executeTakeFirstOrThrow()
      return furnitureSelect()
        .where("Furniture.id", "=", input.id)
        .executeTakeFirstOrThrow()
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
      let query = furnitureSelect()
      if (input.name != null && input.name.length > 0) {
        query = query.where(
          searchStringExpression({ column: "name", query: input.name }),
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
