import { RotateCw } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "pdf-page-rotator",
  title: "PDF Page Rotator",
  description: "Rotate every page or specific pages of a PDF by 90, 180, or 270 degrees.",
  longDescription:
    "Fix pages that were scanned sideways or upside down. Choose to rotate every page in the PDF, or just a specific range, by 90, 180, or 270 degrees clockwise, then download the corrected file. Runs entirely in your browser via pdf-lib.",
  category: "pdf",
  keywords: [
    "rotate pdf pages",
    "fix sideways pdf",
    "rotate pdf online",
    "turn pdf page",
    "pdf page rotation tool",
  ],
  tags: ["pdf", "rotate", "pages", "document"],
  icon: RotateCw,
  features: [
    "Rotate all pages or a specific page range",
    "90, 180, or 270 degree clockwise rotation",
    "Rotation is applied on top of any existing page rotation",
    "Runs entirely offline in your browser",
  ],
  faqs: [
    {
      question: "Can I rotate only some pages, leaving others upright?",
      answer:
        'Yes. Switch to "specific pages" and enter a page range like "1, 3-4" - only those pages rotate, the rest stay as they are.',
    },
    {
      question: "What if a page is already rotated?",
      answer:
        "The rotation you choose is added to whatever rotation the page already has, so a page already at 90 degrees rotated another 90 degrees ends up at 180.",
    },
  ],
  relatedTools: ["pdf-page-deleter", "pdf-page-reorder", "pdf-page-extractor"],
  isNew: true,
}

export default meta
