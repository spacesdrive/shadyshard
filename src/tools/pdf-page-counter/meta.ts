import { Hash } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "pdf-page-counter",
  title: "PDF Page Counter",
  description: "Count the number of pages in a PDF instantly.",
  longDescription:
    "Drop in a PDF to see its exact page count, without opening it in a full PDF viewer. Also shows the file size for a quick at-a-glance summary. Runs entirely in your browser via pdf-lib.",
  category: "pdf",
  keywords: [
    "pdf page counter",
    "count pdf pages",
    "how many pages in pdf",
    "pdf page count tool",
    "check pdf pages",
  ],
  tags: ["pdf", "pages", "count", "document"],
  icon: Hash,
  features: [
    "Instant, exact page count",
    "Also shows file size",
    "Works with password-free PDFs of any size",
    "Runs entirely offline in your browser",
  ],
  faqs: [
    {
      question: "Does this work with password-protected PDFs?",
      answer:
        "No. An encrypted PDF's internal structure can't be read without the password, so this tool will report that the file is password-protected instead of a page count. Use the PDF Password Checker to confirm encryption status first.",
    },
  ],
  relatedTools: ["pdf-metadata-viewer", "pdf-password-checker", "pdf-split"],
  isNew: true,
}

export default meta
