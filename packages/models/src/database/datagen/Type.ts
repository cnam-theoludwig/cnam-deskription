import { database } from "../database"
import { datagenEntity } from "./_utils"

export const datagenType = async (): Promise<void> => {
  await datagenEntity({
    entity: "Type",
    handler: async () => {
      await database
        .insertInto("Type")
        .values([
          {
            name: "Chaise",
          },
          {
            name: "Table",
          },
          {
            name: "Bureau",
          },
          {
            name: "Commode",
          },
          {
            name: "Armoire",
          },
          {
            name: "Divers",
          },
        ])
        .executeTakeFirstOrThrow()
    },
  })
}
