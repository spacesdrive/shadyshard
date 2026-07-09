import { FileDigit } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "file-hash-generator",
  title: "File Hash Generator",
  description: "Compute the SHA-1, SHA-256, SHA-384, or SHA-512 hash of any file.",
  longDescription:
    "Drop in a file to compute its cryptographic hash, useful for verifying a download matches a publisher's published checksum, or generating a fingerprint for a file without uploading it anywhere. For hashing typed or pasted text instead of a file, use the SHA-256 Generator. To check a file against an expected hash automatically, use the Checksum Verifier. Runs entirely in your browser via the Web Crypto API.",
  category: "security",
  keywords: [
    "file hash generator",
    "sha256 file checksum",
    "file checksum online",
    "hash a file",
    "verify file integrity",
  ],
  tags: ["hash", "checksum", "file", "security"],
  icon: FileDigit,
  features: [
    "SHA-1, SHA-256, SHA-384, and SHA-512 algorithms",
    "Works with any file type, no size limit beyond browser memory",
    "Runs entirely offline in your browser",
    "File contents never leave your device",
  ],
  faqs: [
    {
      question: "How is this different from the SHA-256 Generator?",
      answer:
        "SHA-256 Generator hashes text you type or paste. This tool hashes the actual bytes of an uploaded file - use whichever matches what you're trying to verify.",
    },
    {
      question: "Why isn't MD5 offered as an option?",
      answer:
        "The Web Crypto API this tool uses natively supports SHA-1/256/384/512 but not MD5. MD5 is also cryptographically broken for security purposes, though it's occasionally still used for basic file integrity checks - if you need it specifically, a dedicated MD5 tool would be required.",
    },
  ],
  relatedTools: ["checksum-verifier", "sha256-generator", "file-signature-inspector"],
  isNew: true,
}

export default meta
