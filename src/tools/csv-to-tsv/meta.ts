import { Table } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "csv-to-tsv",
  title: "CSV to TSV",
  description: "Convert comma-separated CSV into tab-separated TSV data.",
  longDescription:
    "Paste CSV data and get tab-separated output, ready to paste directly into a spreadsheet app as separate cells. Quoted fields are unquoted since tab-separated data rarely needs quoting. Runs entirely in your browser.",
  category: "converters",
  keywords: [
    "csv to tsv",
    "comma separated to tab separated",
    "convert csv to tsv online",
    "csv tsv converter",
    "csv to spreadsheet paste",
  ],
  tags: ["csv", "tsv", "convert", "data"],
  icon: Table,
  features: [
    "Converts comma delimiters to tab delimiters",
    "Output pastes directly into spreadsheet cells",
    "Copy or download the resulting TSV",
    "Runs entirely offline in your browser",
  ],
  faqs: [
    {
      question: "Why convert to TSV instead of just pasting the CSV?",
      answer:
        "Pasting raw CSV into a spreadsheet often puts the entire row into a single cell. Tab-separated data is what spreadsheet apps expect on paste to split content across columns automatically.",
    },
  ],
  relatedTools: ["tsv-to-csv", "csv-to-json", "json-to-csv"],
  isNew: true,
}

export default meta
