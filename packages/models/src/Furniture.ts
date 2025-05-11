import { z } from "zod"
import { EntityZod } from "./Entity"

export const FurnitureZod = {
  id: EntityZod.id,
  name: z.string().trim().min(2).max(100),
  locationId: z.string().uuid(),
  typeId: z.string().uuid(),
  stateId: z.string().uuid(),
}
export const FurnitureZodObject = z.object(FurnitureZod)
export type Furniture = z.infer<typeof FurnitureZodObject>

export const FurnitureCreateZodObject = z.object({
  name: FurnitureZod.name,
  locationId: FurnitureZod.locationId,
  typeId: FurnitureZod.typeId,
  stateId: FurnitureZod.stateId,
})
export type FurnitureCreate = z.infer<typeof FurnitureCreateZodObject>

export const FurnitureDeleteZodObject = z.object({
  id: FurnitureZod.id,
})
export type FurnitureDelete = z.infer<typeof FurnitureDeleteZodObject>
