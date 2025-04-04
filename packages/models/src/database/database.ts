import { Kysely } from "kysely"
import { PostgresJSDialect } from "kysely-postgres-js"
import postgres from "postgres"
import prettyMilliseconds from "pretty-ms"
import {
  DATABASE_DEBUG,
  DATABASE_HOST,
  DATABASE_NAME,
  DATABASE_PASSWORD,
  DATABASE_PORT,
  DATABASE_USER,
} from "./configuration.ts"
import type { Database } from "./types.ts"

const dialect = new PostgresJSDialect({
  postgres: postgres({
    database: DATABASE_NAME,
    host: DATABASE_HOST,
    user: DATABASE_USER,
    password: DATABASE_PASSWORD,
    port: DATABASE_PORT,

    types: {
      // Numbers, bigint, numeric:
      // - https://github.com/porsager/postgres#numbers-bigint-numeric
      // - https://github.com/porsager/postgres/pull/128
      number: {
        to: 0,
        from: [20, 21, 23, 26, 700, 701],
        serialize: (value: number) => {
          return value.toString()
        },
        parse: (value: string) => {
          return Number.parseInt(value, 10)
        },
      },
    },
  }),
})

export * from "./utils.ts"

export const database = new Kysely<Database>({
  dialect,
  log: (event) => {
    if (event.level === "error") {
      console.error(`kysely:error:`, event.error)
      console.error(`kysely:error:query:`, event.query.sql)
      console.error(`kysely:error:parameters:`, event.query.parameters)
      console.error(
        `kysely:error:duration:`,
        prettyMilliseconds(event.queryDurationMillis),
      )
      console.error()
      return
    }

    if (DATABASE_DEBUG) {
      console.log(`kysely:query:`, event.query.sql)
      console.log("kysely:query:parameters:", event.query.parameters)
      console.log(
        `kysely:query:duration:`,
        prettyMilliseconds(event.queryDurationMillis),
      )
      console.log()
    }
  },
})
