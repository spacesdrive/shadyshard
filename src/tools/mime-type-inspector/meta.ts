import { FileSearch2 } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "mime-type-inspector",
  title: "MIME Type Inspector",
  description:
    "Detect a file's real type from its content, regardless of its extension or name.",
  longDescription:
    'Drop in a file to see what type it actually is, detected from the first bytes of its content (its "magic number") rather than trusting its filename or extension. Useful for confirming a file someone sent you really is what its name claims. Checked against a database of common file signatures. If nothing matches, the file\'s browser-reported MIME type is shown instead as a fallback. Runs entirely in your browser.',
  category: "security",
  keywords: [
    "mime type detector",
    "file type checker",
    "detect real file type",
    "identify file format",
    "check file type online",
  ],
  tags: ["mime", "file type", "security", "inspect"],
  icon: FileSearch2,
  features: [
    "Detects file type from content, not filename",
    "Covers common image, archive, audio, video, and document formats",
    "Falls back to the browser-reported MIME type if no signature matches",
    "Runs entirely offline in your browser",
  ],
  faqs: [
    {
      question: "Why would a file's extension not match its real type?",
      answer:
        "A file can be renamed to any extension without changing its content - a .txt file could actually contain a PNG, or a malicious file could be disguised with a harmless-looking extension. Checking real content is more reliable than trusting the name.",
    },
    {
      question: "What if my file's type isn't recognized?",
      answer:
        "The signature database covers common formats, not every possible file type. If nothing matches, the browser's own reported MIME type (based on the file extension) is shown as a fallback instead.",
    },
  ],
  relatedTools: ["file-signature-inspector", "file-hash-generator", "file-size-analyzer"],
  isNew: true,
}

export default meta
