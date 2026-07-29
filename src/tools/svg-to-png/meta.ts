import { FileImage } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "svg-to-png",
  title: "SVG to PNG Converter",
  description:
    "Rasterize an SVG file or pasted markup into a PNG at any width, with an optional background color.",
  longDescription:
    "Upload an .svg file or paste the markup directly, choose the output width, and the tool rasterizes it through a canvas at that exact size. Because SVG is resolution independent, exporting at two or three times the display size gives a crisp result on high density screens, and the height follows the source aspect ratio automatically. PNG supports transparency, so the background stays clear unless you set a color. The file is rendered in your browser and never uploaded.",
  category: "image",
  keywords: [
    "svg to png converter",
    "rasterize svg",
    "export svg as png",
    "svg to image high resolution",
    "convert svg markup to png",
  ],
  tags: ["svg", "png", "image", "converter", "raster"],
  icon: FileImage,
  features: [
    "Accepts an uploaded .svg file or pasted markup",
    "Choose any output width, height follows the aspect ratio",
    "Transparent by default, with an optional background color",
    "Live preview before download",
    "Renders on canvas in your browser with no upload",
  ],
  faqs: [
    {
      question: "What width should I export at?",
      answer:
        "Pick the size the image will be displayed at, then multiply by two or three for high density screens. An icon shown at 48px is usually exported at 96px or 144px.",
    },
    {
      question: "Why does my SVG render without its fonts?",
      answer:
        "A canvas rasterizes the SVG in an isolated context that cannot reach fonts or images loaded from elsewhere. Convert text to paths in your vector editor before exporting, or inline the font as a data URI in the SVG.",
    },
    {
      question: "Does the converter keep transparency?",
      answer:
        "Yes. PNG supports an alpha channel, so anything transparent in the SVG stays transparent unless you choose a background color.",
    },
    {
      question: "Is my SVG uploaded to a server?",
      answer:
        "No. The markup is turned into a blob URL, drawn onto a canvas, and encoded to PNG entirely inside your browser.",
    },
  ],
}

export default meta
