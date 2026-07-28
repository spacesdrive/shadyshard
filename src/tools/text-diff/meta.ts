import { GitCompareArrows } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "text-diff",
  title: "Text Diff Checker",
  description:
    "Compare two blocks of text line by line and see exactly what was added, removed, or changed.",
  longDescription:
    "Paste an original and a revised version of any text to get a line by line comparison, with changed lines broken down further to highlight the individual words that differ. Switch between a side by side view for reading and a unified view for sharing, ignore case or trailing whitespace when those differences do not matter, and copy or download the result as a standard unified diff. The comparison uses a longest common subsequence match, so unchanged blocks stay aligned instead of everything after an inserted line being reported as changed. The whole comparison runs in your browser, which matters when the text is a contract, a configuration file, or production code that should not be pasted into a service that stores it.",
  category: "text",
  keywords: [
    "text diff checker",
    "compare two texts online",
    "find differences between text",
    "unified diff generator",
    "private diff tool",
  ],
  tags: ["text", "diff", "compare", "changes", "revision", "merge"],
  icon: GitCompareArrows,
  features: [
    "Line by line comparison with word level highlighting inside changed lines",
    "Side by side and unified views",
    "Options to ignore case, leading and trailing whitespace, or blank lines",
    "Counts of added, removed, and unchanged lines",
    "Copy or download the result as a standard unified diff",
    "Nothing is uploaded, so confidential text stays on your device",
  ],
  faqs: [
    {
      question: "How does the comparison decide which lines match?",
      answer:
        "It computes a longest common subsequence over the lines of both texts, which is the same approach the standard diff utility uses. That keeps unchanged blocks aligned, so inserting one line near the top does not report every line below it as changed.",
    },
    {
      question: "Is my text sent to a server?",
      answer:
        "No. Both texts are compared by JavaScript running in your browser, and neither the input nor the result is uploaded or saved anywhere. Nothing persists once you close the page.",
    },
    {
      question: "What does the unified diff output do?",
      answer:
        "It produces the same format that patch tools and code review systems read, with a line of context around each change, so you can paste the result into a ticket or apply it with a patch tool.",
    },
    {
      question: "Can it compare JSON or code?",
      answer:
        "Yes, both are just text here, and the word level highlighting makes small edits easy to spot. If you want a structural comparison of JSON that matches keys regardless of formatting or key order, use the JSON Compare tool instead.",
    },
  ],
  relatedTools: ["json-compare", "remove-duplicate-lines", "word-counter"],
}

export default meta
