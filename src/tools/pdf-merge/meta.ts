import { FileStack } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "pdf-merge",
  title: "PDF Merge",
  description: "Combine multiple PDF files into one, in the order you choose.",
  longDescription:
    "Drop in two or more PDF files, reorder them with the up and down controls, and merge them into a single PDF. Every page from every file is copied in order into the output. Processing happens entirely in your browser using pdf-lib - your files are never uploaded anywhere.",
  category: "pdf",
  keywords: [
    "merge pdf",
    "combine pdf files",
    "pdf merger online",
    "join pdf files",
    "merge multiple pdfs",
  ],
  tags: ["pdf", "merge", "combine", "document"],
  icon: FileStack,
  features: [
    "Merge any number of PDF files into one",
    "Reorder files before merging",
    "Preserves every page exactly as it appears in the source",
    "Works entirely offline in your browser",
    "No file size limit beyond your browser's own memory",
  ],
  faqs: [
    {
      question: "In what order are the files merged?",
      answer:
        "In the order they appear in the list, top to bottom. Use the up and down arrows next to each file to reorder before merging.",
    },
    {
      question: "Is there a limit on file size or page count?",
      answer:
        "No fixed limit, but very large files are constrained by your browser's available memory since everything is processed on your device rather than a server.",
    },
    {
      question: "Are my PDFs uploaded to a server?",
      answer:
        "No. Merging happens entirely in your browser using the pdf-lib library. Your files never leave your device.",
    },
  ],
  relatedTools: ["pdf-split", "pdf-page-reorder", "pdf-page-extractor"],
  isNew: true,
}

export default meta
