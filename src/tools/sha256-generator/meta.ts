import { FileDigit } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "sha256-generator",
  title: "SHA256 Generator",
  description:
    "Generate a SHA-256 hash of any text using the browser's native Web Crypto API.",
  longDescription:
    "Type or paste text to instantly see its SHA-1, SHA-256, SHA-384, or SHA-512 hash, computed with the browser's native SubtleCrypto API. Hashing runs entirely on your device - your text is never sent anywhere.",
  category: "security",
  keywords: [
    "sha256 generator",
    "sha256 hash online",
    "sha256 checksum",
    "text to sha256",
    "hash generator",
  ],
  tags: ["sha256", "hash", "security", "checksum"],
  icon: FileDigit,
  features: [
    "SHA-256 by default, with SHA-1, SHA-384, and SHA-512 available",
    "Uses the native Web Crypto SubtleCrypto API, not a JavaScript reimplementation",
    "Live hash as you type",
    "One-click copy of the hash",
    "Works entirely offline in your browser",
  ],
  faqs: [
    {
      question: "Is my text uploaded anywhere?",
      answer:
        "No. The hash is computed locally using the browser's built-in Web Crypto API. Nothing is sent to a server.",
    },
    {
      question: "Should I use SHA-1?",
      answer:
        "SHA-1 is included for compatibility with legacy systems, but it's considered cryptographically broken for security purposes. Prefer SHA-256 or SHA-512 for anything security-sensitive.",
    },
    {
      question: "Can I verify a file's checksum with this?",
      answer:
        "This tool hashes text input. For file integrity checks, hash the file with a command-line tool and compare the output to what you'd get by pasting the file's exact byte content here.",
    },
  ],
  relatedTools: ["password-generator", "base64-encoder-decoder", "jwt-decoder"],
  isNew: true,
}

export default meta
