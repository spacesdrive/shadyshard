import { FileSearch } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "pdf-metadata-viewer",
  title: "PDF Metadata Viewer",
  description:
    "View a PDF's title, author, subject, keywords, and other document metadata.",
  longDescription:
    "Upload a PDF to see its embedded document metadata: title, author, subject, keywords, creator, producer, creation date, and modification date, plus the page count. Useful for checking what information a PDF carries before sharing it. To remove this metadata instead of just viewing it, use the PDF Metadata Remover. Runs entirely in your browser via pdf-lib.",
  category: "pdf",
  keywords: [
    "pdf metadata viewer",
    "view pdf properties",
    "pdf document info",
    "check pdf author",
    "pdf metadata inspector",
  ],
  tags: ["pdf", "metadata", "inspect", "document"],
  icon: FileSearch,
  features: [
    "Shows title, author, subject, keywords, creator, producer",
    "Shows creation and modification dates",
    "Shows total page count",
    "Runs entirely offline in your browser",
  ],
  faqs: [
    {
      question: "Why are some fields blank?",
      answer:
        "Not every PDF has every metadata field set - many PDFs, especially scanned documents, carry little or no metadata at all. A blank field means the PDF genuinely doesn't have that field set, not that this tool failed to read it.",
    },
    {
      question: "Can I edit the metadata here?",
      answer:
        "This tool only displays metadata. To strip it entirely, use the PDF Metadata Remover.",
    },
  ],
  relatedTools: ["pdf-metadata-remover", "pdf-page-counter", "pdf-password-checker"],
  isNew: true,
}

export default meta
