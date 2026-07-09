/**
 * Shared pdfjs-dist helpers for rendering PDF pages to canvas/image and
 * extracting text. pdfjs-dist is loaded and configured lazily (module-level
 * memoized promise) so its ~1MB parser/renderer code never ships in the
 * main bundle -- only tools that actually render or read PDF content pull
 * it in, as their own lazy chunk.
 */

type PdfjsLib = typeof import("pdfjs-dist")

let pdfjsPromise: Promise<PdfjsLib> | null = null

async function getPdfjs(): Promise<PdfjsLib> {
  if (!pdfjsPromise) {
    pdfjsPromise = (async () => {
      const [pdfjsLib, workerUrl] = await Promise.all([
        import("pdfjs-dist"),
        import("pdfjs-dist/build/pdf.worker.mjs?url").then((m) => m.default),
      ])
      pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl
      return pdfjsLib
    })()
  }
  return pdfjsPromise
}

export async function loadPdfjsDocument(file: File) {
  const pdfjsLib = await getPdfjs()
  const bytes = await file.arrayBuffer()
  const loadingTask = pdfjsLib.getDocument({ data: bytes })
  return loadingTask.promise
}

/** Renders one page (1-indexed, matching pdf.js convention) to a canvas at the given CSS-pixel scale. */
export async function renderPageToCanvas(
  pdfDoc: Awaited<ReturnType<typeof loadPdfjsDocument>>,
  pageNumber: number,
  scale: number,
): Promise<HTMLCanvasElement> {
  const page = await pdfDoc.getPage(pageNumber)
  const viewport = page.getViewport({ scale })
  const canvas = document.createElement("canvas")
  canvas.width = Math.floor(viewport.width)
  canvas.height = Math.floor(viewport.height)
  const context = canvas.getContext("2d")
  if (!context) throw new Error("Canvas 2D context is not available.")
  await page.render({ canvasContext: context, viewport, canvas }).promise
  return canvas
}

export function canvasToPngBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Could not encode this page."))),
      "image/png",
    )
  })
}

/** Extracts text content page by page, returning one string per page. */
export async function extractPdfText(file: File): Promise<string[]> {
  const pdfDoc = await loadPdfjsDocument(file)
  const pages: string[] = []
  for (let i = 1; i <= pdfDoc.numPages; i++) {
    const page = await pdfDoc.getPage(i)
    const content = await page.getTextContent()
    const text = content.items.map((item) => ("str" in item ? item.str : "")).join(" ")
    pages.push(text)
  }
  return pages
}
