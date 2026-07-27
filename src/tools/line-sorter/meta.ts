import { ArrowDownUp } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "line-sorter",
  title: "Line Sorter",
  description:
    "Sort a list of lines alphabetically, numerically, by length, or in random order.",
  longDescription:
    "Paste a list and reorder it: alphabetical either direction, numeric for lists of figures, by line length, reversed, or shuffled. Trimming, case handling, and blank line removal are all optional, and the reordering happens in your browser so nothing is uploaded.",
  category: "text",
  keywords: [
    "sort lines alphabetically",
    "sort list online",
    "shuffle lines",
    "sort text numerically",
  ],
  tags: ["text", "sort", "list", "lines", "shuffle"],
  icon: ArrowDownUp,
  features: [
    "Alphabetical, numeric, length, reverse, and random ordering",
    "Natural sorting that keeps item2 before item10",
    "Optional case-insensitive comparison and whitespace trimming",
    "Optional removal of blank lines before sorting",
  ],
  faqs: [
    {
      question: "How does numeric sorting handle text lines?",
      answer:
        "Lines that start with a number are ordered by that number. Lines with no leading number are kept together at the end in their original order.",
    },
    {
      question: "What is natural sorting?",
      answer:
        "It compares digit sequences by value rather than character by character, so file2 sorts before file10 instead of after it. It is used for alphabetical ordering here.",
    },
    {
      question: "Is the random order suitable for a prize draw?",
      answer:
        "The shuffle is a Fisher-Yates permutation seeded from the browser's cryptographic random number generator, and a fresh seed is drawn each time you shuffle again. That is fair for casual draws, but for anything with legal weight use a process you can audit.",
    },
  ],
  isNew: true,
}

export default meta
