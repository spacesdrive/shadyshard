import { Pipette } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "image-palette-extractor",
  title: "Image Palette Extractor",
  description:
    "Pull the dominant colors out of any image and copy them as hex codes, CSS custom properties, or JSON.",
  longDescription:
    "Drop in a photo, screenshot, or illustration and the tool samples it on a canvas, groups similar pixels together, and returns the most prominent colors with the share of the image each one covers. Each swatch can be copied on its own, or you can export the whole palette as CSS custom properties or JSON to paste straight into a stylesheet or design token file. The image is processed in your browser and never uploaded.",
  category: "color",
  keywords: [
    "image color palette extractor",
    "get colors from image",
    "dominant color finder",
    "photo color palette generator",
    "hex codes from image",
  ],
  tags: ["color", "palette", "image", "design", "hex"],
  icon: Pipette,
  features: [
    "Extracts between 3 and 12 dominant colors",
    "Shows the coverage share of each color",
    "Copy any swatch as a hex code",
    "Export the palette as CSS custom properties or JSON",
    "Runs on canvas in your browser with no upload",
  ],
  faqs: [
    {
      question: "How are the dominant colors chosen?",
      answer:
        "The image is scaled down, each pixel is grouped into a coarse color bucket, and the largest buckets are kept. The hex code reported for each one is the average of the pixels inside it, so it reflects the real color rather than the bucket edge.",
    },
    {
      question: "Why do some colors look close together?",
      answer:
        "Photographs often contain many shades of the same hue. Lowering the color count merges those shades into fewer, more distinct swatches.",
    },
    {
      question: "Is my image uploaded anywhere?",
      answer:
        "No. The file is read locally with the File API and sampled on a canvas element in your browser.",
    },
  ],
  isNew: true,
}

export default meta
