/**
 * A small database of well-known file "magic number" signatures -- the
 * fixed byte sequence most binary formats start with -- shared by the MIME
 * Type Inspector and File Signature Inspector tools. Detection is based
 * purely on file content, never the filename/extension, since that's the
 * entire point of both tools: revealing what a file actually is regardless
 * of what it's named.
 */

export interface FileSignature {
  name: string
  mimeType: string
  extension: string
  /** Byte offset the signature starts at. Almost always 0. */
  offset: number
  bytes: number[]
}

export const FILE_SIGNATURES: FileSignature[] = [
  {
    name: "PDF Document",
    mimeType: "application/pdf",
    extension: "pdf",
    offset: 0,
    bytes: [0x25, 0x50, 0x44, 0x46],
  },
  {
    name: "PNG Image",
    mimeType: "image/png",
    extension: "png",
    offset: 0,
    bytes: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a],
  },
  {
    name: "JPEG Image",
    mimeType: "image/jpeg",
    extension: "jpg",
    offset: 0,
    bytes: [0xff, 0xd8, 0xff],
  },
  {
    name: "GIF Image",
    mimeType: "image/gif",
    extension: "gif",
    offset: 0,
    bytes: [0x47, 0x49, 0x46, 0x38],
  },
  {
    name: "WebP Image",
    mimeType: "image/webp",
    extension: "webp",
    offset: 8,
    bytes: [0x57, 0x45, 0x42, 0x50],
  },
  {
    name: "BMP Image",
    mimeType: "image/bmp",
    extension: "bmp",
    offset: 0,
    bytes: [0x42, 0x4d],
  },
  {
    name: "ICO Icon",
    mimeType: "image/x-icon",
    extension: "ico",
    offset: 0,
    bytes: [0x00, 0x00, 0x01, 0x00],
  },
  {
    name: "ZIP Archive",
    mimeType: "application/zip",
    extension: "zip",
    offset: 0,
    bytes: [0x50, 0x4b, 0x03, 0x04],
  },
  {
    name: "GZIP Archive",
    mimeType: "application/gzip",
    extension: "gz",
    offset: 0,
    bytes: [0x1f, 0x8b],
  },
  {
    name: "7-Zip Archive",
    mimeType: "application/x-7z-compressed",
    extension: "7z",
    offset: 0,
    bytes: [0x37, 0x7a, 0xbc, 0xaf, 0x27, 0x1c],
  },
  {
    name: "RAR Archive",
    mimeType: "application/vnd.rar",
    extension: "rar",
    offset: 0,
    bytes: [0x52, 0x61, 0x72, 0x21, 0x1a, 0x07],
  },
  {
    name: "MP3 Audio",
    mimeType: "audio/mpeg",
    extension: "mp3",
    offset: 0,
    bytes: [0x49, 0x44, 0x33],
  },
  {
    name: "WAV Audio",
    mimeType: "audio/wav",
    extension: "wav",
    offset: 8,
    bytes: [0x57, 0x41, 0x56, 0x45],
  },
  {
    name: "MP4 Video",
    mimeType: "video/mp4",
    extension: "mp4",
    offset: 4,
    bytes: [0x66, 0x74, 0x79, 0x70],
  },
  {
    name: "OGG Media",
    mimeType: "application/ogg",
    extension: "ogg",
    offset: 0,
    bytes: [0x4f, 0x67, 0x67, 0x53],
  },
  {
    name: "WebM/Matroska Video",
    mimeType: "video/webm",
    extension: "webm",
    offset: 0,
    bytes: [0x1a, 0x45, 0xdf, 0xa3],
  },
  {
    name: "SQLite Database",
    mimeType: "application/vnd.sqlite3",
    extension: "sqlite",
    offset: 0,
    bytes: [
      0x53, 0x51, 0x4c, 0x69, 0x74, 0x65, 0x20, 0x66, 0x6f, 0x72, 0x6d, 0x61, 0x74, 0x20,
      0x33, 0x00,
    ],
  },
  {
    name: "WebAssembly Module",
    mimeType: "application/wasm",
    extension: "wasm",
    offset: 0,
    bytes: [0x00, 0x61, 0x73, 0x6d],
  },
  {
    name: "Windows Executable (PE)",
    mimeType: "application/x-msdownload",
    extension: "exe",
    offset: 0,
    bytes: [0x4d, 0x5a],
  },
  {
    name: "ELF Executable",
    mimeType: "application/x-elf",
    extension: "elf",
    offset: 0,
    bytes: [0x7f, 0x45, 0x4c, 0x46],
  },
  {
    name: "TrueType Font",
    mimeType: "font/ttf",
    extension: "ttf",
    offset: 0,
    bytes: [0x00, 0x01, 0x00, 0x00, 0x00],
  },
  {
    name: "WOFF Font",
    mimeType: "font/woff",
    extension: "woff",
    offset: 0,
    bytes: [0x77, 0x4f, 0x46, 0x46],
  },
  {
    name: "WOFF2 Font",
    mimeType: "font/woff2",
    extension: "woff2",
    offset: 0,
    bytes: [0x77, 0x4f, 0x46, 0x32],
  },
]

function matches(bytes: Uint8Array, signature: FileSignature): boolean {
  if (bytes.length < signature.offset + signature.bytes.length) return false
  return signature.bytes.every((byte, i) => bytes[signature.offset + i] === byte)
}

export function detectFileSignature(bytes: Uint8Array): FileSignature | null {
  return FILE_SIGNATURES.find((signature) => matches(bytes, signature)) ?? null
}

export function toHexDump(bytes: Uint8Array, maxBytes = 64): string {
  const slice = bytes.subarray(0, maxBytes)
  const lines: string[] = []
  for (let offset = 0; offset < slice.length; offset += 16) {
    const chunk = slice.subarray(offset, offset + 16)
    const hex = Array.from(chunk, (b) => b.toString(16).padStart(2, "0")).join(" ")
    const ascii = Array.from(chunk, (b) =>
      b >= 0x20 && b < 0x7f ? String.fromCharCode(b) : ".",
    ).join("")
    lines.push(
      `${offset.toString(16).padStart(8, "0")}  ${hex.padEnd(47, " ")}  ${ascii}`,
    )
  }
  return lines.join("\n")
}
