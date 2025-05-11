import { z } from "zod"
import { EntityZod } from "./Entity"

export const LocationZod = {
  id: EntityZod.id,
  buildingId: z.string().uuid(),
  storeyId: z.string().uuid(),
  roomId: z.string().uuid(),
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
