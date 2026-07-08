import { Sparkles } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "svg-optimizer",
  title: "SVG Optimizer",
  description:
    "Strip comments, metadata, and extra whitespace from SVG markup to shrink its file size.",
  longDescription:
    "Paste SVG markup to strip comments, XML declarations, editor metadata, and unnecessary whitespace, with a before/after size comparison. This is a lightweight, browser-only cleanup - not a full geometry-optimizing SVG compressor.",
  category: "image",
  keywords: [
    "svg optimizer",
    "svg minifier",
    "optimize svg online",
    "reduce svg file size",
    "clean svg markup",
  ],
  tags: ["svg", "image", "optimize", "minify"],
  icon: Sparkles,
  features: [
    "Removes comments and XML/DOCTYPE declarations",
    "Removes editor metadata, title, and desc tags",
    "Collapses unnecessary whitespace between tags",
    "Before/after size comparison",
    "Works entirely offline in your browser",
  ],
  faqs: [
    {
      question: "Does this optimize the SVG's path geometry?",
      answer:
        "No. This is a markup-level cleanup (comments, metadata, whitespace) that runs safely in the browser. It doesn't simplify path data or merge shapes the way a full tool like SVGO does.",
    },
    {
      question: "Could removing metadata break my SVG?",
      answer:
        "Removing title/desc tags can reduce accessibility if your SVG relies on them for a screen-reader description - review the output before using it in an accessibility-sensitive context.",
    },
    {
      question: "Is my SVG uploaded anywhere?",
      answer:
        "No. Optimization happens entirely in your browser via text processing. Nothing is sent to a server.",
    },
  ],
  relatedTools: ["image-compressor", "favicon-generator"],
  isNew: true,
}

export default meta
