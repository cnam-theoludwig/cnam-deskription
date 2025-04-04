export const firstTruePromise = async (
  promises: Array<Promise<boolean>>,
): Promise<boolean> => {
  for (const promise of promises) {
    const result = await promise
    if (result) {
      return true
    }
  }
  return false
}
