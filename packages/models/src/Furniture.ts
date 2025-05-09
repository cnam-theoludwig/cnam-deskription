import { z } from "zod"
import { EntityZod } from "./Entity"

export const FurnitureZod = {
  id: EntityZod.id,
  description: z.string().trim().min(2).max(100),
}
export const FurnitureZodObject = z.object(FurnitureZod)
export type Furniture = z.infer<typeof FurnitureZodObject>

export const FurnitureCreateZodObject = z.object({
  description: FurnitureZod.description,
})
export type FurnitureCreate = z.infer<typeof FurnitureCreateZodObject>

export const FurnitureDeleteZodObject = z.object({
  id: FurnitureZod.id,
})
export type FurnitureDelete = z.infer<typeof FurnitureDeleteZodObject>
