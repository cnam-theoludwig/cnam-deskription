import assert from "node:assert/strict"
import { describe, it } from "node:test"
import {
  calculateDate,
  calculateMillisecondsFromDuration,
  fromFrenchDateToISO,
  getISODate,
  timeConverter,
} from "../dates"

describe("dates", () => {
  describe("getISODate", () => {
    it("should return the correct date in ISO format (e.g: 2012-05-23)", () => {
      // Arrange - Given
      const input = new Date("2012-05-23")

      // Act - When
      const output = getISODate(input)

      // Assert - Then
      const expected = "2012-05-23"
      assert.strictEqual(output, expected)
    })
  })

  describe("timeConverter.milisecondsToSeconds", () => {
    it("should convert miliseconds to seconds", () => {
      // Arrange - Given
      const input = 1_000

      // Act - When
      const output = timeConverter.milisecondsToSeconds(input)

      // Assert - Then
      const expected = 1
      assert.strictEqual(output, expected)
    })

    it("should round the result", () => {
      // Arrange - Given
      const input = 1_500

      // Act - When
      const output = timeConverter.milisecondsToSeconds(input)

      // Assert - Then
      const expected = 2
      assert.strictEqual(output, expected)
    })
  })

  describe("timeConverter.secondsToMiliseconds", () => {
    it("should convert 1 second to miliseconds", () => {
      // Arrange - Given
      const input = 1

      // Act - When
      const output = timeConverter.secondsToMiliseconds(input)

      // Assert - Then
      const expected = 1_000
      assert.strictEqual(output, expected)
    })

    it("should convert 2 seconds to miliseconds", () => {
      // Arrange - Given
      const input = 2

      // Act - When
      const output = timeConverter.secondsToMiliseconds(input)

      // Assert - Then
      const expected = 2_000
      assert.strictEqual(output, expected)
    })
  })

  describe("fromFrenchDateToISO", () => {
    it("should return the correct date in ISO format (e.g: 2012-05-23)", () => {
      // Arrange - Given
      const input = "14/09/2015"

      // Act - When
      const output = fromFrenchDateToISO(input)

      // Assert - Then
      const expected = "2015-09-14"
      assert.strictEqual(output, expected)
    })
  })

  describe("calculateMillisecondsFromDuration", () => {
    it("should calculate the milliseconds from 1 hour", () => {
      // Arrange - Given
      const input = { amount: 1, unit: "hour" } as const

      // Act - When
      const output = calculateMillisecondsFromDuration({ duration: input })

      // Assert - Then
      const expected = 3_600_000 // 1 hour in milliseconds
      assert.strictEqual(output, expected)
    })

    it("should calculate the milliseconds from 1 week", () => {
      // Arrange - Given
      const input = { amount: 1, unit: "week" } as const

      // Act - When
      const output = calculateMillisecondsFromDuration({ duration: input })

      // Assert - Then
      const expected = 604_800_000 // 7 days in milliseconds
      assert.strictEqual(output, expected)
    })

    it("should calculate the milliseconds from 1 month", () => {
      // Arrange - Given
      const input = { amount: 1, unit: "month" } as const

      // Act - When
      const output = calculateMillisecondsFromDuration({ duration: input })

      // Assert - Then
      const expected = 2_592_000_000 // 30 days in milliseconds
      assert.strictEqual(output, expected)
    })

    it("should calculate the milliseconds from 1 year", () => {
      // Arrange - Given
      const input = { amount: 1, unit: "year" } as const

      // Act - When
      const output = calculateMillisecondsFromDuration({ duration: input })

      // Assert - Then
      const expected = 31_557_600_000 // 365.25 days in milliseconds
      assert.strictEqual(output, expected)
    })

    it("should calculate the milliseconds from 1 second", () => {
      // Arrange - Given
      const input = { amount: 1, unit: "second" } as const

      // Act - When
      const output = calculateMillisecondsFromDuration({ duration: input })

      // Assert - Then
      const expected = 1_000
      assert.strictEqual(output, expected)
    })

    it("should calculate the milliseconds from 2 minutes", () => {
      // Arrange - Given
      const input = { amount: 2, unit: "minute" } as const

      // Act - When
      const output = calculateMillisecondsFromDuration({ duration: input })

      // Assert - Then
      const expected = 120_000
      assert.strictEqual(output, expected)
    })

    it("should calculate the milliseconds from 1 day", () => {
      // Arrange - Given
      const input = { amount: 1, unit: "day" } as const

      // Act - When
      const output = calculateMillisecondsFromDuration({ duration: input })

      // Assert - Then
      const expected = 86_400_000
      assert.strictEqual(output, expected)
    })
  })

  describe("calculateDate", () => {
    it("should calculate the date 1 second in the past", () => {
      // Arrange - Given
      const date = new Date("2024-10-15T12:00:00Z")
      const duration = { amount: -1, unit: "second" } as const

      // Act - When
      calculateDate({ duration, date })

      // Assert - Then
      const expectedDate = new Date("2024-10-15T11:59:59Z")
      assert.deepStrictEqual(date, expectedDate)
    })

    it("should calculate the date 1 minute in the past", () => {
      // Arrange - Given
      const date = new Date("2024-10-15T12:00:00Z")
      const duration = { amount: -1, unit: "minute" } as const

      // Act - When
      calculateDate({ duration, date })

      // Assert - Then
      const expectedDate = new Date("2024-10-15T11:59:00Z")
      assert.deepStrictEqual(date, expectedDate)
    })

    it("should calculate the date 1 hour in the past", () => {
      // Arrange - Given
      const date = new Date("2024-10-15T12:00:00Z")
      const duration = { amount: -1, unit: "hour" } as const

      // Act - When
      calculateDate({ duration, date })

      // Assert - Then
      const expectedDate = new Date("2024-10-15T11:00:00Z")
      assert.deepStrictEqual(date, expectedDate)
    })

    it("should calculate the date 1 day in the past", () => {
      // Arrange - Given
      const date = new Date("2024-10-15T12:00:00Z")
      const duration = { amount: -1, unit: "day" } as const

      // Act - When
      calculateDate({ duration, date })

      // Assert - Then
      const expectedDate = new Date("2024-10-14T12:00:00Z")
      assert.deepStrictEqual(date, expectedDate)
    })

    it("should calculate the date 2 weeks in the past", () => {
      // Arrange - Given
      const date = new Date("2024-10-15T12:00:00Z")
      const duration = { amount: -2, unit: "week" } as const

      // Act - When
      calculateDate({ duration, date })

      // Assert - Then
      const expectedDate = new Date("2024-10-01T12:00:00Z")
      assert.deepStrictEqual(date, expectedDate)
    })

    it("should calculate the date 3 months in the past", () => {
      // Arrange - Given
      const date = new Date("2024-10-15T12:00:00Z")
      const duration = { amount: -3, unit: "month" } as const

      // Act - When
      calculateDate({ duration, date })

      // Assert - Then
      const expectedDate = new Date("2024-07-15T12:00:00Z")
      assert.deepStrictEqual(date, expectedDate)
    })

    it("should calculate the date 1 year in the past", () => {
      // Arrange - Given
      const date = new Date("2024-10-15T12:00:00Z")
      const duration = { amount: -1, unit: "year" } as const

      // Act - When
      calculateDate({ duration, date })

      // Assert - Then
      const expectedDate = new Date("2023-10-15T12:00:00Z")
      assert.deepStrictEqual(date, expectedDate)
    })

    it("should handle zero amount without changing the date", () => {
      // Arrange - Given
      const date = new Date("2024-10-15T12:00:00Z")
      const duration = { amount: 0, unit: "day" } as const

      // Act - When
      calculateDate({ duration, date })

      // Assert - Then
      const expectedDate = new Date("2024-10-15T12:00:00Z")
      assert.deepStrictEqual(date, expectedDate)
    })

    // Future Date Tests
    it("should calculate the date 1 day in the future", () => {
      // Arrange - Given
      const date = new Date("2024-10-15T12:00:00Z")
      const duration = { amount: 1, unit: "day" } as const

      // Act - When
      calculateDate({ duration, date })

      // Assert - Then
      const expectedDate = new Date("2024-10-16T12:00:00Z")
      assert.deepStrictEqual(date, expectedDate)
    })

    it("should calculate the date 2 weeks in the future", () => {
      // Arrange - Given
      const date = new Date("2024-08-15T12:00:00Z")
      const duration = { amount: 2, unit: "week" } as const

      // Act - When
      calculateDate({ duration, date })

      // Assert - Then
      const expectedDate = new Date("2024-08-29T12:00:00Z")
      assert.deepStrictEqual(date, expectedDate)
    })

    it("should calculate the date 3 months in the future", () => {
      // Arrange - Given
      const date = new Date("2024-07-15T12:00:00Z")
      const duration = { amount: 3, unit: "month" } as const

      // Act - When
      calculateDate({ duration, date })

      // Assert - Then
      const expectedDate = new Date("2024-10-15T12:00:00Z")
      assert.deepStrictEqual(date, expectedDate)
    })

    it("should calculate the date 1 year in the future", () => {
      // Arrange - Given
      const date = new Date("2024-10-15T12:00:00Z")
      const duration = { amount: 1, unit: "year" } as const

      // Act - When
      calculateDate({ duration, date })

      // Assert - Then
      const expectedDate = new Date("2025-10-15T12:00:00Z")
      assert.deepStrictEqual(date, expectedDate)
    })
  })
})
