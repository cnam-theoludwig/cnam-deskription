import prettyMilliseconds from "pretty-ms"

export interface DatagenEntityInput {
  handler: () => Promise<void>
  entity: string
}

export const datagenEntity = async (
  input: DatagenEntityInput,
): Promise<void> => {
  const { handler, entity } = input

  const beforeTimeMs = performance.now()
  console.log(`Data generation of \`${entity}\`...`)

  try {
    await handler()
    const afterTimeMs = performance.now()
    const elapsedTimeMs = afterTimeMs - beforeTimeMs
    console.log(
      `Data generation of \`${entity}\` done in ${prettyMilliseconds(elapsedTimeMs)}`,
    )
    console.log()
  } catch (error) {
    console.error(`Error while generating data for \`${entity}\`:`, error)
    console.error()
  }
}
