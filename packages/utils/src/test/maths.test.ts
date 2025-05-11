import assert from "node:assert/strict"
import { describe, it } from "node:test"
import {
  calculateAverage,
  calculateRatio,
  calculateSum,
  sortCompare,
} from "../maths"

describe("maths", () => {
  describe("calculateRatio", () => {
    it("should calculate the ratio of a value to a total", () => {
      // Arrange - Given
      const value = 3
      const total = 10

      // Act - When
      const output = calculateRatio(value, total)

      // Assert - Then
      const expected = 0.3
      assert.strictEqual(output, expected)
    })

    it("should return 0 if the total is 0", () => {
      // Arrange - Given
      const value = 3
      const total = 0

      // Act - When
      const output = calculateRatio(value, total)

      // Assert - Then
      const expected = 0
      assert.strictEqual(output, expected)
    })

    it("should return 0 if the total is negative", () => {
      // Arrange - Given
      const value = 3
      const total = -1

      // Act - When
      const output = calculateRatio(value, total)

      // Assert - Then
      const expected = 0
      assert.strictEqual(output, expected)
    })

    it("should return 0 if the value is 0", () => {
      // Arrange - Given
      const value = 0
      const total = 10

      // Act - When
      const output = calculateRatio(value, total)

      // Assert - Then
      const expected = 0
      assert.strictEqual(output, expected)
    })

    it("should return 1 if the value is equal to the total", () => {
      // Arrange - Given
      const value = 10
      const total = 10

      // Act - When
      const output = calculateRatio(value, total)

      // Assert - Then
      const expected = 1
      assert.strictEqual(output, expected)
    })

    it("should return 1 and more if the value is greater than the total", () => {
      // Arrange - Given
      const value = 11
      const total = 10

      // Act - When
      const output = calculateRatio(value, total)

      // Assert - Then
      const expected = 1.1
      assert.strictEqual(output, expected)
    })
  })

  describe("calculateSum", () => {
    it("should calculate the sum of an array of numbers", () => {
      // Arrange - Given
      const numbers = [1, 2, 3]

      // Act - When
      const output = calculateSum(numbers)

      // Assert - Then
      const expected = 6
      assert.strictEqual(output, expected)
    })

    it("should return 0 if the array is empty", () => {
      // Arrange - Given
      const numbers: number[] = []

      // Act - When
      const output = calculateSum(numbers)

      // Assert - Then
      const expected = 0
      assert.strictEqual(output, expected)
    })
  })

  describe("calculateAverage", () => {
    it("should calculate the average of an array of numbers", () => {
      // Arrange - Given
      const numbers = [1, 2, 3]

      // Act - When
      const output = calculateAverage(numbers)

      // Assert - Then
      const expected = 2
      assert.strictEqual(output, expected)
    })

    it("should return 0 if the array is empty", () => {
      // Arrange - Given
      const numbers: number[] = []

      // Act - When
      const output = calculateAverage(numbers)

      // Assert - Then
      const expected = 0
      assert.strictEqual(output, expected)
    })
  })

  describe("sortCompare", () => {
    it("should return 0 if both values are equal", () => {
      // Arrange - Given
      const a = 1
      const b = 1

      // Act - When
      const output = sortCompare(a, b)

      // Assert - Then
      const expected = 0
      assert.strictEqual(output, expected)
    })

    it("should return 1 if the first value is greater than the second", () => {
      // Arrange - Given
      const a = 2
      const b = 1

      // Act - When
      const output = sortCompare(a, b)

      // Assert - Then
      const expected = 1
      assert.strictEqual(output, expected)
    })

    it("should return -1 if the first value is less than the second", () => {
      // Arrange - Given
      const a = 1
      const b = 2

      // Act - When
      const output = sortCompare(a, b)

      // Assert - Then
      const expected = -1
      assert.strictEqual(output, expected)
    })

    it("should return 0 if both values are null", () => {
      // Arrange - Given
      const a: number | null = null
      const b: number | null = null

      // Act - When
      const output = sortCompare(a, b)

      // Assert - Then
      const expected = 0
      assert.strictEqual(output, expected)
    })

    it("should return 0 if one value is null and the other is undefined", () => {
      // Arrange - Given
      const a: number | null = null
      const b: number | undefined = undefined

      // Act - When
      const output = sortCompare(a, b)

      // Assert - Then
      const expected = 0
      assert.strictEqual(output, expected)
    })
  })
})
