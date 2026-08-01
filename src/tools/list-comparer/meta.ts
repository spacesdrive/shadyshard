import { GitCompareArrows } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "list-comparer",
  title: "List Comparer",
  description:
    "Compare two lists to find what is only in one, what they share, and the combined set.",
  longDescription:
    "Paste two lists and get four answers at once: the items only in the first, the items only in the second, the items in both, and the two lists merged with duplicates removed. This is set comparison rather than a line-by-line diff, so the order of the items does not matter and a value that moved position is still recognised as present in both. It handles the everyday version of the problem people usually solve with a spreadsheet formula: two email exports, two lists of SKUs, a list of subscribers against a list of customers. Both lists are compared in your browser and never uploaded.",
  category: "text",
  keywords: [
    "compare two lists",
    "list difference tool",
    "find items in one list not the other",
    "compare two columns online",
    "list intersection tool",
  ],
  tags: ["list", "compare", "diff", "set", "duplicates", "intersection", "text"],
  icon: GitCompareArrows,
  isNew: true,
  features: [
    "Shows items only in A, only in B, in both, and the merged set",
    "Line, comma, semicolon, or whitespace separated input",
    "Optional case-insensitive matching and whitespace trimming",
    "Reports how many items each list duplicates within itself",
    "Copy or download any of the four result groups separately",
  ],
  faqs: [
    {
      question: "How is this different from a text diff?",
      answer:
        "A text diff compares line by line and cares about order, so moving one line makes everything below it look changed. This treats each list as a set of values, so it answers which items are present rather than where they sit. If you need to see what changed inside a document, use a diff. If you need to know which addresses are on one list and not the other, use this.",
    },
    {
      question: "What happens to duplicates inside a single list?",
      answer:
        "They are counted and reported under each input box, but each distinct value appears only once in the results. If a value appears three times in list A and once in list B, it shows up once under the items both lists share.",
    },
    {
      question: "Can I paste columns straight out of a spreadsheet?",
      answer:
        "Yes. Copying a column from a spreadsheet puts one value per line on the clipboard, which is the default input format here. If your data came out comma or semicolon separated instead, switch the separator option to match.",
    },
    {
      question: "Are my lists uploaded anywhere?",
      answer:
        "No. Both lists are compared in JavaScript on your device with no network request involved. That matters because the lists people compare are often email addresses, customer identifiers, or account numbers.",
    },
  ],
}

export default meta
