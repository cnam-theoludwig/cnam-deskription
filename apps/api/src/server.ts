const beforeTimeMs = performance.now()

import { application } from "#application.ts"
import { HOST, PORT } from "#configuration.ts"
import { database } from "@repo/models/database"
import { VERSION } from "@repo/utils/constants"
import util from "node:util"
import prettyMilliseconds from "pretty-ms"

const address = await application.listen({
  port: PORT,
  host: HOST,
})
const gracefulShutdown = async (): Promise<void> => {
  await application.close()
  await database.destroy()
  process.exit(0)
}
process.on("SIGTERM", gracefulShutdown)
process.on("SIGINT", gracefulShutdown)

const afterTimeMs = performance.now()
const elapsedTimeMs = afterTimeMs - beforeTimeMs
console.log(
  `API ${util.styleText("bold", `v${VERSION}`)} listening at ${util.styleText("cyan", address)}`,
)
console.log(`Ready in ${prettyMilliseconds(elapsedTimeMs)}`)
console.log()
