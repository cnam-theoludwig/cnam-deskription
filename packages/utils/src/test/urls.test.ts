import assert from "node:assert/strict"
import { describe, it } from "node:test"
import { getLastPartFromURL } from "../urls"

describe("urls", () => {
  describe("getLastPartFromURL", () => {
    it("should return the last part from the URL", () => {
      // Arrange - Given
      const input = "http://localhost:5500/files/1234567890"

      // Act - When
      const output = getLastPartFromURL(input)

      // Assert - Then
      const expected = "1234567890"
      assert.strictEqual(output, expected)
    })

    it('should return the url itself when it does not contain any "/"', () => {
      // Arrange - Given
      const input = "http://localhost:5500"

      // Act - When
      const output = getLastPartFromURL(input)

      // Assert - Then
      const expected = "http://localhost:5500"
      assert.strictEqual(output, expected)
    })

    it("should return the url itself when it finishes by a slash", () => {
      // Arrange - Given
      const input = "http://localhost:5500/"

      // Act - When
      const output = getLastPartFromURL(input)

      // Assert - Then
      const expected = "http://localhost:5500/"
      assert.strictEqual(output, expected)
    })

    it("should return the last part from the URL when it finishes by a slash", () => {
      // Arrange - Given
      const input = "http://localhost:5500/files/1234567890/"

      // Act - When
      const output = getLastPartFromURL(input)

      // Assert - Then
      const expected = "1234567890"
      assert.strictEqual(output, expected)
    })
  })
})
