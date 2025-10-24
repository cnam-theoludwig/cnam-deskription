import type { Satisfies } from "@repo/utils/types"
import * as z from "zod"
import type { Database } from "./database/types"
import { EntityZod } from "./Entity"

export const HISTORY_LOG_COLUMNS = [
  "Name",
  "Location",
  "Type",
  "State",
] as const
export type HistoryLogColumn = Satisfies<
  (typeof HISTORY_LOG_COLUMNS)[number],
  Database["HistoryLog"]["column"]
>
export const HistoryLogColumnZod = z.enum(HISTORY_LOG_COLUMNS)

export const HistoryLogZod = {
  id: EntityZod.id,
  modifiedAt: z.coerce.date(),
  furnitureId: EntityZod.id,
  column: HistoryLogColumnZod,
  oldValue: z.string().trim().min(1),
  newValue: z.string().trim().min(1),
}
export const HistoryLogZodObject = z.object(HistoryLogZod)
export type HistoryLog = z.infer<typeof HistoryLogZodObject>
