import { ListX } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "remove-duplicate-lines",
  title: "Remove Duplicate Lines",
  description:
    "Remove duplicate lines from a list, with options for case sensitivity and trimming.",
  longDescription:
    "Paste a list of lines to instantly get a de-duplicated version, keeping the first occurrence of each line. Options let you ignore case and trim whitespace before comparing. Everything runs locally in your browser.",
  category: "text",
  keywords: [
    "remove duplicate lines",
    "delete duplicate lines online",
    "unique lines tool",
    "deduplicate list",
    "remove duplicates from text",
  ],
  tags: ["text", "duplicates", "lines", "list"],
  icon: ListX,
  features: [
    "Keeps the first occurrence of each line",
    "Optional case-insensitive comparison",
    "Optional whitespace trimming before comparing",
    "Shows how many duplicate lines were removed",
    "Works entirely offline in your browser",
  ],
  faqs: [
    {
      question: "Does it also remove empty lines?",
      answer:
        "No, empty lines are preserved as-is unless they're duplicates of each other, in which case only the first empty line is kept.",
    },
    {
      question: "Does it change the order of the remaining lines?",
      answer:
        "No, the original order is preserved - only later duplicates of a line already seen are removed.",
    },
    {
      question: "Is my text sent anywhere?",
      answer:
        "No. De-duplication happens entirely in your browser. Nothing is sent to a server.",
    },
  ],
  relatedTools: ["word-counter", "case-converter"],
  isNew: true,
}

export default meta
