import * as z from "zod"
import { BuildingZod } from "./Building"
import { EntityZod } from "./Entity"
import { RoomZod } from "./Room"
import { StateZod } from "./State"
import { StoreyZod } from "./Storey"
import { TypeZod } from "./Type"
import { LocationZod } from "./Location"
import { HistoryLogZodObject } from "./HistoryLog"

export const FurnitureZod = {
  id: EntityZod.id,
  name: z.string().trim().min(3).max(100),
  locationId: LocationZod.id,
  typeId: TypeZod.id,
  stateId: StateZod.id,
  x: z.coerce.number(),
  z: z.coerce.number(),
  model: z.string().nullish(),
}
export const FurnitureZodObject = z.object(FurnitureZod)
export type Furniture = z.infer<typeof FurnitureZodObject>

export const FurnitureCreateZodObject = z.object({
  name: FurnitureZod.name,
  locationId: FurnitureZod.locationId,
  typeId: FurnitureZod.typeId,
  stateId: FurnitureZod.stateId,
  x: FurnitureZod.x,
  z: FurnitureZod.z,
  model: FurnitureZod.model,
})
export type FurnitureCreate = z.infer<typeof FurnitureCreateZodObject>

export const FurnitureDeleteZodObject = z.object({
  id: FurnitureZod.id,
})
export type FurnitureDelete = z.infer<typeof FurnitureDeleteZodObject>

export const FurnitureWithRelationsZodObject = FurnitureZodObject.extend({
  state: StateZod.name,
  type: TypeZod.name,
  building: BuildingZod.name,
  buildingId: BuildingZod.id,
  storey: StoreyZod.name,
  storeyId: StoreyZod.id,
  room: RoomZod.name,
  roomId: RoomZod.id,
  x: FurnitureZod.x,
  z: FurnitureZod.z,
  model: FurnitureZod.model,
  historyLogs: z.array(HistoryLogZodObject),
})

export type FurnitureWithRelations = z.infer<
  typeof FurnitureWithRelationsZodObject
>
