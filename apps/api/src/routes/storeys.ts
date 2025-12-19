import { database } from "@repo/models/database"
import {
  StoreyCreateZodObject,
  StoreyUpdateZodObject,
  StoreyZod,
  StoreyZodObject,
} from "@repo/models/Storey"
import * as z from "zod"
import { publicProcedure } from "../oRPC"

export const storeys = {
  get: publicProcedure
    .route({ method: "GET", path: "/storeys", tags: ["Storey"] })
    .output(StoreyZodObject.array())
    .handler(async () => {
      const storeys = await database.selectFrom("Storey").selectAll().execute()
      return storeys
    }),

  getByBuildingId: publicProcedure
    .route({ method: "POST", path: "/storeys/:buildingId", tags: ["Storey"] })
    .input(z.string())
    .output(z.array(StoreyZodObject))
    .handler(async ({ input }) => {
      const storeys = await database
        .selectFrom("Storey")
        .selectAll()
        .where("buildingId", "=", input)
        .execute()
      return storeys
    }),

  create: publicProcedure
    .route({ method: "POST", path: "/storeys", tags: ["Storey"] })
    .input(StoreyCreateZodObject)
    .output(StoreyZodObject)
    .handler(async ({ input }) => {
      const storey = await database
        .insertInto("Storey")
        .values(input)
        .returningAll()
        .executeTakeFirstOrThrow()
      return storey
    }),

  delete: publicProcedure
    .route({ method: "DELETE", path: "/storeys", tags: ["Storey"] })
    .input(StoreyZod.id)
    .output(StoreyZodObject)
    .handler(async ({ input }) => {
      const storey = await database
        .deleteFrom("Storey")
        .where("id", "=", input)
        .returningAll()
        .executeTakeFirstOrThrow()
      return storey
    }),

  update: publicProcedure
    .route({ method: "PATCH", path: "/storeys", tags: ["Storey"] })
    .input(StoreyUpdateZodObject)
    .output(StoreyZodObject)
    .handler(async ({ input }) => {
      const { id, ...updates } = input
      const storey = await database
        .updateTable("Storey")
        .set(updates)
        .where("id", "=", id)
        .returningAll()
        .executeTakeFirstOrThrow()
      return storey
    }),
}
