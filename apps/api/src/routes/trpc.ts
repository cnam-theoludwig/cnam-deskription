import type { Context } from "../context"
import { initTRPC } from "@trpc/server"
import superjson from "superjson"

const trpcBackend = initTRPC.context<Context>().create({
  transformer: superjson,
})

export const router = trpcBackend.router

export const publicProcedure = trpcBackend.procedure
