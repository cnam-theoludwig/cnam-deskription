import assert from "node:assert/strict"
import { describe, it } from "node:test"
import { capitalize } from "../strings.ts"

describe("strings", () => {
  describe("capitalize", () => {
    it("should capitalize the first letter of a string", () => {
      // Arrange - Given
      const input = "hello, world!"

      // Act - When
      const output = capitalize(input)

      // Assert - Then
      const expected = "Hello, world!"
      assert.strictEqual(output, expected)
    })

    it("should return an empty string when the input is an empty string", () => {
      // Arrange - Given
      const input = ""

      // Act - When
      const output = capitalize(input)

      // Assert - Then
      const expected = ""
      assert.strictEqual(output, expected)
    })

    it("should return the same string when the first letter is already capitalized", () => {
      // Arrange - Given
      const input = "Hello, world!"

      // Act - When
      const output = capitalize(input)

      // Assert - Then
      const expected = "Hello, world!"
      assert.strictEqual(output, expected)
    })
  })
})
