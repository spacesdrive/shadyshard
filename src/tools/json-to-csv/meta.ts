import { FileSpreadsheet } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "json-to-csv",
  title: "JSON to CSV",
  description: "Convert a JSON array of objects into CSV data with a header row.",
  longDescription:
    "Paste a JSON array of flat objects and get CSV data with a header row built from every key seen across all objects. Missing fields in a given object become empty cells. Runs entirely in your browser.",
  category: "converters",
  keywords: [
    "json to csv",
    "convert json to csv",
    "json to csv converter online",
    "json array to spreadsheet",
    "json to csv file",
  ],
  tags: ["json", "csv", "convert", "data"],
  icon: FileSpreadsheet,
  features: [
    "Header row built from the union of every object's keys",
    "Missing fields become empty cells",
    "Copy or download the resulting CSV",
    "Runs entirely offline in your browser",
  ],
  faqs: [
    {
      question: "What if my JSON has nested objects or arrays as values?",
      answer:
        "Nested values are converted to their JSON string representation inside the CSV cell, since CSV has no native way to represent nested structure.",
    },
    {
      question: "Does the input need to be an array?",
      answer:
        "Yes - a single JSON object is wrapped as a one-row CSV automatically, but the input must ultimately resolve to one object or an array of objects.",
    },
  ],
  relatedTools: ["csv-to-json", "csv-to-tsv", "json-formatter"],
  isNew: true,
}

export default meta
