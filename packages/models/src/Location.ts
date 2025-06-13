import { z } from "zod/v4"
import { EntityZod } from "./Entity"
import { BuildingZod } from "./Building"
import { StoreyZod } from "./Storey"
import { RoomZod } from "./Room"

export const LocationZod = {
  id: EntityZod.id,
  buildingId: BuildingZod.id,
  storeyId: StoreyZod.id,
  roomId: RoomZod.id,
}
export const LocationZodObject = z.object(LocationZod)
export type Location = z.infer<typeof LocationZodObject>

export const LocationCreateZodObject = z.object({
  buildingId: LocationZod.buildingId,
  storeyId: LocationZod.storeyId,
  roomId: LocationZod.roomId,
})
export type LocationCreate = z.infer<typeof LocationCreateZodObject>

export const LocationDeleteZodObject = z.object({
  id: LocationZod.id,
})
export type LocationDelete = z.infer<typeof LocationDeleteZodObject>
