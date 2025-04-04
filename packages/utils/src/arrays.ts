interface RemoveDuplicatesInput<Value, Key extends keyof Value> {
  /**
   * The key to use to check uniqueness of values.
   *
   * If 2 values have the same key, the first value will be kept and the second value will be removed.
   */
  key: Key

  /**
   * The values to remove duplicates from.
   */
  values: Value[]
}

export const removeDuplicates = <Value, Key extends keyof Value>({
  key: column,
  values,
}: RemoveDuplicatesInput<Value, Key>): Value[] => {
  const seen = new Set<Value[Key]>()
  return values.filter((item) => {
    if (seen.has(item[column])) {
      return false
    }
    seen.add(item[column])
    return true
  })
}
