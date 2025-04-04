import type { AppRouter } from "@repo/api"
import { TRPC_PREFIX } from "@repo/utils/constants"
import { createTRPCClient, httpLink } from "@trpc/client"
import superjson from "superjson"

export const API_URL = process.env["API_URL"] ?? "http://localhost:8500"

export const API_TRPC_URL = `${API_URL}${TRPC_PREFIX}`

export const trpcClient = createTRPCClient<AppRouter>({
  links: [
    httpLink({
      url: API_TRPC_URL,
      transformer: superjson
    }),
  ],
})
