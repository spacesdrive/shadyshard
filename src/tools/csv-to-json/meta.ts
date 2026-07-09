import { FileJson2 } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "csv-to-json",
  title: "CSV to JSON",
  description:
    "Convert CSV data into a JSON array of objects, using the header row as keys.",
  longDescription:
    "Paste CSV data and get a JSON array where each row becomes an object keyed by the header row's column names. Handles quoted fields, embedded commas, and escaped quotes per standard CSV rules. Runs entirely in your browser.",
  category: "converters",
  keywords: [
    "csv to json",
    "convert csv to json",
    "csv to json converter online",
    "csv parser",
    "csv to json array",
  ],
  tags: ["csv", "json", "convert", "data"],
  icon: FileJson2,
  features: [
    "First row is treated as column headers",
    "Handles quoted fields and embedded commas correctly",
    "Copy or download the resulting JSON",
    "Runs entirely offline in your browser",
  ],
  faqs: [
    {
      question: "What if my CSV doesn't have a header row?",
      answer:
        "This tool always treats the first row as headers. If your data has no header row, add one manually before pasting, or the first data row will be used as keys.",
    },
    {
      question: "Are all values converted to strings?",
      answer:
        "Yes, every field is output as a JSON string exactly as it appeared in the CSV, since CSV itself has no type information to distinguish a number from text that looks like one.",
    },
  ],
  relatedTools: ["json-to-csv", "tsv-to-csv", "json-formatter"],
  isNew: true,
}

export default meta
