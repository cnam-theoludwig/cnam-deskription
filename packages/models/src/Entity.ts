import * as z from "zod"

export const EntityZod = {
  id: z.uuid(),
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

export const EmailZod = z.email().min(3).max(255)

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
  input: Pick<PaginationInformation, "page" | "itemsPerPage"> & {
    index: number
  },
): number => {
  return input.index + 1 + (input.page - 1) * input.itemsPerPage
}
