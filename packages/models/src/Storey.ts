import * as z from "zod"
import { EntityZod } from "./Entity"
import { BuildingZod } from "./Building"

export const StoreyZod = {
  id: EntityZod.id,
  name: z.string().trim().min(2).max(100),
  buildingId: BuildingZod.id,
  floorPlanImage: z.string().nullable().optional(),
}
export const StoreyZodObject = z.object(StoreyZod)
export type Storey = z.infer<typeof StoreyZodObject>

export const StoreyCreateZodObject = z.object({
  name: StoreyZod.name,
  buildingId: StoreyZod.buildingId,
})
export type StoreyCreate = z.infer<typeof StoreyCreateZodObject>

export const StoreyDeleteZodObject = z.object({
  id: StoreyZod.id,
})
export type StoreyDelete = z.infer<typeof StoreyDeleteZodObject>

export const StoreyUpdateZodObject = z.object({
  id: StoreyZod.id,
  name: StoreyZod.name.optional(),
  floorPlanImage: z.string().nullable().optional(),
})
export type StoreyUpdate = z.infer<typeof StoreyUpdateZodObject>
