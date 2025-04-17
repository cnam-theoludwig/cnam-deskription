import path from "node:path"

const IS_PRODUCTION = process.env["NODE_ENV"] === "production"

if (!IS_PRODUCTION) {
  const envRootPath = path.join(process.cwd(), "..", "..", ".env")
  console.log(`Loading env file from ${envRootPath}`)
  console.log()
  process.loadEnvFile(envRootPath)
}

export const DATABASE_USER = process.env["DATABASE_USER"] ?? "deskription_user"
export const DATABASE_PASSWORD = process.env["DATABASE_PASSWORD"] ?? "password"
export const DATABASE_NAME = process.env["DATABASE_NAME"] ?? "deskription"
export const DATABASE_HOST = process.env["DATABASE_HOST"] ?? "localhost"
export const DATABASE_PORT = Number.parseInt(
  process.env["DATABASE_PORT"] ?? "5432",
  10,
)
export const DATABASE_DEBUG = process.env["DATABASE_DEBUG"] === "true"
