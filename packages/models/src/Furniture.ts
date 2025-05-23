import { z } from "zod"
import { BuildingZod } from "./Building"
import { EntityZod } from "./Entity"
import { RoomZod } from "./Room"
import { StateZod } from "./State"
import { StoreyZod } from "./Storey"
import { TypeZod } from "./Type"

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

export const FurnitureWithRelations = FurnitureZodObject.extend({
  state: StateZod.name,
  type: TypeZod.name,
  building: BuildingZod.name,
  storey: StoreyZod.name,
  room: RoomZod.name,
})
