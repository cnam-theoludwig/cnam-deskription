import { database } from "@repo/models/database"
import { RoomCreateZodObject, RoomZod, RoomZodObject } from "@repo/models/Room"
import { z } from "zod"
import { publicProcedure } from "../oRPC"

export const rooms = {
  get: publicProcedure
    .route({ method: "GET", path: "/rooms", tags: ["Room"] })
    .output(z.array(RoomZodObject))
    .handler(async () => {
      const rooms = await database.selectFrom("Room").selectAll().execute()
      return rooms
    }),

  getByStoreyId: publicProcedure
    .route({ method: "POST", path: "/rooms/:storeyId", tags: ["Room"] })
    .input(z.string())
    .output(z.array(RoomZodObject))
    .handler(async ({ input }) => {
      const rooms = await database
        .selectFrom("Room")
        .selectAll()
        .where("storeyId", "=", input)
        .execute()
      return rooms
    }),

  create: publicProcedure
    .route({ method: "POST", path: "/rooms", tags: ["Room"] })
    .input(RoomCreateZodObject)
    .output(RoomZodObject)
    .handler(async ({ input }) => {
      const room = await database
        .insertInto("Room")
        .values(input)
        .returningAll()
        .executeTakeFirstOrThrow()
      return room
    }),

  delete: publicProcedure
    .route({ method: "DELETE", path: "/rooms", tags: ["Room"] })
    .input(RoomZod.id)
    .output(RoomZodObject)
    .handler(async ({ input }) => {
      const room = await database
        .deleteFrom("Room")
        .where("id", "=", input)
        .returningAll()
        .executeTakeFirstOrThrow()
      return room
    }),
}
