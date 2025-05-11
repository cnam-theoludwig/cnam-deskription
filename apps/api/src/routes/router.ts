import { os } from "@orpc/server"
import { database } from "@repo/models/database"
import {
  FurnitureCreateZodObject,
  FurnitureZod,
  FurnitureZodObject,
} from "@repo/models/Furniture"

import {
  BuildingZod,
  BuildingCreateZodObject,
  BuildingZodObject,
} from "@repo/models/Building"

import {
  StoreyCreateZodObject,
  StoreyZod,
  StoreyZodObject,
} from "@repo/models/Storey"

import { RoomZod, RoomCreateZodObject, RoomZodObject } from "@repo/models/Room"

import {
  LocationZod,
  LocationCreateZodObject,
  LocationZodObject,
} from "@repo/models/Location"

import { z } from "zod"

export const router = {
  furnitures: {
    get: os
      .route({ method: "GET", path: "/furnitures" })
      .output(z.array(FurnitureZodObject))
      .handler(async () => {
        const furnitures = await database
          .selectFrom("Furniture")
          .selectAll()
          .execute()
        return furnitures
      }),

    create: os
      .route({ method: "POST", path: "/furnitures" })
      .input(FurnitureCreateZodObject)
      .output(FurnitureZodObject)
      .handler(async ({ input }) => {
        const furniture = await database
          .insertInto("Furniture")
          .values(input)
          .returningAll()
          .executeTakeFirstOrThrow()
        return furniture
      }),

    delete: os
      .route({ method: "DELETE", path: "/furnitures" })
      .input(FurnitureZod.id)
      .output(FurnitureZodObject)
      .handler(async ({ input }) => {
        const furniture = await database
          .deleteFrom("Furniture")
          .where("id", "=", input)
          .returningAll()
          .executeTakeFirstOrThrow()
        return furniture
      }),
  },

  buildings: {
    get: os
      .route({ method: "GET", path: "/buildings" })
      .output(z.array(BuildingZodObject))
      .handler(async () => {
        const buildings = await database
          .selectFrom("Building")
          .selectAll()
          .execute()
        return buildings
      }),

    create: os
      .route({ method: "POST", path: "/buildings" })
      .input(BuildingCreateZodObject)
      .output(BuildingZodObject)
      .handler(async ({ input }) => {
        const building = await database
          .insertInto("Building")
          .values(input)
          .returningAll()
          .executeTakeFirstOrThrow()
        return building
      }),

    delete: os
      .route({ method: "DELETE", path: "/buildings" })
      .input(BuildingZod.id)
      .output(BuildingZodObject)
      .handler(async ({ input }) => {
        const building = await database
          .deleteFrom("Building")
          .where("id", "=", input)
          .returningAll()
          .executeTakeFirstOrThrow()
        return building
      }),
  },

  storeys: {
    get: os
      .route({ method: "GET", path: "/storeys" })
      .output(StoreyZodObject.array())
      .handler(async () => {
        const storeys = await database
          .selectFrom("Storey")
          .selectAll()
          .execute()
        return storeys
      }),

    create: os
      .route({ method: "POST", path: "/storeys" })
      .input(StoreyCreateZodObject)
      .output(StoreyZodObject)
      .handler(async ({ input }) => {
        const storey = await database
          .insertInto("Storey")
          .values(input)
          .returningAll()
          .executeTakeFirstOrThrow()
        return storey
      }),

    delete: os
      .route({ method: "DELETE", path: "/storeys" })
      .input(StoreyZod.id)
      .output(StoreyZodObject)
      .handler(async ({ input }) => {
        const storey = await database
          .deleteFrom("Storey")
          .where("id", "=", input)
          .returningAll()
          .executeTakeFirstOrThrow()
        return storey
      }),
  },

  rooms: {
    get: os
      .route({ method: "GET", path: "/rooms" })
      .output(z.array(RoomZodObject))
      .handler(async () => {
        const rooms = await database.selectFrom("Room").selectAll().execute()
        return rooms
      }),

    create: os
      .route({ method: "POST", path: "/rooms" })
      .input(RoomCreateZodObject)
      .output(RoomZodObject)
      .handler(async ({ input }) => {
        const room = await database
          .insertInto("Room")
          .values(input)
          .returningAll()
          .executeTakeFirstOrThrow()
        return room
      }),

    delete: os
      .route({ method: "DELETE", path: "/rooms" })
      .input(RoomZod.id)
      .output(RoomZodObject)
      .handler(async ({ input }) => {
        const room = await database
          .deleteFrom("Room")
          .where("id", "=", input)
          .returningAll()
          .executeTakeFirstOrThrow()
        return room
      }),
  },

  locations: {
    get: os
      .route({ method: "GET", path: "/locations" })
      .output(z.array(LocationZodObject))
      .handler(async () => {
        const locations = await database
          .selectFrom("Location")
          .selectAll()
          .execute()
        return locations
      }),
    create: os
      .route({ method: "POST", path: "/locations" })
      .input(LocationCreateZodObject)
      .output(LocationZodObject)
      .handler(async ({ input }) => {
        const location = await database
          .insertInto("Location")
          .values(input)
          .returningAll()
          .executeTakeFirstOrThrow()
        return location
      }),
    delete: os
      .route({ method: "DELETE", path: "/locations" })
      .input(LocationZod.id)
      .output(LocationZodObject)
      .handler(async ({ input }) => {
        const location = await database
          .deleteFrom("Location")
          .where("id", "=", input)
          .returningAll()
          .executeTakeFirstOrThrow()
        return location
      }),
  },
}
