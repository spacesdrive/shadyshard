import { CheckCircle2 } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "json-validator",
  title: "JSON Validator",
  description:
    "Check whether JSON is valid, with a clear pass or fail result and the exact parse error.",
  longDescription:
    "Paste JSON to instantly see whether it's valid, along with a summary of what it parses to (object, array, or primitive, and its size). If it's invalid, you get the parser's exact error message so you can find and fix the problem. Validation runs locally as you type.",
  category: "developer",
  keywords: [
    "json validator",
    "validate json online",
    "is this json valid",
    "json syntax checker",
    "check json",
  ],
  tags: ["json", "developer", "validator", "syntax"],
  icon: CheckCircle2,
  features: [
    "Clear valid/invalid result as you type",
    "Exact parser error message and location when invalid",
    "Summary of the parsed type and size when valid",
    "No formatting or transformation - validation only",
    "Works entirely offline in your browser",
  ],
  faqs: [
    {
      question: "How is this different from the JSON Formatter?",
      answer:
        "The JSON Formatter is for reformatting valid JSON. This tool is focused purely on answering one question: is this JSON syntactically valid, and if not, exactly what's wrong with it.",
    },
    {
      question: "Does this check my JSON against a schema?",
      answer:
        "No, this checks JSON syntax validity only (that it parses correctly), not whether it matches a particular schema or shape.",
    },
    {
      question: "Is my JSON uploaded anywhere?",
      answer:
        "No. Validation happens entirely in your browser using native JSON parsing. Nothing is sent to a server.",
    },
  ],
  relatedTools: ["json-formatter", "json-minifier", "json-compare"],
  isNew: true,
}

export default meta
