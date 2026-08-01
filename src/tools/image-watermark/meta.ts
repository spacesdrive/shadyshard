import { Stamp } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "image-watermark",
  title: "Image Watermark",
  description:
    "Add a text watermark to an image, positioned in a corner or tiled diagonally across the whole picture.",
  longDescription:
    "Drop in a photo or a scan, type the text you want stamped across it, and adjust the position, size, opacity, colour, and rotation until it reads the way you want. The tiled option repeats the text diagonally over the entire image, which is the pattern used on copies of identity documents so that a copy sent for one purpose cannot easily be reused for another. Watermarking is drawn onto a canvas in your browser and the result is downloaded straight from it, so the passport scan or unpublished photograph you are protecting is never uploaded to a stranger's server, which would defeat the point of watermarking it.",
  category: "image",
  keywords: [
    "add watermark to image",
    "watermark photo online free",
    "text watermark generator",
    "watermark id document copy",
    "tiled watermark image",
  ],
  tags: ["watermark", "image", "photo", "privacy", "canvas", "copyright"],
  icon: Stamp,
  features: [
    "Nine anchor positions plus a diagonal tiled mode",
    "Adjustable text size, opacity, colour, and rotation",
    "Live preview at full resolution before downloading",
    "Exports PNG or JPEG at the original image dimensions",
    "Runs on a canvas in your browser with no upload",
  ],
  relatedTools: ["exif-remover", "image-compressor", "pdf-watermark"],
  faqs: [
    {
      question: "Why watermark a copy of an ID document?",
      answer:
        "A visible line stating what the copy is for and the date makes it far harder to reuse elsewhere, which is standard advice when sending identity documents to a landlord, bank, or employer. The tiled setting puts that text across the whole page so it cannot be cropped out.",
    },
    {
      question: "Can the watermark be removed from the saved image?",
      answer:
        "The text is drawn permanently into the pixels, so it cannot be toggled off. It can still be edited out by someone determined enough, which is why a tiled watermark that overlaps the important content is harder to defeat than a small mark in one corner.",
    },
    {
      question: "Does the image lose quality?",
      answer:
        "The image is redrawn at its original dimensions, so nothing is resized. Exporting as PNG is lossless. Exporting a photo as JPEG re-encodes it once, which is usually invisible but does not add quality back to an already compressed file.",
    },
    {
      question: "Is the photo uploaded anywhere?",
      answer:
        "No. It is loaded into a canvas element in your browser and the download is generated from that canvas, so the file never leaves your device.",
    },
  ],
}

export default meta
