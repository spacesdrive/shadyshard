/**
 * Minimal RFC 4180-style delimited-text parser/serializer, shared by the
 * CSV/TSV converter tools. Hand-rolled rather than adding a dependency
 * (Papa Parse, etc.) since the supported feature set -- quoted fields,
 * escaped quotes, either delimiter -- is small and stable.
 */

export function parseDelimited(text: string, delimiter: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let field = ""
  let inQuotes = false

  for (let i = 0; i < text.length; i++) {
    const char = text[i]

    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"'
          i++
        } else {
          inQuotes = false
        }
      } else {
        field += char
      }
      continue
    }

    if (char === '"') {
      inQuotes = true
    } else if (char === delimiter) {
      row.push(field)
      field = ""
    } else if (char === "\n") {
      row.push(field)
      rows.push(row)
      row = []
      field = ""
    } else if (char === "\r") {
      // skip, \n (or end of input) closes the row
    } else {
      field += char
    }
  }

  if (field !== "" || row.length > 0) {
    row.push(field)
    rows.push(row)
  }

  return rows.filter((r) => !(r.length === 1 && r[0] === ""))
}

function needsQuoting(field: string, delimiter: string): boolean {
  return field.includes(delimiter) || field.includes('"') || /[\n\r]/.test(field)
}

export function toDelimited(rows: string[][], delimiter: string): string {
  return rows
    .map((row) =>
      row
        .map((field) =>
          needsQuoting(field, delimiter) ? `"${field.replace(/"/g, '""')}"` : field,
        )
        .join(delimiter),
    )
    .join("\r\n")
}

/** Parses delimited text with a header row into an array of objects keyed by header. */
export function delimitedToObjects(
  text: string,
  delimiter: string,
): Record<string, string>[] {
  const rows = parseDelimited(text, delimiter)
  if (rows.length === 0) return []
  const [header, ...dataRows] = rows
  return dataRows.map((row) =>
    Object.fromEntries(header.map((key, i) => [key, row[i] ?? ""])),
  )
}

/** Serializes an array of flat objects into delimited text, using the union of all keys as the header. */
export function objectsToDelimited(
  records: Record<string, unknown>[],
  delimiter: string,
): string {
  const header = Array.from(new Set(records.flatMap((r) => Object.keys(r))))
  const rows = [
    header,
    ...records.map((record) =>
      header.map((key) => {
        const value = record[key]
        return value === undefined || value === null ? "" : String(value)
      }),
    ),
  ]
  return toDelimited(rows, delimiter)
}
