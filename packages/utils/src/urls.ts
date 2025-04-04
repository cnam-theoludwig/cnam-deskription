/**
 * Get the last part from the URL.
 * @param url
 * @example getUploadIdFromURL("http://localhost:5500/files/1234567890") // "1234567890"
 */
export const getLastPartFromURL = (url: string): string => {
  const urlParts = url.split("/")
  return urlParts.at(-1) ?? url
}
