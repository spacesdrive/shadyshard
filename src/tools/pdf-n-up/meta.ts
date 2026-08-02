import { LayoutGrid } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "pdf-n-up",
  title: "PDF N-up Layout",
  description:
    "Place 2, 4, 6, 8, 9, or 16 PDF pages on each sheet to save paper when printing.",
  longDescription:
    "Lays several pages of a PDF onto each output sheet, the operation print shops call N-up imposition. Each page is scaled to fit its cell with its proportions kept, so nothing is cropped or stretched, and you control the outer margin, the space between cells, and whether a faint guide border is drawn around each one. Unlike doing this from a print dialog, the result is a real PDF you can save, email, or send to a print service. Most tools that do this are desktop applications you have to install; this one runs in your browser, so the document is never uploaded.",
  category: "pdf",
  keywords: [
    "pdf n-up",
    "multiple pdf pages per sheet",
    "2 pages per sheet pdf",
    "pdf imposition tool",
    "print pdf 4 pages on one page",
  ],
  tags: ["pdf", "print", "layout", "imposition", "n-up", "paper"],
  icon: LayoutGrid,
  isNew: true,
  features: [
    "2, 4, 6, 8, 9, or 16 pages per sheet",
    "Automatic, portrait, or landscape sheet orientation",
    "Adjustable outer margin and gutter between cells",
    "Optional guide border around each cell",
    "Runs on your device with no upload",
  ],
  faqs: [
    {
      question: "Is this the same as printing multiple pages per sheet?",
      answer:
        "The result is the same, but it is saved as a PDF rather than sent straight to a printer. That matters when you need to email the handout, upload it to a print service, or check the layout before using paper, none of which a print dialog lets you do.",
    },
    {
      question: "Why is the sheet landscape when I chose 2 pages?",
      answer:
        "On automatic, the sheet is turned landscape whenever the grid is wider than it is tall, which is what puts two portrait pages side by side at a readable size. Choose portrait if you would rather stack them one above the other.",
    },
    {
      question: "Will the pages be cropped?",
      answer:
        "No. Each page is scaled by the smaller of the two fits, so the whole page always lands inside its cell and any leftover space becomes even padding. If you want the margins gone as well, crop them first with the PDF Margin Cropper and then run the result through this.",
    },
    {
      question: "Are pages that are rotated in the original handled?",
      answer:
        "A page carrying a rotation flag is placed using its unrotated content, so a landscape scan stored as a rotated portrait page can appear sideways. Rotate those pages first with the PDF Page Rotator and the layout will follow.",
    },
  ],
  relatedTools: ["pdf-margin-cropper", "pdf-page-rotator", "pdf-merge", "pdf-split"],
}

export default meta
