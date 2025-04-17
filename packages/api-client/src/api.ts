import type { AppRouter } from "@repo/api"
import { TRPC_PREFIX } from "@repo/utils/constants"
import { createTRPCClient, httpLink } from "@trpc/client"
import superjson from "superjson"

export const API_URL = "http://localhost:8500"

export const API_TRPC_URL = `${API_URL}${TRPC_PREFIX}`

export const getTRPCClient = (
  url?: string,
): ReturnType<typeof createTRPCClient<AppRouter>> => {
  return createTRPCClient<AppRouter>({
    links: [
      httpLink({
        url: url ?? API_TRPC_URL,
        transformer: superjson,
      }),
    ],
  })
}
