import { FileImage } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "jpg-to-png",
  title: "JPG to PNG",
  description: "Convert a JPG image to lossless PNG format, right in your browser.",
  longDescription:
    "Drop in a JPG to convert it to PNG format. Conversion uses the Canvas API entirely on your device - your image is never uploaded.",
  category: "image",
  keywords: [
    "jpg to png",
    "jpeg to png",
    "jpg to png converter",
    "convert jpg to png online",
  ],
  tags: ["image", "jpg", "png", "converter"],
  icon: FileImage,
  features: [
    "Lossless PNG output",
    "Runs entirely in your browser - the image is never uploaded",
    "Drag-and-drop or click-to-browse upload",
    "Instant download of the converted file",
    "No file size limits imposed by this tool",
  ],
  faqs: [
    {
      question: "Will converting to PNG add transparency?",
      answer:
        "No. A JPG has no transparency data to begin with, so the PNG output is fully opaque, just in a lossless format.",
    },
    {
      question: "Is my image uploaded anywhere?",
      answer:
        "No. Conversion uses the Canvas API entirely on your device. The image never leaves your computer.",
    },
    {
      question: "Why would I convert JPG to PNG?",
      answer:
        "PNG is lossless and better suited to images with sharp edges, text, or flat colors, and is often required by tools or workflows that need transparency support even if the source doesn't use it.",
    },
  ],
  relatedTools: ["png-to-jpg", "image-compressor"],
  isNew: true,
}

export default meta
