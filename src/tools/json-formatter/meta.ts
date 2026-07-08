import { FileJson } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "json-formatter",
  title: "JSON Formatter",
  description: "Format, validate, and minify JSON with instant error highlighting.",
  longDescription:
    "Paste any JSON to instantly format it with proper indentation, minify it to a single line, or catch syntax errors before they cause problems. Validation runs locally as you type - your JSON data never leaves your browser.",
  category: "developer",
  keywords: [
    "json formatter",
    "json validator",
    "json beautifier",
    "json minifier",
    "format json online",
  ],
  tags: ["json", "developer", "formatter", "validator", "code"],
  icon: FileJson,
  features: [
    "Pretty-print JSON with 2-space indentation",
    "Minify JSON to a single line",
    "Instant syntax error detection",
    "One-click copy to clipboard",
    "Works entirely offline in your browser",
  ],
  faqs: [
    {
      question: "Is my JSON data uploaded anywhere?",
      answer:
        "No. Formatting and validation happen entirely in your browser using native JavaScript JSON parsing. Nothing is sent to a server.",
    },
    {
      question: "What happens if my JSON has a syntax error?",
      answer:
        "The tool shows the parser's error message so you can quickly locate and fix the invalid syntax.",
    },
    {
      question: "Can I use this to minify JSON for production?",
      answer:
        "Yes, the minify option strips all unnecessary whitespace to produce the smallest valid JSON output.",
    },
  ],
  isNew: true,
}

export default meta
