import * as z from "zod"
import { EntityZod } from "./Entity"
import { StoreyZod } from "./Storey"

export const RoomZod = {
  id: EntityZod.id,
  name: z.string().trim().min(2).max(100),
  storeyId: StoreyZod.id,
  x: z.coerce.number(),
  z: z.coerce.number(),
  width: z.coerce.number(),
  depth: z.coerce.number(),
  color: z.string(),
}
export const RoomZodObject = z.object(RoomZod)
export type Room = z.infer<typeof RoomZodObject>

export const RoomCreateZodObject = z.object({
  name: RoomZod.name,
  storeyId: RoomZod.storeyId,
  color: RoomZod.color,
})
export type RoomCreate = z.infer<typeof RoomCreateZodObject>

export const RoomUpdateZodObject = z.object({
  id: RoomZod.id,
  name: RoomZod.name.optional(),
  storeyId: RoomZod.storeyId.optional(),
  x: RoomZod.x.optional(),
  z: RoomZod.z.optional(),
  width: RoomZod.width.optional(),
  depth: RoomZod.depth.optional(),
  color: RoomZod.color.optional(),
})
export type RoomUpdate = z.infer<typeof RoomUpdateZodObject>

export const RoomDeleteZodObject = z.object({
  id: RoomZod.id,
})
export type RoomDelete = z.infer<typeof RoomDeleteZodObject>
