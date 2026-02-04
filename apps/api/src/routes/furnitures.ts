import { database, searchStringExpression } from "@repo/models/database"
import {
  FurnitureCreateZodObject,
  FurnitureUpdateZodObject,
  FurnitureWithRelationsZodObject,
  FurnitureZod,
  FurnitureZodObject,
} from "@repo/models/Furniture"
import { jsonArrayFrom } from "kysely/helpers/postgres"
import * as z from "zod"
import { publicProcedure } from "../oRPC"
import { RoomZod } from "@repo/models/Room"

export const furnitureSelect = database
  .selectFrom("Furniture")
  .innerJoin("State", "Furniture.stateId", "State.id")
  .innerJoin("Type", "Furniture.typeId", "Type.id")
  .innerJoin("Location", "Furniture.locationId", "Location.id")
  .innerJoin("Room", "Location.roomId", "Room.id")
  .innerJoin("Storey", "Room.storeyId", "Storey.id")
  .innerJoin("Building", "Storey.buildingId", "Building.id")
  .select((expression) => {
    return [
      "Furniture.id",
      "Furniture.name",
      "Furniture.locationId",
      "Location.buildingId",
      "Location.storeyId",
      "Location.roomId",
      "Furniture.stateId",
      "Furniture.typeId",
      "Furniture.x",
      "Furniture.z",
      "Furniture.model",
      "State.name as state",
      "Type.name as type",
      "Building.name as building",
      "Storey.name as storey",
      "Room.name as room",
      jsonArrayFrom(
        expression
          .selectFrom("HistoryLog")
          .whereRef("furnitureId", "=", "Furniture.id")
          .orderBy("modifiedAt", "desc")
          .selectAll(),
      ).as("historyLogs"),
    ]
  })

export const furnitures = {
  get: publicProcedure
    .route({ method: "GET", path: "/furnitures", tags: ["Furniture"] })
    .output(z.array(FurnitureWithRelationsZodObject))
    .handler(async () => {
      return furnitureSelect.execute()
    }),

  getByRoomId: publicProcedure
    .route({
      method: "GET",
      path: "/furnitures/room/{roomId}",
      tags: ["Furniture"],
    })
    .input(z.object({ roomId: RoomZod.id }))
    .output(z.array(FurnitureWithRelationsZodObject))
    .handler(async ({ input }) => {
      return furnitureSelect
        .where("Location.roomId", "=", input.roomId)
        .execute()
    }),

  create: publicProcedure
    .route({ method: "POST", path: "/furnitures", tags: ["Furniture"] })
    .input(FurnitureCreateZodObject)
    .output(FurnitureWithRelationsZodObject)
    .handler(async ({ input }) => {
      const { id } = await database
        .insertInto("Furniture")
        .values(input)
        .returning(["id"])
        .executeTakeFirstOrThrow()
      return furnitureSelect
        .where("Furniture.id", "=", id)
        .executeTakeFirstOrThrow()
    }),

  update: publicProcedure
    .route({ method: "PUT", path: "/rooms", tags: ["Room"] })
    .input(FurnitureUpdateZodObject)
    .output(FurnitureZodObject)
    .handler(async ({ input }) => {
      const { id, ...dataToUpdate } = input

      const room = await database
        .updateTable("Furniture")
        .set(dataToUpdate)
        .where("id", "=", id)
        .returningAll()
        .executeTakeFirstOrThrow()

      return room
    }),

  search: publicProcedure
    .route({ method: "GET", path: "/furnitures/search", tags: ["Furniture"] })
    .input(
      FurnitureWithRelationsZodObject.omit({ name: true })
        .extend({ name: z.string().trim() })
        .partial(),
    )
    .output(z.array(FurnitureWithRelationsZodObject))
    .handler(async ({ input }) => {
      let query = furnitureSelect
      if (input.name != null && input.name.length > 0) {
        query = query.where(
          searchStringExpression({
            column: "Furniture.name",
            query: input.name,
          }),
        )
      }
      if (input.buildingId != null) {
        query = query.where("Building.id", "=", input.buildingId)
      }
      if (input.storeyId != null) {
        query = query.where("Storey.id", "=", input.storeyId)
      }
      if (input.roomId != null) {
        query = query.where("Room.id", "=", input.roomId)
      }
      if (input.typeId != null) {
        query = query.where("Furniture.typeId", "=", input.typeId)
      }
      if (input.stateId != null) {
        query = query.where("Furniture.stateId", "=", input.stateId)
      }
      return query.execute()
    }),

  delete: publicProcedure
    .route({ method: "DELETE", path: "/furnitures", tags: ["Furniture"] })
    .input(FurnitureZod.id)
    .output(FurnitureZodObject)
    .handler(async ({ input }) => {
      return database
        .deleteFrom("Furniture")
        .where("id", "=", input)
        .returningAll()
        .executeTakeFirstOrThrow()
    }),
  excelExport: publicProcedure
    .route({ method: "POST", path: "/furnitures/export", tags: ["Furniture"] })
    .input(z.array(FurnitureWithRelationsZodObject))
    .output(z.string())
    .handler(async ({ input }) => {
      const rows = input

      const formatted = rows.map((r) => {
        return {
          Name: r.name,
          Type: r.type,
          State: r.state,
          Building: r.building,
          Storey: r.storey,
          Room: r.room,
        }
      })

      const XLSX = await import("xlsx")
      const wb = XLSX.utils.book_new()
      const ws = XLSX.utils.json_to_sheet(formatted)
      XLSX.utils.book_append_sheet(wb, ws, "Furnitures")
      const buf = XLSX.write(wb, { bookType: "xlsx", type: "buffer" })
      return Buffer.from(buf).toString("base64")
    }),
}
