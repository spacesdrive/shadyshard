import { Minimize2 } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "json-minifier",
  title: "JSON Minifier",
  description:
    "Strip all unnecessary whitespace from JSON and see exactly how many bytes you saved.",
  longDescription:
    "Paste JSON to instantly minify it to a single line with no extra whitespace, and see the size reduction in bytes and percentage. Useful for shrinking JSON before storing or transmitting it. Everything runs locally in your browser.",
  category: "developer",
  keywords: [
    "json minifier",
    "minify json online",
    "json compressor",
    "reduce json size",
    "json whitespace remover",
  ],
  tags: ["json", "developer", "minifier", "compression"],
  icon: Minimize2,
  features: [
    "One-click minification to a single line",
    "Before/after size comparison with percentage saved",
    "Inline error message for invalid JSON",
    "One-click copy of the minified result",
    "Works entirely offline in your browser",
  ],
  faqs: [
    {
      question: "How is this different from the JSON Formatter's minify option?",
      answer:
        "This tool is focused entirely on minification and shows exactly how many bytes and what percentage you saved, which the general-purpose Formatter doesn't display.",
    },
    {
      question: "Does minifying change the data?",
      answer:
        "No. Minifying only removes whitespace between tokens - the parsed value is identical before and after.",
    },
    {
      question: "Is my JSON uploaded anywhere?",
      answer:
        "No. Minification happens entirely in your browser using native JSON parsing. Nothing is sent to a server.",
    },
  ],
  relatedTools: ["json-formatter", "json-validator", "json-compare"],
  isNew: true,
}

export default meta
