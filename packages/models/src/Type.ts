import { z } from "zod"
import { EntityZod } from "./Entity"

export const TypeZod = {
  id: EntityZod.id,
  name: z.string().trim().min(2).max(100),
}
export const TypeZodObject = z.object(TypeZod)
export type Type = z.infer<typeof TypeZodObject>

export const TypeCreateZodObject = z.object({
  name: TypeZod.name,
})
export type TypeCreate = z.infer<typeof TypeCreateZodObject>

export const TypeDeleteZodObject = z.object({
  id: TypeZod.id,
})
export type TypeDelete = z.infer<typeof TypeDeleteZodObject>
