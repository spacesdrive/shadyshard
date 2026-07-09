import { FileOutput } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "pdf-page-extractor",
  title: "PDF Page Extractor",
  description: "Pull specific pages out of a PDF into a new, smaller PDF.",
  longDescription:
    'Upload a PDF, type the pages you want (like "1-3, 7, 10"), and get a new PDF containing only those pages, in the order you listed them. Useful for pulling a chapter, a signed page, or a set of exhibits out of a larger document. Runs entirely in your browser via pdf-lib.',
  category: "pdf",
  keywords: [
    "extract pdf pages",
    "pull pages from pdf",
    "pdf page extractor",
    "select pages from pdf",
    "get specific pdf pages",
  ],
  tags: ["pdf", "extract", "pages", "document"],
  icon: FileOutput,
  features: [
    'Type a page range like "1-3, 7" to extract exactly those pages',
    "Output pages keep the order you list them in",
    "Works with PDFs of any page count",
    "Runs entirely offline in your browser",
  ],
  faqs: [
    {
      question: "Can I extract pages out of order, or repeat a page?",
      answer:
        'Yes. Listing pages as "5, 1, 5" produces a 3-page output PDF with page 5, then page 1, then page 5 again, in that order.',
    },
    {
      question: "What page range syntax is supported?",
      answer:
        'Comma-separated individual pages and hyphenated ranges, both 1-indexed - for example "1-3,5,8-9".',
    },
  ],
  relatedTools: ["pdf-page-deleter", "pdf-split", "pdf-page-reorder"],
  isNew: true,
}

export default meta
