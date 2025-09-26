import { database } from "@repo/models/database"
import {
  LocationCreateZodObject,
  LocationZod,
  LocationZodObject,
} from "@repo/models/Location"
import * as z from "zod"
import { publicProcedure } from "../oRPC"

export const locations = {
  get: publicProcedure
    .route({ method: "GET", path: "/locations", tags: ["Location"] })
    .output(z.array(LocationZodObject))
    .handler(async () => {
      const locations = await database
        .selectFrom("Location")
        .selectAll()
        .execute()
      return locations
    }),

  exists: publicProcedure
    .route({ method: "POST", path: "/locations/check", tags: ["Location"] })
    .input(LocationCreateZodObject)
    .output(LocationZodObject.or(z.null()))
    .handler(async ({ input }) => {
      const location = await database
        .selectFrom("Location")
        .selectAll()
        .where("buildingId", "=", input.buildingId)
        .where("storeyId", "=", input.storeyId)
        .where("roomId", "=", input.roomId)
        .executeTakeFirst()
      if (location == null) {
        return null
      }
      return location
    }),

  create: publicProcedure
    .route({ method: "POST", path: "/locations", tags: ["Location"] })
    .input(LocationCreateZodObject)
    .output(LocationZodObject)
    .handler(async ({ input }) => {
      const location = await database
        .insertInto("Location")
        .values(input)
        .returningAll()
        .executeTakeFirstOrThrow()
      return location
    }),
  delete: publicProcedure
    .route({ method: "DELETE", path: "/locations", tags: ["Location"] })
    .input(LocationZod.id)
    .output(LocationZodObject)
    .handler(async ({ input }) => {
      const location = await database
        .deleteFrom("Location")
        .where("id", "=", input)
        .returningAll()
        .executeTakeFirstOrThrow()
      return location
    }),
}
