const beforeTimeMs = performance.now()

import { database } from "@repo/models/database"
import {
  NAME,
  OPENAPI_PREFIX,
  RPC_PREFIX,
  VERSION,
} from "@repo/utils/constants"
import { createServer } from "node:http"
import util from "node:util"
import prettyMilliseconds from "pretty-ms"
import { openAPIGenerator, openAPIHandler, rpcHandler } from "./application"
import { HOST, PORT } from "./configuration"
import { router } from "./routes/router"

const server = createServer(async (request, response) => {
  const resultRPC = await rpcHandler.handle(request, response, {
    context: { headers: request.headers },
    prefix: RPC_PREFIX,
  })
  if (resultRPC.matched) {
    return
  }

  if (request.url === "/spec.json") {
    const spec = await openAPIGenerator.generate(router, {
      info: {
        title: NAME,
        version: VERSION,
      },
      servers: [{ url: OPENAPI_PREFIX }],
      security: [{ bearerAuth: [] }],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: "http",
            scheme: "bearer",
          },
        },
      },
    })

    response.writeHead(200, { "Content-Type": "application/json" })
    response.end(JSON.stringify(spec))
    return
  }

  const resultOpenAPI = await openAPIHandler.handle(request, response, {
    context: { headers: request.headers },
    prefix: OPENAPI_PREFIX,
  })
  if (resultOpenAPI.matched) {
    return
  }

  const html = `
    <!doctype html>
    <html>
      <head>
        <title>${NAME}</title>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" type="image/svg+xml" href="https://orpc.unnoq.com/icon.svg" />
      </head>
      <body>
        <div id="app"></div>

        <script src="https://cdn.jsdelivr.net/npm/@scalar/api-reference"></script>
        <script>
          Scalar.createApiReference('#app', {
            url: '/spec.json',
            authentication: {
              securitySchemes: {
                bearerAuth: {
                  token: 'default-token',
                },
              },
            },
          })
        </script>
      </body>
    </html>
  `

  response.writeHead(200, { "Content-Type": "text/html" })
  response.end(html)
})

const gracefulShutdown = async (): Promise<void> => {
  await database.destroy()
  server.close((error) => {
    if (error != null) {
      console.error("Error during server shutdown:", error)
      return process.exit(1)
    }
    process.exit(0)
  })
}
process.on("SIGTERM", gracefulShutdown)
process.on("SIGINT", gracefulShutdown)

server.listen(PORT, HOST, () => {
  const afterTimeMs = performance.now()
  const elapsedTimeMs = afterTimeMs - beforeTimeMs

  const address = JSON.stringify(server.address())
  console.log(
    `API ${util.styleText("bold", `v${VERSION}`)} listening at ${util.styleText("cyan", address)}`,
  )
  console.log(`Ready in ${prettyMilliseconds(elapsedTimeMs)}`)
  console.log()
})
