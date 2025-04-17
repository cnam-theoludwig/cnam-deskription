import packageJSON from "../package.json" with { type: "json" }

export const VERSION = packageJSON.version

export const TRPC_PREFIX = "/trpc"
