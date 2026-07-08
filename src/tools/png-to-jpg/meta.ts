import { FileImage } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "png-to-jpg",
  title: "PNG to JPG",
  description:
    "Convert a PNG image to JPG, with an adjustable quality slider, in your browser.",
  longDescription:
    "Drop in a PNG to convert it to JPG format with an adjustable quality slider. Conversion uses the Canvas API entirely on your device - your image is never uploaded. Note that transparency is lost, since JPG doesn't support an alpha channel; transparent areas become white.",
  category: "image",
  keywords: [
    "png to jpg",
    "png to jpg converter",
    "convert png to jpg online",
    "png to jpeg",
  ],
  tags: ["image", "png", "jpg", "converter"],
  icon: FileImage,
  features: [
    "Adjustable JPG quality",
    "Runs entirely in your browser - the image is never uploaded",
    "Drag-and-drop or click-to-browse upload",
    "Instant download of the converted file",
    "No file size limits imposed by this tool",
  ],
  faqs: [
    {
      question: "What happens to transparency?",
      answer:
        "JPG doesn't support transparency, so any transparent areas in the PNG are filled with white in the JPG output.",
    },
    {
      question: "Is my image uploaded anywhere?",
      answer:
        "No. Conversion uses the Canvas API entirely on your device. The image never leaves your computer.",
    },
    {
      question: "Why would I convert PNG to JPG?",
      answer:
        "JPG files are typically much smaller than PNG for photographic images, since JPG uses lossy compression tuned for photos rather than PNG's lossless compression.",
    },
  ],
  relatedTools: ["jpg-to-png", "image-compressor"],
  isNew: true,
}

export default meta
