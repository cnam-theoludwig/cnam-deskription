import { database } from "@repo/models/database"
import { publicProcedure, router } from "./trpc"
import z from "zod"

export const appRouter = router({
  greeting: publicProcedure.input(z.string()).query(async ({ input }) => {
    const tasks = await database.selectFrom("TODO").select(["id"]).execute()

    return {
      tasks,
      hello: `Hello ${input}`,
    }
  }),
})

export type AppRouter = typeof appRouter
