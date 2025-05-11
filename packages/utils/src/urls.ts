/**
 * Get the last part from the URL.
 * @param url
 * @example getLastPartFromURL("http://localhost:5500/files/1234567890") // "1234567890"
 */
export const getLastPartFromURL = (url: string): string => {
  const urlParts = url
    .replace("http://", "")
    .replace("https://", "")
    .split("/")
    .filter((part) => {
      return part !== ""
    })
  const lastPart = urlParts.length > 1 ? urlParts.at(-1) : null
  if (lastPart == null) {
    return url
  }
  return lastPart
}
