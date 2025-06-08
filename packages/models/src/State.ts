import { z } from "zod/v4"
import { EntityZod } from "./Entity"

export const StateZod = {
  id: EntityZod.id,
  name: z.string().trim().min(2).max(100),
}
export const StateZodObject = z.object(StateZod)
export type State = z.infer<typeof StateZodObject>

export const StateCreateZodObject = z.object({
  name: StateZod.name,
})
export type StateCreate = z.infer<typeof StateCreateZodObject>

export const StateDeleteZodObject = z.object({
  id: StateZod.id,
})
export type StateDelete = z.infer<typeof StateDeleteZodObject>
