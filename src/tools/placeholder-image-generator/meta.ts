import { ImagePlus } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "placeholder-image-generator",
  title: "Placeholder Image Generator",
  description:
    "Create a placeholder image at any size and colour, as a downloadable PNG, JPEG, WebP, or inline SVG.",
  longDescription:
    "Set a width and height, pick the colours, and get a placeholder image with its dimensions written across it. The usual alternative is a hosted placeholder service reached by URL, which means a mockup only renders while that third-party service is online and reachable, and every page view of your prototype is a request logged by someone else. Generating the file here avoids both: the image is drawn on a canvas in your browser and downloaded to your machine, so it keeps working offline and in a repository. The SVG option produces markup a few hundred bytes long that can be pasted straight into a component instead of shipping a binary at all.",
  category: "image",
  keywords: [
    "placeholder image generator",
    "dummy image generator",
    "create placeholder png",
    "svg placeholder generator",
    "mockup placeholder image offline",
  ],
  tags: ["placeholder", "dummy", "mockup", "image", "svg", "prototype", "canvas"],
  icon: ImagePlus,
  features: [
    "Any size up to 4000 by 4000 pixels, with common presets",
    "Custom background colour, text colour, and label",
    "Exports PNG, JPEG, WebP, or copy-ready inline SVG",
    "Live preview that matches the exported file",
    "Generated locally, so mockups keep working offline",
  ],
  relatedTools: ["image-resizer", "aspect-ratio-calculator", "svg-optimizer"],
  faqs: [
    {
      question: "Why generate a placeholder file instead of using a placeholder URL?",
      answer:
        "A hosted placeholder URL breaks the moment the service is down, blocked, or retired, and it leaks a request for every render of your prototype. A generated file lives in your project, works offline, and keeps rendering years later.",
    },
    {
      question: "When should I choose the SVG output?",
      answer:
        "Whenever the placeholder is flat colour and text, which is all of them. The SVG is a few hundred bytes, scales to any size without blurring, and can be pasted inline into a component so there is no extra file to manage at all.",
    },
    {
      question: "What size should a placeholder be?",
      answer:
        "Match the aspect ratio the real image will use, since that is what affects your layout. The presets cover common cases: a 16 by 9 hero, a square avatar or product tile, and the 1200 by 630 size used for social sharing previews.",
    },
    {
      question: "Is anything sent to a server?",
      answer:
        "No. The image is drawn on a canvas element in your browser and downloaded directly from it, with no network request involved.",
    },
  ],
}

export default meta
