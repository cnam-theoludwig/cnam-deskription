import { z } from "zod"
import { EntityZod } from "./Entity"

export const FurnitureZod = {
  id: EntityZod.id,
  name: z.string().trim().min(2).max(100),
  location_id: z.string().uuid(),
  type_id: z.string().uuid(),
  state_id: z.string().uuid(),
}
export const FurnitureZodObject = z.object(FurnitureZod)
export type Furniture = z.infer<typeof FurnitureZodObject>

export const FurnitureCreateZodObject = z.object({
  name: FurnitureZod.name,
  location_id: FurnitureZod.location_id,
  type_id: FurnitureZod.type_id,
  state_id: FurnitureZod.state_id,
})
export type FurnitureCreate = z.infer<typeof FurnitureCreateZodObject>

export const FurnitureDeleteZodObject = z.object({
  id: FurnitureZod.id,
})
export type FurnitureDelete = z.infer<typeof FurnitureDeleteZodObject>
