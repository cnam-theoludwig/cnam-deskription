import type { CreateFastifyContextOptions } from "@trpc/server/adapters/fastify"

export const createContext = async ({
  req: request,
  res: response,
}: CreateFastifyContextOptions): Promise<{
  request: CreateFastifyContextOptions["req"]
  response: CreateFastifyContextOptions["res"]
}> => {
  return { request, response }
}

export type Context = Awaited<ReturnType<typeof createContext>>
