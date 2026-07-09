import { ShieldCheck } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "checksum-verifier",
  title: "Checksum Verifier",
  description:
    "Verify a file matches an expected checksum, without a manual copy-paste comparison.",
  longDescription:
    "Drop in a file and paste the checksum you expect it to match (for example, one published on a download page), and this tool computes the file's actual hash and tells you whether they match - case-insensitively, ignoring extra whitespace. The algorithm is auto-detected from the expected checksum's length where possible. Runs entirely in your browser via the Web Crypto API.",
  category: "security",
  keywords: [
    "checksum verifier",
    "verify file checksum",
    "compare file hash",
    "sha256 checksum verify",
    "check downloaded file integrity",
  ],
  tags: ["checksum", "hash", "verify", "security"],
  icon: ShieldCheck,
  features: [
    "Compares a computed hash against an expected value automatically",
    "Auto-detects the algorithm from the expected checksum's length",
    "Case-insensitive, whitespace-tolerant comparison",
    "Runs entirely offline in your browser",
  ],
  faqs: [
    {
      question: "How is this different from the File Hash Generator?",
      answer:
        "File Hash Generator shows you the computed hash to compare yourself. Checksum Verifier does that comparison for you against a checksum you paste in, and gives a clear match/no-match result.",
    },
    {
      question: "How is the algorithm detected?",
      answer:
        "By the expected checksum's character length: 40 hex characters means SHA-1, 64 means SHA-256, 96 means SHA-384, and 128 means SHA-512. If the length doesn't match any of these, you're asked to pick the algorithm manually.",
    },
  ],
  relatedTools: ["file-hash-generator", "sha256-generator", "mime-type-inspector"],
  isNew: true,
}

export default meta
