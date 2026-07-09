import { FileType2 } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "pdf-text-extractor",
  title: "PDF Text Extractor",
  description:
    "Pull the plain text out of a PDF, page by page, ready to copy or download.",
  longDescription:
    "Extracts the selectable text layer from every page of a PDF and shows it as plain text, with page breaks marked. This works for PDFs that contain real text (most PDFs created from a word processor, web page, or code) but not for scanned image-only PDFs, which have no underlying text layer to extract - that would require optical character recognition, which this tool does not perform. Runs entirely in your browser via pdf.js, the same rendering engine behind Firefox's built-in PDF viewer.",
  category: "pdf",
  keywords: [
    "extract text from pdf",
    "pdf to text",
    "copy text from pdf",
    "pdf text extractor online",
    "get text from pdf file",
  ],
  tags: ["pdf", "text", "extract", "document"],
  icon: FileType2,
  features: [
    "Extracts text page by page with page breaks marked",
    "Copy the full extracted text or download it as a .txt file",
    "Runs entirely offline in your browser using pdf.js",
    "Clearly explains the scanned-PDF limitation",
  ],
  faqs: [
    {
      question: "Why is the extracted text empty or garbled for my PDF?",
      answer:
        "If your PDF is a scan (a photo or scanned image of a page saved as a PDF), it has no real text layer - what you see is an image, not selectable text. Extracting text from a scan requires optical character recognition (OCR), which this tool does not perform.",
    },
    {
      question: "Does this preserve formatting like tables or columns?",
      answer:
        "No, the output is plain text in reading order as pdf.js reports it - complex layouts like multi-column pages or tables may not extract in a visually intuitive order.",
    },
  ],
  relatedTools: ["pdf-to-images", "word-counter", "pdf-thumbnail-viewer"],
  isNew: true,
}

export default meta
