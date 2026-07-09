import { ArrowDownUp } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "pdf-page-reorder",
  title: "PDF Page Reorder",
  description:
    "Change the order of pages within a PDF using simple move-up and move-down controls.",
  longDescription:
    "Upload a PDF and reorder its pages with the up and down arrows next to each page number, then download a new PDF in that order. Useful for fixing a misordered scan or moving a table of contents page. Runs entirely in your browser via pdf-lib.",
  category: "pdf",
  keywords: [
    "reorder pdf pages",
    "rearrange pdf pages",
    "change pdf page order",
    "move pdf pages",
    "pdf page organizer",
  ],
  tags: ["pdf", "reorder", "pages", "document"],
  icon: ArrowDownUp,
  features: [
    "Move any page up or down in the list",
    "Preview the resulting page order before downloading",
    "Works with PDFs of any page count",
    "Runs entirely offline in your browser",
  ],
  faqs: [
    {
      question: "Can I duplicate a page while reordering?",
      answer:
        "No, this tool reorders the existing pages without duplicating or removing any. To keep a page more than once, use the PDF Page Extractor and list that page number multiple times.",
    },
    {
      question: "Is there a limit to how many pages I can reorder?",
      answer:
        "No fixed limit, though a very high page count makes the move-up/move-down list long to scroll through - for large restructuring jobs, PDF Page Extractor's range syntax may be faster.",
    },
  ],
  relatedTools: ["pdf-page-extractor", "pdf-page-rotator", "pdf-merge"],
  isNew: true,
}

export default meta
