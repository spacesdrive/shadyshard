import { PDFDocument, StandardFonts, degrees, rgb, type PDFPage } from "pdf-lib"

/**
 * Shared pdf-lib helpers for the PDF Tools category. All page indices in
 * this module are 0-indexed, matching pdf-lib's own convention -- tool
 * components are responsible for converting to/from the 1-indexed page
 * numbers shown to users.
 */

export class EncryptedPdfError extends Error {
  constructor() {
    super("This PDF is password-protected and cannot be read.")
  }
}

/**
 * Loads a PDF, throwing EncryptedPdfError for password-protected files
 * instead of the generic pdf-lib error. pdf-lib cannot decrypt a PDF with
 * a user-supplied password at all -- it can only load unencrypted files or
 * ignore encryption metadata (which produces unusable output for a
 * genuinely encrypted file) -- so this is a detection, not a bypass.
 */
export async function loadPdf(file: File): Promise<PDFDocument> {
  const bytes = await file.arrayBuffer()
  try {
    return await PDFDocument.load(bytes)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    if (/encrypt/i.test(message)) throw new EncryptedPdfError()
    throw new Error("Could not read this file as a PDF.")
  }
}

export function pdfBytesToBlob(bytes: Uint8Array): Blob {
  return new Blob([bytes as BlobPart], { type: "application/pdf" })
}

export async function mergePdfs(files: File[]): Promise<Uint8Array> {
  const merged = await PDFDocument.create()
  for (const file of files) {
    const source = await loadPdf(file)
    const pages = await merged.copyPages(source, source.getPageIndices())
    pages.forEach((page: PDFPage) => merged.addPage(page))
  }
  return merged.save()
}

export async function extractPages(
  file: File,
  pageIndices: number[],
): Promise<Uint8Array> {
  const source = await loadPdf(file)
  const output = await PDFDocument.create()
  const pages = await output.copyPages(source, pageIndices)
  pages.forEach((page: PDFPage) => output.addPage(page))
  return output.save()
}

export async function deletePages(
  file: File,
  pageIndicesToRemove: number[],
): Promise<Uint8Array> {
  const source = await loadPdf(file)
  const keep = new Set(pageIndicesToRemove)
  const keptIndices = source.getPageIndices().filter((i) => !keep.has(i))
  const output = await PDFDocument.create()
  const pages = await output.copyPages(source, keptIndices)
  pages.forEach((page: PDFPage) => output.addPage(page))
  return output.save()
}

export async function reorderPages(file: File, newOrder: number[]): Promise<Uint8Array> {
  const source = await loadPdf(file)
  const output = await PDFDocument.create()
  const pages = await output.copyPages(source, newOrder)
  pages.forEach((page: PDFPage) => output.addPage(page))
  return output.save()
}

export async function rotatePages(
  file: File,
  pageIndices: number[] | "all",
  degreesDelta: number,
): Promise<Uint8Array> {
  const doc = await loadPdf(file)
  const targets =
    pageIndices === "all"
      ? doc.getPageIndices()
      : pageIndices.filter((i) => i >= 0 && i < doc.getPageCount())
  for (const index of targets) {
    const page = doc.getPage(index)
    const current = page.getRotation().angle
    page.setRotation(degrees((current + degreesDelta) % 360))
  }
  return doc.save()
}

/**
 * Splits a PDF into chunks of `pagesPerFile` pages each, returning one
 * output PDF per chunk in original page order.
 */
export async function splitPdfEvery(
  file: File,
  pagesPerFile: number,
): Promise<{ bytes: Uint8Array; startPage: number; endPage: number }[]> {
  const source = await loadPdf(file)
  const total = source.getPageCount()
  const chunks: { bytes: Uint8Array; startPage: number; endPage: number }[] = []
  for (let start = 0; start < total; start += pagesPerFile) {
    const end = Math.min(start + pagesPerFile, total)
    const indices = Array.from({ length: end - start }, (_, i) => start + i)
    const output = await PDFDocument.create()
    const pages = await output.copyPages(source, indices)
    pages.forEach((page: PDFPage) => output.addPage(page))
    chunks.push({ bytes: await output.save(), startPage: start + 1, endPage: end })
  }
  return chunks
}

export interface PdfMetadata {
  title: string
  author: string
  subject: string
  keywords: string
  creator: string
  producer: string
  creationDate: string
  modificationDate: string
  pageCount: number
}

export async function readPdfMetadata(file: File): Promise<PdfMetadata> {
  const doc = await loadPdf(file)
  return {
    title: doc.getTitle() ?? "",
    author: doc.getAuthor() ?? "",
    subject: doc.getSubject() ?? "",
    keywords: doc.getKeywords() ?? "",
    creator: doc.getCreator() ?? "",
    producer: doc.getProducer() ?? "",
    creationDate: doc.getCreationDate()?.toISOString() ?? "",
    modificationDate: doc.getModificationDate()?.toISOString() ?? "",
    pageCount: doc.getPageCount(),
  }
}

export async function stripPdfMetadata(file: File): Promise<Uint8Array> {
  const doc = await loadPdf(file)
  doc.setTitle("")
  doc.setAuthor("")
  doc.setSubject("")
  doc.setKeywords([])
  doc.setCreator("")
  doc.setProducer("")
  return doc.save()
}

export async function countPdfPages(file: File): Promise<number> {
  const doc = await loadPdf(file)
  return doc.getPageCount()
}

/**
 * Re-saves a PDF with pdf-lib's object-stream compaction, which dedupes
 * repeated objects and compresses the cross-reference table. This reduces
 * file size for PDFs with redundant structure, but does not re-encode or
 * downsample embedded images -- true image recompression would require
 * decoding, re-encoding, and re-embedding every image stream in the file,
 * which pdf-lib does not support. Documented as a real limitation rather
 * than a broken feature.
 */
export async function compressPdf(file: File): Promise<Uint8Array> {
  const doc = await loadPdf(file)
  return doc.save({ useObjectStreams: true })
}

/**
 * Embeds one image per page, sized to the image's own aspect ratio scaled
 * to fit an A4-sized page with a small margin, in the order the files are
 * given.
 */
export async function imagesToPdf(files: File[]): Promise<Uint8Array> {
  const doc = await PDFDocument.create()
  const A4_WIDTH = 595.28
  const A4_HEIGHT = 841.89
  const MARGIN = 24

  for (const file of files) {
    const bytes = new Uint8Array(await file.arrayBuffer())
    const isPng = file.type === "image/png"
    const image = isPng ? await doc.embedPng(bytes) : await doc.embedJpg(bytes)
    const maxWidth = A4_WIDTH - MARGIN * 2
    const maxHeight = A4_HEIGHT - MARGIN * 2
    const scale = Math.min(maxWidth / image.width, maxHeight / image.height, 1)
    const width = image.width * scale
    const height = image.height * scale
    const page = doc.addPage([A4_WIDTH, A4_HEIGHT])
    page.drawImage(image, {
      x: (A4_WIDTH - width) / 2,
      y: (A4_HEIGHT - height) / 2,
      width,
      height,
    })
  }

  return doc.save()
}

export type PagePosition =
  | "top-left"
  | "top-center"
  | "top-right"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right"

export interface WatermarkOptions {
  text: string
  fontSize: number
  opacity: number
  /** Counter-clockwise rotation in degrees, applied around the text anchor. */
  rotation: number
  /** Watermark color as an "#rrggbb" string. */
  color: string
}

function hexToRgbComponents(hex: string): [number, number, number] {
  const match = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex.trim())
  if (!match) return [0, 0, 0]
  return [
    parseInt(match[1], 16) / 255,
    parseInt(match[2], 16) / 255,
    parseInt(match[3], 16) / 255,
  ]
}

/**
 * Stamps `text` across the centre of every target page. pdf-lib rotates
 * text about its own start point rather than its centre, so the anchor is
 * offset by half the rotated text box to keep the result visually centred.
 */
export async function addTextWatermark(
  file: File,
  pageIndices: number[] | "all",
  options: WatermarkOptions,
): Promise<Uint8Array> {
  const doc = await loadPdf(file)
  const font = await doc.embedFont(StandardFonts.HelveticaBold)
  const [red, green, blue] = hexToRgbComponents(options.color)
  const targets =
    pageIndices === "all"
      ? doc.getPageIndices()
      : pageIndices.filter((index) => index >= 0 && index < doc.getPageCount())

  const radians = (options.rotation * Math.PI) / 180
  const textWidth = font.widthOfTextAtSize(options.text, options.fontSize)
  const textHeight = font.heightAtSize(options.fontSize)

  for (const index of targets) {
    const page = doc.getPage(index)
    const { width, height } = page.getSize()
    page.drawText(options.text, {
      x:
        width / 2 -
        (textWidth * Math.cos(radians)) / 2 +
        (textHeight * Math.sin(radians)) / 2,
      y:
        height / 2 -
        (textWidth * Math.sin(radians)) / 2 -
        (textHeight * Math.cos(radians)) / 2,
      size: options.fontSize,
      font,
      color: rgb(red, green, blue),
      opacity: options.opacity,
      rotate: degrees(options.rotation),
    })
  }

  return doc.save()
}

export interface PageNumberOptions {
  position: PagePosition
  fontSize: number
  margin: number
  /** Number printed on the first numbered page. */
  startAt: number
  /** Template where {n} is the page number and {total} the numbered page count. */
  format: string
  /** Pages to leave unnumbered at the front of the document. */
  skipFirst: number
}

export async function addPageNumbers(
  file: File,
  options: PageNumberOptions,
): Promise<Uint8Array> {
  const doc = await loadPdf(file)
  const font = await doc.embedFont(StandardFonts.Helvetica)
  const indices = doc.getPageIndices().slice(options.skipFirst)
  const total = indices.length

  indices.forEach((pageIndex, offset) => {
    const page = doc.getPage(pageIndex)
    const { width, height } = page.getSize()
    const label = options.format
      .replaceAll("{n}", String(options.startAt + offset))
      .replaceAll("{total}", String(options.startAt + total - 1))
    const labelWidth = font.widthOfTextAtSize(label, options.fontSize)

    const isTop = options.position.startsWith("top")
    const horizontal = options.position.split("-")[1]
    const x =
      horizontal === "left"
        ? options.margin
        : horizontal === "right"
          ? width - options.margin - labelWidth
          : (width - labelWidth) / 2

    page.drawText(label, {
      x,
      y: isTop ? height - options.margin - options.fontSize : options.margin,
      size: options.fontSize,
      font,
      color: rgb(0, 0, 0),
    })
  })

  return doc.save()
}
