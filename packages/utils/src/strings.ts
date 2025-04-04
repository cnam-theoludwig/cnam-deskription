/**
 * Capitalize the first letter of a string.
 * @param string
 * @returns
 * @example capitalize("hello, world!") // "Hello, world!"
 */
export const capitalize = (string: string): string => {
  return string.charAt(0).toUpperCase() + string.slice(1)
}
