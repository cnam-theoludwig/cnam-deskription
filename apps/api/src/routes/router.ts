import { database } from "@repo/models/database"
import { publicProcedure, router } from "./trpc"
import { FurnitureZodCreate } from "@repo/models/Furniture"

export const appRouter = router({
  furnitures: router({
    get: publicProcedure.query(async () => {
      const furnitures = await database
        .selectFrom("Furniture")
        .selectAll()
        .execute()

      return furnitures
    }),

    create: publicProcedure
      .input(FurnitureZodCreate)
      .mutation(async ({ input }) => {
        const { description } = input

        const furniture = await database
          .insertInto("Furniture")
          .values({ description })
          .returningAll()
          .executeTakeFirstOrThrow()

        return furniture
      }),
  }),
})

export type AppRouter = typeof appRouter
