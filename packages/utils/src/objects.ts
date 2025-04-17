export const deepMerge = <
  Object1 extends object,
  Object2 extends object = Object1,
>(
  object1: Object1,
  object2: Object2,
): Object1 & Object2 => {
  const result = { ...object1 } as Object1 & Object2
  for (const key in object2) {
    if (Object.hasOwn(object2, key)) {
      if (typeof object2[key] === "object" && object2[key] !== null) {
        result[key] = deepMerge(result[key] as any, object2[key] as any)
      } else {
        result[key] = object2[key] as any
      }
    }
  }
  return result
}
