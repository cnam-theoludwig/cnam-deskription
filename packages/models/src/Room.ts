import { z } from "zod"
import { EntityZod } from "./Entity"

export const RoomZod = {
  id: EntityZod.id,
  name: z.string().trim().min(2).max(100),
  storey_id: z.string().uuid(),
}
export const RoomZodObject = z.object(RoomZod)
export type Room = z.infer<typeof RoomZodObject>

export const RoomCreateZodObject = z.object({
  name: RoomZod.name,
  storey_id: RoomZod.storey_id,
})
export type RoomCreate = z.infer<typeof RoomCreateZodObject>

export const RoomDeleteZodObject = z.object({
  id: RoomZod.id,
})
export type RoomDelete = z.infer<typeof RoomDeleteZodObject>
