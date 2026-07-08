import { Minimize } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "image-compressor",
  title: "Image Compressor",
  description:
    "Compress a JPG, PNG, or WebP image with an adjustable quality slider, right in your browser.",
  longDescription:
    "Drop in an image and adjust the quality slider to compress it, with a live before/after file size comparison. Compression happens by re-encoding through the Canvas API - your image is never uploaded anywhere.",
  category: "image",
  keywords: [
    "image compressor",
    "compress image online",
    "reduce image file size",
    "jpg compressor",
    "png compressor",
  ],
  tags: ["image", "compress", "optimize", "file size"],
  icon: Minimize,
  features: [
    "Adjustable quality slider with live file size feedback",
    "Works with JPG, PNG, and WebP",
    "Before/after size comparison with percentage saved",
    "Drag-and-drop or click-to-browse upload",
    "Runs entirely in your browser - the image is never uploaded",
  ],
  faqs: [
    {
      question: "Is my image uploaded to a server?",
      answer:
        "No. Compression uses the browser's Canvas API entirely on your device. The image file never leaves your computer.",
    },
    {
      question: "Why doesn't the quality slider affect PNG output much?",
      answer:
        "PNG is a lossless format, so the quality setting mainly affects JPG and WebP output. For PNG, try Image Resizer to reduce dimensions, which has a bigger impact on file size.",
    },
    {
      question: "What's the maximum file size I can compress?",
      answer:
        "There's no hard limit imposed by this tool, but very large images may be slower to process since everything runs on your device's CPU rather than a server.",
    },
  ],
  relatedTools: ["image-resizer", "png-to-webp"],
  isNew: true,
}

export default meta
