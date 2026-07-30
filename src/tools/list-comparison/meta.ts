import { ListChecks } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "list-comparison",
  title: "List Comparison",
  description:
    "Compare two lists to find items only in A, only in B, in both, or in either.",
  longDescription:
    "Two exports that should match rarely do, and finding out which rows are missing usually means writing a spreadsheet formula for a question that takes one second to state. Paste two lists and get four answers at once: what is only in the first, only in the second, in both, and the combined set. Comparison can ignore case and surrounding whitespace, and duplicates within a list are reported separately, since a duplicate is often the actual problem rather than a difference between the lists. This is a set comparison, not a line diff: order does not matter, which is what makes it the right tool for two exports of the same data. Everything is compared in your browser.",
  category: "text",
  keywords: [
    "compare two lists",
    "find differences between lists",
    "list intersection online",
    "items in one list but not the other",
    "compare email lists",
  ],
  tags: ["compare", "list", "diff", "set", "intersection", "duplicates"],
  icon: ListChecks,
  features: [
    "Only in A, only in B, in both, and the combined set, all at once",
    "Optional case-insensitive and whitespace-trimming comparison",
    "Reports duplicates found within each list",
    "Copy or download any result set individually",
    "Compares locally, so customer and member lists are never uploaded",
  ],
  faqs: [
    {
      question: "How is this different from a text diff?",
      answer:
        "A text diff compares line by line in order, so moving one line makes everything after it look changed. This compares the two lists as sets, so order is irrelevant and the answer is about membership rather than position.",
    },
    {
      question: "What happens to duplicate entries?",
      answer:
        "Each result set lists every distinct value once. Duplicates within a list are counted and reported on their own, so you can tell the difference between a value appearing in both lists and a value appearing twice in one of them.",
    },
    {
      question: "Can I compare lists that use commas rather than line breaks?",
      answer:
        "Split them onto separate lines first with the List Delimiter Converter, then paste the result here. Keeping the separator fixed at a line break avoids guessing wrong on entries that legitimately contain a comma.",
    },
    {
      question: "Is my data uploaded to compare it?",
      answer:
        "No. Both lists stay in the page and the comparison runs in your browser, which matters when the lists are customer emails, order numbers, or member records.",
    },
  ],
  relatedTools: ["list-delimiter-converter", "text-diff", "remove-duplicate-lines"],
}

export default meta
