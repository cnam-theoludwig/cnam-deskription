import type { Primitive } from "./types"

/**
 * Calculate the ratio of a value to a total.
 *
 * Manage edge cases where the total is 0 or negative.
 * @param value
 * @param total
 * @returns
 * @example calculateRatio(3, 10) // 0.3
 */
export const calculateRatio = (value: number, total: number): number => {
  if (total <= 0) {
    return 0
  }
  return value / total
}

/**
 * Calculate the sum of an array of numbers.
 * @param numbers
 * @returns
 * @example calculateSum([1, 2, 3]) // 6
 */
export const calculateSum = (numbers: number[]): number => {
  return numbers.reduce((total, current) => {
    return total + current
  }, 0)
}

/**
 * Calculate the average of an array of numbers.
 * @param numbers
 * @returns
 * @example calculateAverage([1, 2, 3]) // 2
 */
export const calculateAverage = (numbers: number[]): number => {
  if (numbers.length <= 0) {
    return 0
  }
  return calculateSum(numbers) / numbers.length
}

export const sortCompare = <T extends Primitive>(a: T, b: T): number => {
  if (a === b || a == null || b == null) {
    return 0
  }
  return a > b ? 1 : -1
}
