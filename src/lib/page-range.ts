/**
 * Parses a 1-indexed page range string like "1-3,5,8-9" into a sorted,
 * deduplicated array of 0-indexed page numbers, validated against
 * `totalPages`. Shared by every PDF tool that lets a user pick specific
 * pages (extractor, deleter, rotator).
 */
export function parsePageRange(input: string, totalPages: number): number[] {
  const trimmed = input.trim()
  if (!trimmed) throw new Error("Enter at least one page number.")

  const indices = new Set<number>()
  for (const part of trimmed.split(",")) {
    const segment = part.trim()
    if (!segment) continue

    const rangeMatch = segment.match(/^(\d+)\s*-\s*(\d+)$/)
    if (rangeMatch) {
      const start = Number(rangeMatch[1])
      const end = Number(rangeMatch[2])
      if (start < 1 || end > totalPages || start > end) {
        throw new Error(`"${segment}" is not a valid range for a ${totalPages}-page PDF.`)
      }
      for (let page = start; page <= end; page++) indices.add(page - 1)
      continue
    }

    const single = Number(segment)
    if (!Number.isInteger(single) || single < 1 || single > totalPages) {
      throw new Error(
        `"${segment}" is not a valid page number for a ${totalPages}-page PDF.`,
      )
    }
    indices.add(single - 1)
  }

  if (indices.size === 0) throw new Error("Enter at least one page number.")
  return Array.from(indices).sort((a, b) => a - b)
}
