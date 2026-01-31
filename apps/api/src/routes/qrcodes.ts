import { database } from "@repo/models/database"
import { FurnitureZod } from "@repo/models/Furniture"
import { LocationZod } from "@repo/models/Location"
import { StateZod } from "@repo/models/State"
import { TypeZod } from "@repo/models/Type"
import * as z from "zod"
import { publicProcedure } from "../oRPC"
import QRCode from "qrcode"

export const qrcodes = {
  /**
   * Génère un QR code pour un meuble spécifique
   */
  generateForFurniture: publicProcedure
    .input(
      z.object({
        furnitureId: FurnitureZod.id,
      })
    )
    .output(
      z.object({
        qrCodeDataUrl: z.string(),
        furnitureId: FurnitureZod.id,
        furnitureName: z.string(),
      })
    )
    .handler(async ({ input }) => {
      // Vérifier que le meuble existe
      const furniture = await database
        .selectFrom("Furniture")
        .select(["id", "name"])
        .where("id", "=", input.furnitureId)
        .executeTakeFirst()

      if (furniture === null || furniture === undefined) {
        throw new Error(`Furniture with id ${input.furnitureId} not found`)
      }

      // Générer le QR code avec l'ID du meuble
      const qrData = JSON.stringify({
        type: "furniture",
        id: furniture.id,
        timestamp: new Date().toISOString(),
      })

      const qrCodeDataUrl = await QRCode.toDataURL(qrData, {
        errorCorrectionLevel: "H",
        width: 300,
        margin: 2,
      })

      return {
        qrCodeDataUrl,
        furnitureId: furniture.id,
        furnitureName: furniture.name,
      }
    }),

  /**
   * Récupère les informations d'un meuble à partir d'un scan de QR code
   */
  scanFurniture: publicProcedure
    .input(
      z.object({
        qrData: z.string(),
      })
    )
    .output(
      z.object({
        id: FurnitureZod.id,
        name: z.string(),
        locationId: LocationZod.id,
        typeId: TypeZod.id,
        stateId: StateZod.id,
        state: z.string(),
        type: z.string(),
        building: z.string(),
        buildingId: z.string(),
        storey: z.string(),
        storeyId: z.string(),
        room: z.string(),
        roomId: z.string(),
        x: z.number(),
        z: z.number(),
        model: z.string().nullish(),
        historyLogs: z.array(z.any()),
      })
    )
    .handler(async ({ input }) => {
      let parsedData: { type: string; id: string }

      try {
        parsedData = JSON.parse(input.qrData) as { type: string; id: string }
      } catch {
        throw new Error("Invalid QR code format")
      }

      if (parsedData.type !== "furniture") {
        throw new Error("QR code is not for a furniture item")
      }

      const furniture = await database
        .selectFrom("Furniture")
        .innerJoin("State", "Furniture.stateId", "State.id")
        .innerJoin("Type", "Furniture.typeId", "Type.id")
        .innerJoin("Location", "Furniture.locationId", "Location.id")
        .innerJoin("Room", "Location.roomId", "Room.id")
        .innerJoin("Storey", "Room.storeyId", "Storey.id")
        .innerJoin("Building", "Storey.buildingId", "Building.id")
        .select([
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
        ])
        .where("Furniture.id", "=", parsedData.id)
        .executeTakeFirst()

      if (furniture === null || furniture === undefined) {
        throw new Error(`Furniture with id ${parsedData.id} not found`)
      }

      // Récupérer l'historique des logs pour ce meuble
      const historyLogs = await database
        .selectFrom("HistoryLog")
        .selectAll()
        .where("furnitureId", "=", parsedData.id)
        .orderBy("modifiedAt", "desc")
        .execute()

      return {
        ...furniture,
        x: Number(furniture.x),
        z: Number(furniture.z),
        historyLogs,
      }
    }),
}
