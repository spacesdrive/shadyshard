import { FileImage } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "webp-to-png",
  title: "WebP to PNG",
  description:
    "Convert a WebP image to PNG for wider compatibility, right in your browser.",
  longDescription:
    "Drop in a WebP image to convert it to PNG format, for use in tools or platforms that don't yet support WebP. Conversion uses the Canvas API entirely on your device.",
  category: "image",
  keywords: [
    "webp to png",
    "webp to png converter",
    "convert webp to png online",
    "webp converter",
  ],
  tags: ["image", "webp", "png", "converter"],
  icon: FileImage,
  features: [
    "Lossless PNG output",
    "Keeps transparency from the source WebP",
    "Runs entirely in your browser - the image is never uploaded",
    "Drag-and-drop or click-to-browse upload",
    "Instant download of the converted file",
  ],
  faqs: [
    {
      question: "Why convert WebP to PNG?",
      answer:
        "Some older tools, editors, or platforms don't support WebP. Converting to PNG gives you a widely compatible format at the cost of a larger file size.",
    },
    {
      question: "Is my image uploaded anywhere?",
      answer:
        "No. Conversion uses the Canvas API entirely on your device. The image never leaves your computer.",
    },
    {
      question: "Does this preserve animated WebP images?",
      answer:
        "No, only the first frame of an animated WebP is converted, since PNG doesn't support animation. For animated images, keep the original WebP or convert to GIF instead.",
    },
  ],
  relatedTools: ["png-to-webp", "image-compressor"],
  isNew: true,
}

export default meta
