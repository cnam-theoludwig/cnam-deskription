import * as z from "zod"
import { BuildingZod } from "./Building"
import { EntityZod } from "./Entity"
import { RoomZod } from "./Room"
import { StateZod } from "./State"
import { StoreyZod } from "./Storey"
import { TypeZod } from "./Type"
import { LocationZod } from "./Location"

export const FurnitureZod = {
  id: EntityZod.id,
  name: z.string().trim().min(3).max(100),
  locationId: LocationZod.id,
  typeId: TypeZod.id,
  stateId: StateZod.id,
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

export const FurnitureWithRelationsIds = FurnitureZodObject.extend({
  buildingId: BuildingZod.id,
  storeyId: StoreyZod.id,
  roomId: RoomZod.id,
  stateId: StateZod.id,
  typeId: TypeZod.id,
})

export type FurnitureWithRelationsIdsType = z.infer<
  typeof FurnitureWithRelationsIds
>
