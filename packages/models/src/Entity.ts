import type { PickStrict, Primitive } from "@repo/utils/types"
import { z } from "zod"

export const EntityZod = {
  id: z.string(),
}
export const EntityZodObject = z.object(EntityZod)
export type Entity = z.infer<typeof EntityZodObject>

export const SearchQueryZod = z
  .union([
    z.literal("").transform(() => {
      return null
    }),
    z.string().min(1),
  ])
  .nullish()
export type SearchQuery = z.infer<typeof SearchQueryZod>

export const EmailZod = z.string().min(3).max(255).email()

export const createUnionZod = <T extends Primitive>(
  literals: readonly T[],
): z.ZodUnion<
  readonly [z.ZodLiteral<T>, z.ZodLiteral<T>, ...Array<z.ZodLiteral<T>>]
> => {
  return z.union(
    literals.map((literal) => {
      return z.literal(literal)
    }) as unknown as readonly [z.ZodTypeAny, z.ZodTypeAny, ...z.ZodTypeAny[]],
  ) as z.ZodUnion<
    readonly [z.ZodLiteral<T>, z.ZodLiteral<T>, ...Array<z.ZodLiteral<T>>]
  >
}

export const PAGINATION_PER_PAGE_DEFAULT = 20
export const PAGINATION_SERVER_MAX_PER_PAGE = 15
export const PaginationInputZod = {
  page: z.number().int().min(1).default(1),
  perPage: z
    .number()
    .int()
    .min(1)
    .max(100)
    .default(PAGINATION_PER_PAGE_DEFAULT),
}
export const PaginationInputZodObject = z.object(PaginationInputZod)
export type PaginationInput = z.infer<typeof PaginationInputZodObject>
export interface PaginationInformation {
  page: number
  totalItems: number
  itemsPerPage: number
  itemsLength: number
}
export const calculatePaginationOffset = (input: PaginationInput): number => {
  return (input.page - 1) * input.perPage
}
export const calculateRowNumberFromIndex = (
  input: PickStrict<PaginationInformation, "page" | "itemsPerPage"> & {
    index: number
  },
): number => {
  return input.index + 1 + (input.page - 1) * input.itemsPerPage
}

export const BOOLEAN_VALUES = [true, false] as const
export type BooleanValue = (typeof BOOLEAN_VALUES)[number]
export const BooleanZod = createUnionZod(BOOLEAN_VALUES)
