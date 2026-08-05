import { GitCompareArrows } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "csv-diff",
  title: "CSV Diff",
  description:
    "Compare two CSV exports row by row to see which rows were added, removed, and which cells changed.",
  longDescription:
    "A line-by-line text diff is close to useless on a CSV export, because reordering the rows makes every line look changed. This tool compares the data instead: pick a key column such as an id or an email and it matches rows across both files regardless of order, then reports which rows are new, which disappeared, and exactly which cells differ in the rows that survived. Duplicate keys and mismatched headers are reported rather than quietly merged. Both files are parsed in your browser, so customer exports and financial data never leave the machine.",
  category: "developer",
  keywords: [
    "csv diff",
    "compare two csv files",
    "csv comparison tool",
    "find changed rows between exports",
    "csv row difference checker",
  ],
  tags: ["csv", "diff", "compare", "data", "spreadsheet"],
  icon: GitCompareArrows,
  features: [
    "Matches rows by a key column or by position",
    "Separates added, removed, and changed rows",
    "Shows the before and after value of every changed cell",
    "Warns about duplicate keys and mismatched headers",
    "Downloads the full change report as CSV",
  ],
  faqs: [
    {
      question: "Why match by a key column instead of by line?",
      answer:
        "Exports rarely keep their row order, and a re-sorted file compared line by line shows every row as changed. Matching on a stable key such as an id, SKU, or email finds the row in both files wherever it moved to, so only real differences are reported.",
    },
    {
      question: "What happens if the same key appears twice?",
      answer:
        "The tool reports the duplicate keys and compares the first occurrence of each. Fix the duplicates in the source data if the comparison needs to be exact, because there is no reliable way to decide which of two rows with the same key corresponds to which.",
    },
    {
      question: "Can the two files have different columns?",
      answer:
        "Yes. Columns present in only one file are listed as a header mismatch, and cells in those columns are compared against an empty value so the change is still visible.",
    },
    {
      question: "Are my CSV files uploaded?",
      answer:
        "No. Both files are parsed and compared by JavaScript in your browser. Nothing is sent to a server, which is the point when the export contains customer or payroll data.",
    },
  ],
}

export default meta
