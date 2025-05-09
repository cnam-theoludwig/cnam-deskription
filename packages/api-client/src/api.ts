import { createORPCClient } from "@orpc/client"
import { RPCLink } from "@orpc/client/fetch"
import type { RouterClient } from "@orpc/server"
import type { router } from "@repo/api"
import { RPC_PREFIX } from "@repo/utils/constants"

export const API_URL = "http://localhost:8500"

export const getRPCClient = (url?: string): RouterClient<typeof router> => {
  const rpcLink = new RPCLink({
    url: (url ?? API_URL) + RPC_PREFIX,
  })
  return createORPCClient(rpcLink)
}

// const openAPILink = new OpenAPILink(router, {
//   url: API_URL + OPENAPI_PREFIX,
// })
// export const openAPIClient: JsonifiedClient<
//   ContractRouterClient<typeof router>
// > = createORPCClient(openAPILink)
