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

import { TypeZod, TypeCreateZodObject, TypeZodObject } from "@repo/models/Type"
import {
  StateZod,
  StateCreateZodObject,
  StateZodObject,
} from "@repo/models/State"

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

    getByBuildingId: os
      .route({ method: "POST", path: "/storeys/:buildingId" })
      .input(z.string())
      .output(z.array(StoreyZodObject))
      .handler(async ({ input }) => {
        const storeys = await database
          .selectFrom("Storey")
          .selectAll()
          .where("buildingId", "=", input)
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

    getByStoreyId: os
      .route({ method: "POST", path: "/rooms/:storeyId" })
      .input(z.string())
      .output(z.array(RoomZodObject))
      .handler(async ({ input }) => {
        const rooms = await database
          .selectFrom("Room")
          .selectAll()
          .where("storeyId", "=", input)
          .execute()
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

    exists: os
      .route({ method: "POST", path: "/locations/check" })
      .input(LocationCreateZodObject)
      .output(LocationZodObject.or(z.null()))
      .handler(async ({ input }) => {
        const location = await database
          .selectFrom("Location")
          .selectAll()
          .where("buildingId", "=", input.buildingId)
          .where("storeyId", "=", input.storeyId)
          .where("roomId", "=", input.roomId)
          .executeTakeFirst()
        if (location == null) {
          return null
        }
        return location
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

  types: {
    get: os
      .route({ method: "GET", path: "/types" })
      .output(z.array(TypeZodObject))
      .handler(async () => {
        const types = await database.selectFrom("Type").selectAll().execute()
        return types
      }),

    create: os
      .route({ method: "POST", path: "/types" })
      .input(TypeCreateZodObject)
      .output(TypeZodObject)
      .handler(async ({ input }) => {
        const type = await database
          .insertInto("Type")
          .values(input)
          .returningAll()
          .executeTakeFirstOrThrow()
        return type
      }),

    delete: os
      .route({ method: "DELETE", path: "/types" })
      .input(TypeZod.id)
      .output(TypeZodObject)
      .handler(async ({ input }) => {
        const type = await database
          .deleteFrom("Type")
          .where("id", "=", input)
          .returningAll()
          .executeTakeFirstOrThrow()
        return type
      }),
  },

  states: {
    get: os
      .route({ method: "GET", path: "/states" })
      .output(z.array(StateZodObject))
      .handler(async () => {
        const states = await database.selectFrom("State").selectAll().execute()
        return states
      }),

    create: os
      .route({ method: "POST", path: "/states" })
      .input(StateCreateZodObject)
      .output(StateZodObject)
      .handler(async ({ input }) => {
        const state = await database
          .insertInto("State")
          .values(input)
          .returningAll()
          .executeTakeFirstOrThrow()
        return state
      }),

    delete: os
      .route({ method: "DELETE", path: "/states" })
      .input(StateZod.id)
      .output(StateZodObject)
      .handler(async ({ input }) => {
        const state = await database
          .deleteFrom("State")
          .where("id", "=", input)
          .returningAll()
          .executeTakeFirstOrThrow()
        return state
      }),
  },
}
