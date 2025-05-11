import type {
  ExpressionBuilder,
  ExpressionWrapper,
  OnConflictDatabase,
  OnConflictTables,
  ReferenceExpression,
  SqlBool,
  StringReference,
} from "kysely"
import { expressionBuilder, sql } from "kysely"
import type { Database, DatabaseTable } from "./types.ts"

interface SearchStringExpressionInput<Table extends DatabaseTable> {
  column: ReferenceExpression<Database, Table>
  query: string

  /**
   * @see https://www.postgresql.org/docs/current/pgtrgm.html
   */
  withFullTextSearch?: boolean
}

/**
 * Create an expression that matches a column against a search query.
 *
 * @see https://www.postgresql.org/docs/current/unaccent.html
 * @param input
 * @returns
 */
export const searchStringExpression = <Table extends DatabaseTable>(
  input: SearchStringExpressionInput<Table>,
): ExpressionWrapper<Database, Table, SqlBool> => {
  const { column, query, withFullTextSearch = false } = input
  const expression = expressionBuilder<Database, Table>()

  if (withFullTextSearch) {
    return expression(column, sql`%`, query)
  }

  return expression(
    expression.fn("unaccent", [column]),
    "ilike",
    expression.fn("unaccent", [expression.val(`%${query}%`)]),
  )
}

export const doUpdateSetEverything = <Table extends DatabaseTable>(
  values: Array<any>,
) => {
  return (
    expression: ExpressionBuilder<
      OnConflictDatabase<Database, Table>,
      OnConflictTables<Table>
    >,
  ) => {
    const keys = Object.keys(values[0])
    return Object.fromEntries(
      keys.map((key) => {
        return [
          key,
          expression.ref(
            `excluded.${key}` as StringReference<
              OnConflictDatabase<Database, Table>,
              OnConflictTables<Table>
            >,
          ),
        ]
      }),
    )
  }
}
