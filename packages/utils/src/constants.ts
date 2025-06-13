import packageJSON from "../package.json" with { type: "json" }

export const NAME = "Deskription"
export const VERSION = packageJSON.version

export const OPENAPI_PREFIX = "/"
export const RPC_PREFIX = "/rpc"
