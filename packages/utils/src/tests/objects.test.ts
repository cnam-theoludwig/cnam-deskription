import assert from "node:assert/strict"
import { describe, it } from "node:test"
import { deepMerge } from "../objects.ts"

describe("objects", () => {
  describe("deepMerge", () => {
    it("should merge two simple objects", () => {
      // Arrange - Given
      const object1 = { a: 1, b: 2 }
      const object2 = { b: 3, c: 4 }

      // Act - When
      const output = deepMerge(object1, object2)

      // Assert - Then
      const expected = { a: 1, b: 3, c: 4 }
      assert.deepStrictEqual(output, expected)
    })

    it("should deeply merge nested objects", () => {
      // Arrange - Given
      const object1 = { a: 1, b: { x: 2, y: 3 } }
      const object2 = { b: { y: 4, z: 5 }, c: 6 }

      // Act - When
      const output = deepMerge(object1, object2)

      // Assert - Then
      const expected = { a: 1, b: { x: 2, y: 4, z: 5 }, c: 6 }
      assert.deepStrictEqual(output, expected)
    })

    it("should overwrite primitive values", () => {
      // Arrange - Given
      const object1 = { a: 1, b: "hello" }
      const object2 = { a: 2, b: "world" }

      // Act - When
      const output = deepMerge(object1, object2)

      // Assert - Then
      const expected = { a: 2, b: "world" }
      assert.deepStrictEqual(output, expected)
    })

    it("should return the second object if the first is empty", () => {
      // Arrange - Given
      const object1 = {}
      const object2 = { a: 1, b: 2 }

      // Act - When
      const output = deepMerge(object1, object2)

      // Assert - Then
      const expected = { a: 1, b: 2 }
      assert.deepStrictEqual(output, expected)
    })

    it("should return the first object if the second is empty", () => {
      // Arrange - Given
      const object1 = { a: 1, b: 2 }
      const object2 = {}

      // Act - When
      const output = deepMerge(object1, object2)

      // Assert - Then
      const expected = { a: 1, b: 2 }
      assert.deepStrictEqual(output, expected)
    })

    it("should handle null and undefined values correctly", () => {
      // Arrange - Given
      const object1 = { a: 1, b: null }
      const object2 = { b: { c: 2 }, d: undefined }

      // Act - When
      const output = deepMerge(object1, object2)

      // Assert - Then
      const expected = { a: 1, b: { c: 2 }, d: undefined }
      assert.deepStrictEqual(output, expected)
    })
  })
})
