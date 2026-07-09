import { FileInput } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "images-to-pdf",
  title: "Images to PDF",
  description: "Combine JPG and PNG images into a single PDF, one image per page.",
  longDescription:
    "Drop in one or more JPG or PNG images, reorder them, and combine them into a single PDF with one image per page, each scaled to fit an A4 page. Useful for turning a batch of scanned photos or screenshots into one shareable document. Runs entirely in your browser using pdf-lib.",
  category: "pdf",
  keywords: [
    "images to pdf",
    "jpg to pdf",
    "png to pdf",
    "convert photos to pdf",
    "combine images into pdf",
  ],
  tags: ["pdf", "image", "convert", "document"],
  icon: FileInput,
  features: [
    "Combine any number of JPG/PNG images into one PDF",
    "Reorder images before converting",
    "Each image is scaled to fit an A4 page",
    "Runs entirely offline in your browser",
  ],
  faqs: [
    {
      question: "What image formats are supported?",
      answer:
        "JPG and PNG. For other formats, convert to JPG or PNG first using this site's image converters.",
    },
    {
      question: "Can I control the page size or image placement?",
      answer:
        "Not yet - every image is centered on an A4 page, scaled down to fit if needed, without cropping or stretching. Page size and layout options may be added later if there's demand.",
    },
  ],
  relatedTools: ["pdf-to-images", "pdf-merge", "image-resizer"],
  isNew: true,
}

export default meta
