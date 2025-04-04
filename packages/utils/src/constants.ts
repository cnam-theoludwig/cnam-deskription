import packageJSON from "../package.json" with { type: "json" }

export const IS_PRODUCTION = process.env["NODE_ENV"] === "production"
export const VERSION = packageJSON.version

export const TIMEZONE = process.env["TZ"] ?? "Europe/Paris"

export const TRPC_PREFIX = "/trpc"
