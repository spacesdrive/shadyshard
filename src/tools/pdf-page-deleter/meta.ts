import { FileX2 } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "pdf-page-deleter",
  title: "PDF Page Deleter",
  description: "Remove specific pages from a PDF and download the rest.",
  longDescription:
    'Upload a PDF, type the pages you want removed (like "2, 5-6"), and get a new PDF with every other page kept in its original order. The opposite of the PDF Page Extractor, which keeps only the pages you list. Runs entirely in your browser via pdf-lib.',
  category: "pdf",
  keywords: [
    "delete pdf pages",
    "remove pages from pdf",
    "pdf page remover",
    "delete blank pages pdf",
    "pdf page deleter online",
  ],
  tags: ["pdf", "delete", "pages", "document"],
  icon: FileX2,
  features: [
    'Type a page range like "2, 5-6" to remove exactly those pages',
    "Every remaining page keeps its original order",
    "Works with PDFs of any page count",
    "Runs entirely offline in your browser",
  ],
  faqs: [
    {
      question: "How is this different from the PDF Page Extractor?",
      answer:
        "Page Deleter removes the pages you list and keeps everything else. Page Extractor does the opposite - it keeps only the pages you list and discards the rest.",
    },
    {
      question: "What happens if I list every page?",
      answer:
        "You'll get an error - a PDF needs at least one remaining page. Use the Extractor with an empty result isn't supported either, since a zero-page PDF isn't a valid file.",
    },
  ],
  relatedTools: ["pdf-page-extractor", "pdf-split", "pdf-page-rotator"],
  isNew: true,
}

export default meta
