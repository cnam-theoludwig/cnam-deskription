import { database } from "../database"
import { datagenEntity } from "./_utils"

export const datagenState = async (): Promise<void> => {
  await datagenEntity({
    entity: "State",
    handler: async () => {
      await database
        .insertInto("State")
        .values([
          {
            name: "À vendre",
          },
          {
            name: "Vendu",
          },
          {
            name: "En possession",
          },
          {
            name: "À jeter",
          },
        ])
        .executeTakeFirstOrThrow()
    },
  })
}
