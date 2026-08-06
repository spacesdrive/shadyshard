import { ListPlus } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "line-prefix-suffix-adder",
  title: "Line Prefix and Suffix Adder",
  description:
    "Add text to the start or end of every line, with optional numbering and blank-line handling.",
  longDescription:
    "Wrapping every line of a list is the kind of edit that is trivial for one line and tedious for two hundred: quoting a column of IDs, turning a list of hostnames into curl commands, prefixing a block with a comment marker, or appending a comma to build an array. Enter a prefix, a suffix, or both and every line gets them. Line numbers can be added with a starting value and zero padding, blank lines can be skipped or removed, and the last line's suffix can be omitted, which is what a trailing comma usually needs. The rewriting happens in your browser, so a list of real account identifiers stays local.",
  category: "text",
  keywords: [
    "add prefix to each line",
    "add suffix to every line",
    "wrap lines with text",
    "add line numbers to text",
    "bulk edit list of lines",
  ],
  tags: ["text", "lines", "prefix", "suffix", "numbering", "bulk edit"],
  icon: ListPlus,
  features: [
    "Prefix, suffix, or both applied to every line",
    "Optional line numbering with a start value and zero padding",
    "Skip blank lines, or remove them entirely",
    "Option to omit the suffix on the last line for trailing separators",
    "Copy or download the rewritten list",
  ],
  faqs: [
    {
      question: "How do I build a quoted, comma separated list?",
      answer:
        "Set the prefix to a double quote and the suffix to a double quote followed by a comma, then turn on omitting the suffix on the last line so the final entry has no trailing comma. Add the closing quote back by hand if you prefer, or leave it as is for languages that allow trailing commas.",
    },
    {
      question: "Can I insert the line number in the middle of the line?",
      answer:
        "Numbering is added before the prefix, so the order is number, prefix, line, suffix. For anything more complex than that, use the Bulk Find and Replace tool with a regular expression.",
    },
    {
      question: "What happens to blank lines?",
      answer:
        "By default they are skipped, so they stay blank rather than becoming a line containing only your prefix and suffix. You can also remove them entirely or treat them like any other line.",
    },
    {
      question: "Does my list get uploaded?",
      answer:
        "No. Every line is rewritten by JavaScript in your browser and nothing is sent anywhere.",
    },
  ],
}

export default meta
