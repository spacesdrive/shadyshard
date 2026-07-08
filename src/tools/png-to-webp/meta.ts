import { FileImage } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "png-to-webp",
  title: "PNG to WebP",
  description:
    "Convert a PNG image to WebP for smaller file sizes, right in your browser.",
  longDescription:
    "Drop in a PNG to convert it to WebP format with an adjustable quality slider. WebP typically produces significantly smaller files than PNG while keeping transparency support. Conversion uses the Canvas API entirely on your device.",
  category: "image",
  keywords: [
    "png to webp",
    "png to webp converter",
    "convert png to webp online",
    "webp converter",
  ],
  tags: ["image", "png", "webp", "converter"],
  icon: FileImage,
  features: [
    "Adjustable WebP quality",
    "Keeps transparency, unlike PNG to JPG",
    "Runs entirely in your browser - the image is never uploaded",
    "Drag-and-drop or click-to-browse upload",
    "Instant download of the converted file",
  ],
  faqs: [
    {
      question: "Does WebP keep transparency?",
      answer:
        "Yes, unlike JPG, WebP supports an alpha channel, so transparent areas in the PNG are preserved.",
    },
    {
      question: "Is my image uploaded anywhere?",
      answer:
        "No. Conversion uses the Canvas API entirely on your device. The image never leaves your computer.",
    },
    {
      question: "Do all browsers support WebP?",
      answer:
        "Yes, WebP is supported by all current major browsers, though very old browsers may not display it.",
    },
  ],
  relatedTools: ["webp-to-png", "image-compressor"],
  isNew: true,
}

export default meta
