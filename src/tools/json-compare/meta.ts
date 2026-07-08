import { GitCompareArrows } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "json-compare",
  title: "JSON Compare",
  description:
    "Compare two JSON documents and see exactly what was added, removed, and changed.",
  longDescription:
    "Paste two JSON documents to see a field-by-field diff: which keys were added, which were removed, and which values changed, with the old and new value for each. Both documents are parsed and compared entirely in your browser.",
  category: "developer",
  keywords: [
    "json compare",
    "json diff",
    "compare two json",
    "json difference checker",
    "json diff tool",
  ],
  tags: ["json", "developer", "diff", "compare"],
  icon: GitCompareArrows,
  features: [
    "Field-by-field diff of two JSON documents",
    "Clearly labeled added, removed, and changed entries",
    "Shows the old and new value for every change",
    "Reports which side has the syntax error if one is invalid",
    "Works entirely offline in your browser",
  ],
  faqs: [
    {
      question: "How are arrays compared?",
      answer:
        "Array elements are compared by index - the value at index 0 in the first document is compared against index 0 in the second, and so on. A different array length is reported as added or removed entries at the extra indexes.",
    },
    {
      question: "What counts as a changed value?",
      answer:
        "Any key present in both documents whose value differs, whether the type changed (e.g. a number became a string) or the value itself changed.",
    },
    {
      question: "Is my JSON uploaded anywhere?",
      answer:
        "No. Both documents are parsed and compared entirely in your browser. Nothing is sent to a server.",
    },
  ],
  relatedTools: ["json-formatter", "json-validator", "json-minifier"],
  isNew: true,
}

export default meta
