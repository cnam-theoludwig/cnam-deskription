import { os } from "@orpc/server"
import { database } from "@repo/models/database"
import {
  FurnitureCreateZodObject,
  FurnitureZodObject,
} from "@repo/models/Furniture"
import { z } from "zod"

export const router = {
  furnitures: {
    get: os
      .route({ method: "GET", path: "/furnitures" })
      .output(z.array(FurnitureZodObject))
      .handler(async () => {
        const furnitures = await database
          .selectFrom("Furniture")
          .selectAll()
          .execute()
        return furnitures
      }),

    create: os
      .route({ method: "POST", path: "/furnitures" })
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
  },
}
