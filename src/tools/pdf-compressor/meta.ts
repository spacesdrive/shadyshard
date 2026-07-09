import { FileArchive } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "pdf-compressor",
  title: "PDF Compressor",
  description:
    "Reduce a PDF's file size by deduplicating and compacting its internal structure.",
  longDescription:
    "Re-saves your PDF with object-stream compaction, which removes redundant internal objects and compresses the file's cross-reference table. This genuinely shrinks PDFs with repeated structure (for example, forms or PDFs produced by some office software), but it does not re-encode or downsample embedded images - true image recompression would require decoding and re-encoding every image in the file, which isn't something this tool does. If your PDF's size is dominated by large images, expect a modest reduction, not a dramatic one. Runs entirely in your browser via pdf-lib.",
  category: "pdf",
  keywords: [
    "compress pdf",
    "reduce pdf file size",
    "shrink pdf online",
    "pdf compressor free",
    "smaller pdf file",
  ],
  tags: ["pdf", "compress", "size", "document"],
  icon: FileArchive,
  features: [
    "Shows before and after file size",
    "Deduplicates and compacts internal PDF structure",
    "Clearly documents what it does not do (image recompression)",
    "Runs entirely offline in your browser",
  ],
  faqs: [
    {
      question: "Why didn't my file size change much?",
      answer:
        "This tool compacts the PDF's internal object structure, which helps most with PDFs that have redundant structure, but it does not re-encode embedded images. If your file's size is mostly large images, this tool won't reduce it much - a dedicated image-recompression step would be needed, which isn't implemented here.",
    },
    {
      question: "Will compression affect the visible content of my PDF?",
      answer:
        "No. This only changes how the PDF's internal objects are stored, not any visible text, image, or layout content.",
    },
  ],
  relatedTools: ["pdf-metadata-remover", "image-compressor", "pdf-page-counter"],
  isNew: true,
}

export default meta
