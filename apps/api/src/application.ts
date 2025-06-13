import { RPCHandler } from "@orpc/server/node"
import { OpenAPIHandler } from "@orpc/openapi/node"
import { CORSPlugin } from "@orpc/server/plugins"
import {
  experimental_ZodToJsonSchemaConverter as ZodToJsonSchemaConverter,
  experimental_ZodSmartCoercionPlugin as ZodSmartCoercionPlugin,
} from "@orpc/zod/zod4"
import { router } from "./routes/router"
import { OpenAPIGenerator } from "@orpc/openapi"

const corsPlugin = new CORSPlugin({
  exposeHeaders: ["Content-Disposition"],
})

export const rpcHandler = new RPCHandler(router, {
  plugins: [corsPlugin],
})

export const openAPIHandler = new OpenAPIHandler(router, {
  plugins: [corsPlugin, new ZodSmartCoercionPlugin()],
})
export const openAPIGenerator = new OpenAPIGenerator({
  schemaConverters: [new ZodToJsonSchemaConverter()],
})
