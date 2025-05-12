import { database } from "@repo/models/database"
import {
  FurnitureCreateZodObject,
  FurnitureZod,
  FurnitureZodObject,
} from "@repo/models/Furniture"
import { z } from "zod"
import { publicProcedure } from "../oRPC"

export const furnitures = {
  get: publicProcedure
    .route({ method: "GET", path: "/furnitures", tags: ["Furniture"] })
    .output(z.array(FurnitureZodObject))
    .handler(async () => {
      const furnitures = await database
        .selectFrom("Furniture")
        .selectAll()
        .execute()
      return furnitures
    }),

  create: publicProcedure
    .route({ method: "POST", path: "/furnitures", tags: ["Furniture"] })
    .input(FurnitureCreateZodObject)
    .output(FurnitureZodObject)
    .handler(async ({ input }) => {
      const furniture = await database
        .insertInto("Furniture")
        .values(input)
        .returningAll()
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
