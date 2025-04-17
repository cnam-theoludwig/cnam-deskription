import fastifyCors from "@fastify/cors"
import fastifyHelmet from "@fastify/helmet"
// import fastifyRateLimit from "@fastify/rate-limit"
import fastifySensible from "@fastify/sensible"
import type { FastifyTRPCPluginOptions } from "@trpc/server/adapters/fastify"
import { fastifyTRPCPlugin } from "@trpc/server/adapters/fastify"
import fastify from "fastify"

import { createContext } from "./context"
import type { AppRouter } from "./routes/router"
import { appRouter } from "./routes/router"
import { TRPC_PREFIX } from "@repo/utils/constants"
import { getHTTPStatusCodeFromError } from "@trpc/server/http"

export const application = fastify({
  maxParamLength: 5_000,
})

await application.register(fastifyCors, {
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
})
await application.register(fastifySensible)
await application.register(fastifyHelmet, {
  crossOriginResourcePolicy: {
    policy: "cross-origin",
  },
})
// await application.register(fastifyRateLimit, {
//   max: 120,
//   timeWindow: "1 minute",
// })

await application.register(fastifyTRPCPlugin, {
  prefix: TRPC_PREFIX,
  trpcOptions: {
    router: appRouter,
    createContext,
    onError({ path, error }) {
      const httpCode = getHTTPStatusCodeFromError(error)
      if (httpCode >= 500) {
        console.error(`Error in tRPC handler on path '${path}':`, error)
      }
    },
  } satisfies FastifyTRPCPluginOptions<AppRouter>["trpcOptions"],
})
