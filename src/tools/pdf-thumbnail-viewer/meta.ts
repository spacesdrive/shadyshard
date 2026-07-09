import { LayoutGrid } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "pdf-thumbnail-viewer",
  title: "PDF Thumbnail Viewer",
  description:
    "See every page of a PDF as a thumbnail grid without opening a full viewer.",
  longDescription:
    "Renders a small thumbnail of every page in a PDF so you can quickly scan a document's layout, spot a blank or misordered page, or confirm you have the right file. Rendered at low resolution for speed, so it's not meant as a replacement for reading the document. Runs entirely in your browser using pdf.js.",
  category: "pdf",
  keywords: [
    "pdf thumbnail viewer",
    "pdf page preview",
    "view all pdf pages",
    "pdf page grid",
    "preview pdf pages online",
  ],
  tags: ["pdf", "thumbnail", "preview", "document"],
  icon: LayoutGrid,
  features: [
    "Renders every page as a thumbnail",
    "Page numbers labeled under each thumbnail",
    "Fast, low-resolution rendering for quick scanning",
    "Runs entirely offline in your browser using pdf.js",
  ],
  faqs: [
    {
      question: "Can I download the thumbnails as images?",
      answer:
        "Not from this tool - it's built for quick visual scanning, not export. Use PDF to Images if you need downloadable page images.",
    },
  ],
  relatedTools: ["pdf-to-images", "pdf-page-counter", "pdf-page-reorder"],
  isNew: true,
}

export default meta
