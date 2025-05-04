import http from "node:http"
import fs from "node:fs"
import path from "node:path"
import util from "node:util"
import mime from "mime"

const MIMETYPE_DEFAULT = "application/octet-stream"

const args = util.parseArgs({
  options: {
    path: { type: "string", default: "public", required: true },
    port: { type: "string", default: "8000", required: true },
    host: { type: "string", default: "0.0.0.0" },
  },
})

const host = args.values.host
const basePath = args.values.path

const port = Number.parseInt(args.values.port, 10)
if (Number.isNaN(port)) {
  console.error("Error: Invalid port number.")
  process.exit(1)
}

const serverURL = `http://${host}:${port}`

const server = http.createServer(async (request, response) => {
  if (request.url == null) {
    response.writeHead(400, { "Content-Type": "text/plain" })
    response.end("Bad Request")
    return
  }
  const url = new URL(request.url, serverURL)
  const urlPath = url.pathname
  const filePath = path.join(process.cwd(), basePath, urlPath)
  try {
    const stat = await fs.promises.stat(filePath)
    if (stat.isDirectory()) {
      const indexFile = path.join(filePath, "index.html")
      try {
        const fileContent = await fs.promises.readFile(indexFile)
        response.writeHead(200, { "Content-Type": "text/html" })
        response.end(fileContent)
      } catch {
        response.writeHead(403, { "Content-Type": "text/plain" })
        response.end("Error: Directory listing not allowed.")
      }
    } else {
      const mimeType = mime.getType(filePath) ?? MIMETYPE_DEFAULT
      const fileContent = await fs.promises.readFile(filePath)
      response.writeHead(200, { "Content-Type": mimeType })
      response.end(fileContent)
    }
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT") {
      response.writeHead(404, { "Content-Type": "text/plain" })
      response.end("Error: File not found.")
    } else {
      response.writeHead(500, { "Content-Type": "text/plain" })
      response.end("Error: Internal Server Error.")
    }
  }
})

const gracefulShutdown = (): void => {
  server.close()
  process.exit(0)
}
process.on("SIGTERM", gracefulShutdown)
process.on("SIGINT", gracefulShutdown)

server.listen(
  {
    host,
    port,
  },
  () => {
    console.log(
      `HTTP Server is listening at ${util.styleText("cyan", serverURL)}`,
    )
    console.log(`Serving files from: \`${basePath}\``)
  },
)
