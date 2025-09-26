import { database } from "@repo/models/database"
import { TypeCreateZodObject, TypeZod, TypeZodObject } from "@repo/models/Type"
import * as z from "zod"
import { publicProcedure } from "../oRPC"

export const types = {
  get: publicProcedure
    .route({ method: "GET", path: "/types", tags: ["Type"] })
    .output(z.array(TypeZodObject))
    .handler(async () => {
      const types = await database.selectFrom("Type").selectAll().execute()
      return types
    }),

  create: publicProcedure
    .route({ method: "POST", path: "/types", tags: ["Type"] })
    .input(TypeCreateZodObject)
    .output(TypeZodObject)
    .handler(async ({ input }) => {
      const type = await database
        .insertInto("Type")
        .values(input)
        .returningAll()
        .executeTakeFirstOrThrow()
      return type
    }),

  delete: publicProcedure
    .route({ method: "DELETE", path: "/types", tags: ["Type"] })
    .input(TypeZod.id)
    .output(TypeZodObject)
    .handler(async ({ input }) => {
      const type = await database
        .deleteFrom("Type")
        .where("id", "=", input)
        .returningAll()
        .executeTakeFirstOrThrow()
      return type
    }),
}
