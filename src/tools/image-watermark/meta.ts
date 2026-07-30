import { Stamp } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "image-watermark",
  title: "Image Watermark",
  description:
    "Add a text watermark to a photo with control over position, size, angle, and opacity.",
  longDescription:
    "Stamp your name, a copyright line, or a label such as a draft marker onto an image before you share it. Position the text in any of nine spots or tile it across the whole picture, then adjust size, colour, opacity, and rotation with a live preview at full resolution. Most watermarking sites either upload your photo to their servers or add their own branding to the free tier. This one draws the watermark on a canvas in your browser, so the photo is never transmitted and the only text on the result is yours.",
  category: "image",
  keywords: [
    "add watermark to image",
    "text watermark generator",
    "watermark photo online free",
    "copyright watermark maker",
    "watermark image without upload",
  ],
  tags: ["watermark", "image", "photo", "copyright", "canvas", "text"],
  icon: Stamp,
  isNew: true,
  features: [
    "Nine anchor positions plus a tiled mode that covers the whole image",
    "Font size, colour, opacity, and rotation with a live preview",
    "Optional contrast outline so light text stays readable on light photos",
    "Exports as PNG or JPEG at the original resolution",
    "Draws locally on a canvas, so the photo is never uploaded",
  ],
  faqs: [
    {
      question: "Is my photo uploaded anywhere?",
      answer:
        "No. The image is read with the browser File API, drawn to a canvas in the page, and exported back to you as a download. It never leaves your device and nothing is stored.",
    },
    {
      question: "Does the watermark reduce the image quality?",
      answer:
        "Exporting as PNG is lossless, so only the pixels under the text change. Exporting as JPEG re-encodes the whole image, which loses a little detail, so use PNG if the original was a PNG or if quality matters more than file size.",
    },
    {
      question: "Can a watermark like this be removed?",
      answer:
        "A visible watermark discourages casual reuse but is not tamper proof, and a determined editor can paint it out. A tiled watermark across the whole image is much harder to remove cleanly than a single corner mark.",
    },
    {
      question: "Why does my watermark disappear on light photos?",
      answer:
        "White or pale text has almost no contrast against a bright background. Switch the colour, or turn on the outline option, which draws a thin contrasting edge around each character so the text stays legible on any background.",
    },
  ],
}

export default meta
