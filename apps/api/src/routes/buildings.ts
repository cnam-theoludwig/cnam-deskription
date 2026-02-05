import {
  BuildingCreateZodObject,
  BuildingUpdateZodObject,
  BuildingZod,
  BuildingZodObject,
} from "@repo/models/Building"
import { database } from "@repo/models/database"
import * as z from "zod"
import { publicProcedure } from "../oRPC"

export const buildings = {
  get: publicProcedure
    .route({ method: "GET", path: "/buildings", tags: ["Building"] })
    .output(z.array(BuildingZodObject))
    .handler(async () => {
      const buildings = await database
        .selectFrom("Building")
        .selectAll()
        .execute()
      return buildings
    }),

  create: publicProcedure
    .route({ method: "POST", path: "/buildings", tags: ["Building"] })
    .input(BuildingCreateZodObject)
    .output(BuildingZodObject)
    .handler(async ({ input }) => {
      const building = await database
        .insertInto("Building")
        .values(input)
        .returningAll()
        .executeTakeFirstOrThrow()
      return building
    }),

  update: publicProcedure
    .route({ method: "PUT", path: "/buildings", tags: ["Building"] })
    .input(BuildingUpdateZodObject)
    .output(BuildingZodObject)
    .handler(async ({ input }) => {
      const { id, ...dataToUpdate } = input

      const building = await database
        .updateTable("Building")
        .set(dataToUpdate)
        .where("id", "=", id)
        .returningAll()
        .executeTakeFirstOrThrow()

      return building
    }),

  delete: publicProcedure
    .route({ method: "DELETE", path: "/buildings", tags: ["Building"] })
    .input(BuildingZod.id)
    .output(BuildingZodObject)
    .handler(async ({ input }) => {
      const building = await database
        .deleteFrom("Building")
        .where("id", "=", input)
        .returningAll()
        .executeTakeFirstOrThrow()
      return building
    }),
}
