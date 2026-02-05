import * as z from "zod"
import { EntityZod } from "./Entity"

export const BuildingZod = {
  id: EntityZod.id,
  name: z.string().trim().min(2).max(100),
}
export const BuildingZodObject = z.object(BuildingZod)
export type Building = z.infer<typeof BuildingZodObject>

export const BuildingCreateZodObject = z.object({
  name: BuildingZod.name,
})
export type BuildingCreate = z.infer<typeof BuildingCreateZodObject>

export const BuildingDeleteZodObject = z.object({
  id: BuildingZod.id,
})
export type BuildingDelete = z.infer<typeof BuildingDeleteZodObject>

export const BuildingUpdateZodObject = z.object({
  id: BuildingZod.id,
  name: BuildingZod.name.optional(),
})
export type BuildingUpdate = z.infer<typeof BuildingUpdateZodObject>
