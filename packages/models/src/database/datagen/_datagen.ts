import { database } from "../database"
import { datagenBuilding } from "./Building"
import { datagenState } from "./State"
import { datagenType } from "./Type"

await datagenType()
await datagenState()
await datagenBuilding()

await database.destroy()
