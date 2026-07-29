import { FileDigit } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "pdf-page-numbers",
  title: "PDF Page Numbers",
  description:
    "Add page numbers to a PDF in any corner, with a custom format, starting number, and skipped cover pages.",
  longDescription:
    "Pick a corner, a font size, and a margin, then choose how each number should read: a bare number, Page 3, or 3 of 24. Cover pages can be left unnumbered and the count can start from any number, which is what you need when a document is one part of a larger bound set. The PDF is rewritten by pdf-lib in your browser, so a draft or a client document is never uploaded anywhere.",
  category: "pdf",
  keywords: [
    "add page numbers to pdf",
    "pdf page numbering tool",
    "number pdf pages free",
    "pdf bates style numbering",
    "page x of y pdf",
  ],
  tags: ["pdf", "page numbers", "document", "pagination"],
  icon: FileDigit,
  features: [
    "Six placement positions across the top and bottom",
    "Formats for a bare number, Page n, or n of total",
    "Skip cover pages and start counting from any number",
    "Adjustable font size and page margin",
    "Runs entirely in your browser with no upload",
  ],
  faqs: [
    {
      question: "Can I leave the cover page unnumbered?",
      answer:
        "Yes. Set the number of pages to skip, and numbering starts on the first page after them. Those skipped pages are left completely untouched.",
    },
    {
      question: "What does the starting number do?",
      answer:
        "It sets the number printed on the first numbered page, so a chapter that continues from another file can start at 25 rather than 1.",
    },
    {
      question: "Will the numbers overlap my existing content?",
      answer:
        "They are drawn on top of the page at the margin you choose, so increase the margin if your document already has a footer there. The preview of format and position above the download button shows exactly what will be written.",
    },
    {
      question: "Is my PDF uploaded?",
      answer:
        "No. The file is read locally and rewritten by pdf-lib in your browser, and the download is produced from that result.",
    },
  ],
}

export default meta
