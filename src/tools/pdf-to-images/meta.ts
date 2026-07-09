import { FileImage } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "pdf-to-images",
  title: "PDF to Images",
  description: "Convert every page of a PDF into a downloadable PNG image.",
  longDescription:
    "Renders each page of a PDF to a PNG image at a resolution you choose, with a download button per page. Useful for pulling a page out as an image to paste into a slide deck or chat, or for generating previews. Rendering happens entirely in your browser using pdf.js, the same engine behind Firefox's built-in PDF viewer.",
  category: "pdf",
  keywords: [
    "pdf to image",
    "pdf to png",
    "convert pdf pages to images",
    "pdf page to image online",
    "export pdf as images",
  ],
  tags: ["pdf", "image", "convert", "document"],
  icon: FileImage,
  features: [
    "Renders every page to a PNG image",
    "Choose the render resolution before converting",
    "Download each page's image individually",
    "Runs entirely offline in your browser using pdf.js",
  ],
  faqs: [
    {
      question: 'Why isn\'t there a single "download all" button?',
      answer:
        "Bundling multiple files into one download would require a zip library as an added dependency. Each page's download button triggers instantly, so downloading a handful of pages individually is just as fast without the extra dependency.",
    },
    {
      question: "Can I choose a different output format like JPG?",
      answer:
        "This tool always exports PNG, which is lossless and better suited to text-heavy pages. If you need JPG, use the PNG to JPG converter on the resulting image.",
    },
  ],
  relatedTools: ["images-to-pdf", "pdf-thumbnail-viewer", "png-to-jpg"],
  isNew: true,
}

export default meta
