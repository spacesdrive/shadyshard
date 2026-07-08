/** Triggers a browser download of `blob` named `filename` with no server round-trip. */
export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

export function downloadText(text: string, filename: string, mimeType = "text/plain") {
  downloadBlob(new Blob([text], { type: mimeType }), filename)
}
