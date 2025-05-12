import { database } from "../database"
import { datagenEntity } from "./_utils"

export const BUILDINGS = [
  {
    id: crypto.randomUUID(),
    name: "CNAM",
    storeys: [
      {
        id: crypto.randomUUID(),
        name: "Rez-de-chaussée",
        rooms: [
          { id: crypto.randomUUID(), name: "Salle de cours 001" },
          { id: crypto.randomUUID(), name: "Salle de cours 002" },
        ],
      },
      {
        id: crypto.randomUUID(),
        name: "1er étage",
        rooms: [{ id: crypto.randomUUID(), name: "Salle de cours 110" }],
      },
      {
        id: crypto.randomUUID(),
        name: "2ème étage",
        rooms: [
          {
            id: crypto.randomUUID(),
            name: "Edouard Room (n'y entrez jamais)",
          },
        ],
      },
    ],
  },
  {
    id: crypto.randomUUID(),
    name: "Lidl",
    storeys: [
      {
        id: crypto.randomUUID(),
        name: "Rez-de-chaussée",
        rooms: [
          {
            id: crypto.randomUUID(),
            name: "Accueil",
          },
        ],
      },
      {
        id: crypto.randomUUID(),
        name: "Sous sol (sombre et humide)",
        rooms: [
          {
            id: crypto.randomUUID(),
            name: "Réserve",
          },
        ],
      },
    ],
  },
  {
    id: crypto.randomUUID(),
    name: "Burger King",
    storeys: [
      {
        id: crypto.randomUUID(),
        name: "Étage 0",
        rooms: [
          {
            id: crypto.randomUUID(),
            name: "Salle de restauration",
          },
          {
            id: crypto.randomUUID(),
            name: "Toilettes",
          },
        ],
      },
      {
        id: crypto.randomUUID(),
        name: "Étage 1",
        rooms: [
          {
            id: crypto.randomUUID(),
            name: "Salle de jeux",
          },
        ],
      },
      {
        id: crypto.randomUUID(),
        name: "Étage 2",
        rooms: [
          {
            id: crypto.randomUUID(),
            name: "Manager's Office",
          },
        ],
      },
    ],
  },
]

export const datagenBuilding = async (): Promise<void> => {
  await datagenEntity({
    entity: "Building, Storey and Room",
    handler: async () => {
      await database.transaction().execute(async (database) => {
        await Promise.all(
          BUILDINGS.map(async (building) => {
            await database
              .insertInto("Building")
              .values({
                id: building.id,
                name: building.name,
              })
              .executeTakeFirstOrThrow()

            const storeysToInsert = building.storeys.map((storey) => {
              return {
                id: storey.id,
                name: storey.name,
                buildingId: building.id,
              }
            })

            if (storeysToInsert.length > 0) {
              await database
                .insertInto("Storey")
                .values(storeysToInsert)
                .execute()
            }

            const roomsToInsert = building.storeys.flatMap((storey) => {
              return storey.rooms.map((room) => {
                return {
                  id: room.id,
                  name: room.name,
                  storeyId: storey.id,
                }
              })
            })

            if (roomsToInsert.length > 0) {
              await database.insertInto("Room").values(roomsToInsert).execute()
            }
          }),
        )
      })
    },
  })
}
