/** Shared canvas-based image loading/conversion helpers used across the Image Tools category. */

export function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve(img)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error("Could not read this file as an image."))
    }
    img.src = url
  })
}

export function drawToCanvas(
  img: HTMLImageElement,
  width: number,
  height: number,
): HTMLCanvasElement {
  const canvas = document.createElement("canvas")
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext("2d")
  if (!ctx) throw new Error("Canvas 2D context is not available.")
  ctx.drawImage(img, 0, 0, width, height)
  return canvas
}

export function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality?: number,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) =>
        blob ? resolve(blob) : reject(new Error("Could not encode this image.")),
      type,
      quality,
    )
  })
}

/**
 * Re-encodes an image file to a different format/quality via canvas.
 * As a side effect this also strips EXIF metadata, since canvas re-encoding
 * never preserves it - useful for both format conversion and EXIF removal.
 */
export async function convertImageFile(
  file: File,
  mimeType: string,
  quality?: number,
): Promise<Blob> {
  const img = await loadImageFromFile(file)
  const canvas = drawToCanvas(img, img.naturalWidth, img.naturalHeight)
  return canvasToBlob(canvas, mimeType, quality)
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}
