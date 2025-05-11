import { z } from "zod"
import { EntityZod } from "./Entity"

export const LocationZod = {
  id: EntityZod.id,
  building_id: z.string().uuid(),
  storey_id: z.string().uuid(),
  room_id: z.string().uuid(),
}
export const LocationZodObject = z.object(LocationZod)
export type Location = z.infer<typeof LocationZodObject>

export const LocationCreateZodObject = z.object({
  building_id: LocationZod.building_id,
  storey_id: LocationZod.storey_id,
  room_id: LocationZod.room_id,
})
export type LocationCreate = z.infer<typeof LocationCreateZodObject>

export const LocationDeleteZodObject = z.object({
  id: LocationZod.id,
})
export type LocationDelete = z.infer<typeof LocationDeleteZodObject>
