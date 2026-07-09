import { Table2 } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "tsv-to-csv",
  title: "TSV to CSV",
  description: "Convert tab-separated data (TSV) into comma-separated CSV.",
  longDescription:
    "Paste tab-separated values, commonly produced by copying a range out of a spreadsheet, and get properly quoted comma-separated CSV. Fields that already contain a comma are automatically quoted so the conversion round-trips correctly. Runs entirely in your browser.",
  category: "converters",
  keywords: [
    "tsv to csv",
    "tab separated to comma separated",
    "convert tsv to csv online",
    "tsv csv converter",
    "spreadsheet tsv to csv",
  ],
  tags: ["tsv", "csv", "convert", "data"],
  icon: Table2,
  features: [
    "Converts tab delimiters to comma delimiters",
    "Automatically quotes fields containing commas",
    "Copy or download the resulting CSV",
    "Runs entirely offline in your browser",
  ],
  faqs: [
    {
      question: "Where does TSV data usually come from?",
      answer:
        "Pasting a cell range copied from Excel, Google Sheets, or a similar spreadsheet app onto the clipboard typically produces tab-separated data - that's the most common source.",
    },
  ],
  relatedTools: ["csv-to-tsv", "csv-to-json", "json-to-csv"],
  isNew: true,
}

export default meta
