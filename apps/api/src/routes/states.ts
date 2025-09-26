import { database } from "@repo/models/database"
import {
  StateCreateZodObject,
  StateZod,
  StateZodObject,
} from "@repo/models/State"
import * as z from "zod"
import { publicProcedure } from "../oRPC"

export const states = {
  get: publicProcedure
    .route({ method: "GET", path: "/states", tags: ["State"] })
    .output(z.array(StateZodObject))
    .handler(async () => {
      const states = await database.selectFrom("State").selectAll().execute()
      return states
    }),

  create: publicProcedure
    .route({ method: "POST", path: "/states", tags: ["State"] })
    .input(StateCreateZodObject)
    .output(StateZodObject)
    .handler(async ({ input }) => {
      const state = await database
        .insertInto("State")
        .values(input)
        .returningAll()
        .executeTakeFirstOrThrow()
      return state
    }),

  delete: publicProcedure
    .route({ method: "DELETE", path: "/states", tags: ["State"] })
    .input(StateZod.id)
    .output(StateZodObject)
    .handler(async ({ input }) => {
      const state = await database
        .deleteFrom("State")
        .where("id", "=", input)
        .returningAll()
        .executeTakeFirstOrThrow()
      return state
    }),
}
