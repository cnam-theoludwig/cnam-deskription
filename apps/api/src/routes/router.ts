
import { publicProcedure, router } from "./trpc.ts"
import z from "zod"

export const appRouter = router({
  greeting: publicProcedure
  .input(z.string())
  .query(async ({input}) => {
    return `Hello ${input}`
  })
})

export type AppRouter = typeof appRouter
