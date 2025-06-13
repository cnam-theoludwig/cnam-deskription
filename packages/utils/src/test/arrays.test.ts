import assert from "node:assert/strict"
import { describe, it } from "node:test"
import { removeDuplicates } from "../arrays"

describe("arrays", () => {
  describe("removeDuplicates", () => {
    it("should remove duplicates from an array", () => {
      // Arrange - Given
      const input = [
        { id: 1, name: "John" },
        { id: 2, name: "Jane" },
        { id: 1, name: "John" },
        { id: 3, name: "Doe" },
      ]

      // Act - When
      const output = removeDuplicates({
        key: "id",
        values: input,
      })

      // Assert - Then
      const expected = [
        { id: 1, name: "John" },
        { id: 2, name: "Jane" },
        { id: 3, name: "Doe" },
      ]
      assert.deepStrictEqual(output, expected)
    })
  })
})
