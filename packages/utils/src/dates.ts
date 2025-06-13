/**
 * Returns a date as a string value in ISO 8601 format (without time information).
 *
 * @param date
 * @returns
 * @example getISODate(new Date("2012-05-23")) // "2012-05-23"
 */
export const getISODate = (date: Date): string => {
  return date.toISOString().slice(0, 10)
}

export const timeConverter = {
  milisecondsToSeconds: (miliseconds: number): number => {
    return Math.round(miliseconds / 1_000)
  },
  secondsToMiliseconds: (seconds: number): number => {
    return seconds * 1_000
  },
}

export const fromFrenchDateToISO = (date: string): string => {
  const [day, month, year] = date.split("/")
  return `${year}-${month}-${day}`
}

interface Duration {
  amount: number
  unit: "second" | "minute" | "hour" | "day" | "week" | "month" | "year"
}

interface CalculateMillisecondsFromDurationInput {
  duration: Duration
}

/**
 * Calculates the number of milliseconds from a given duration.
 * @param input
 * @returns
 * @example calculateMillisecondsFromDuration({ duration: { amount: 1, unit: "day" } }) // 86400000
 */
export const calculateMillisecondsFromDuration = (
  input: CalculateMillisecondsFromDurationInput,
): number => {
  const { duration } = input
  switch (duration.unit) {
    case "second":
      return duration.amount * 1_000
    case "minute":
      return duration.amount * 60 * 1_000
    case "hour":
      return duration.amount * 60 * 60 * 1_000
    case "day":
      return duration.amount * 24 * 60 * 60 * 1_000
    case "week":
      return duration.amount * 7 * 24 * 60 * 60 * 1_000
    case "month":
      return duration.amount * 30 * 24 * 60 * 60 * 1_000
    case "year":
      return duration.amount * 365.25 * 24 * 60 * 60 * 1_000
  }
}

interface CalculateDateInput {
  /**
   * The period (e.g., 1 day, 1 month) to adjust from the current date.
   * Use a positive amount for future dates and a negative amount for past dates.
   */
  duration: Duration

  /**
   * The current date.
   *
   * NOTE: This date will be mutated.
   */
  date: Date
}

/**
 * Adjusts a date based on the current date and the provided duration.
 * @param input
 * @returns
 * @example calculateDate({ duration: { amount: -1, unit: "day" }, date: new Date() })
 */
export const calculateDate = (input: CalculateDateInput): Date => {
  const { duration, date } = input
  switch (duration.unit) {
    case "second":
      date.setSeconds(date.getSeconds() + duration.amount)
      break
    case "minute":
      date.setMinutes(date.getMinutes() + duration.amount)
      break
    case "hour":
      date.setHours(date.getHours() + duration.amount)
      break
    case "day":
      date.setDate(date.getDate() + duration.amount)
      break
    case "week":
      date.setDate(date.getDate() + duration.amount * 7)
      break
    case "month":
      date.setMonth(date.getMonth() + duration.amount)
      break
    case "year":
      date.setFullYear(date.getFullYear() + duration.amount)
      break
  }
  return date
}
