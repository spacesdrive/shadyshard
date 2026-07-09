import { ScanSearch } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "file-signature-inspector",
  title: "File Signature Inspector",
  description:
    "View the raw hex bytes at the start of a file and any matching format signature.",
  longDescription:
    'Shows a hex and ASCII dump of the first bytes of a file - the same view forensics and reverse-engineering tools use to inspect a file\'s binary header - alongside any known file-format signature that matches. For a quick single-answer "what type is this file," use the MIME Type Inspector instead; this tool is for looking at the actual bytes yourself. Runs entirely in your browser.',
  category: "security",
  keywords: [
    "file signature inspector",
    "hex dump viewer",
    "file magic bytes",
    "inspect binary file header",
    "hex viewer online",
  ],
  tags: ["hex", "file signature", "security", "inspect"],
  icon: ScanSearch,
  features: [
    "Hex and ASCII dump of a file's first 256 bytes",
    "Highlights any recognized format signature",
    "Same offset/hex/ASCII layout as standard hex editor tools",
    "Runs entirely offline in your browser",
  ],
  faqs: [
    {
      question: "How is this different from the MIME Type Inspector?",
      answer:
        "MIME Type Inspector gives a single-answer summary of what a file is. File Signature Inspector shows the raw hex bytes themselves alongside any match, for cases where you want to look at the actual binary header rather than just a conclusion.",
    },
    {
      question: "Why only the first 256 bytes?",
      answer:
        "Every format signature this tool recognizes starts within the first few bytes of a file, so a short header is enough - dumping an entire large file as hex would be slow to render and rarely useful.",
    },
  ],
  relatedTools: ["mime-type-inspector", "file-hash-generator", "file-size-analyzer"],
  isNew: true,
}

export default meta
