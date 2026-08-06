import { Columns3 } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "fixed-width-to-csv",
  title: "Fixed Width to CSV Converter",
  description:
    "Split fixed width column data into CSV, TSV, or JSON by column widths you set or it detects.",
  longDescription:
    "Reports out of a mainframe, a banking export, a legacy ERP, or a command line tool arrive as fixed width columns: characters 1 to 10 are the account number, 11 to 30 are the name, and nothing separates them. Paste the text and either type the widths or let the tool find the column boundaries by looking for the character positions that are blank on every row. Each field can be trimmed, the first row can be used as a header, and the output can be CSV, TSV, or JSON objects. Everything is parsed in your browser, which is the point when the report you are converting is a statement or a payroll extract.",
  category: "converters",
  keywords: [
    "fixed width to csv",
    "convert fixed width text file",
    "parse column positions to csv",
    "mainframe report to csv",
    "fixed width parser online",
  ],
  tags: ["fixed width", "csv", "tsv", "json", "converter", "columns"],
  icon: Columns3,
  features: [
    "Automatic column boundary detection from blank character positions",
    "Manual column widths entered as a simple comma separated list",
    "CSV, TSV, and JSON object output",
    "Optional header row and per-field trimming",
    "Live column ruler showing where each field starts",
  ],
  faqs: [
    {
      question: "How does automatic detection work?",
      answer:
        "It looks at every character position across all rows and treats a position that is blank in every row as part of a gap between columns. Each run of such positions becomes a boundary. This works well for reports padded with spaces and less well when a value happens to fill every row's gap, which is when you should enter the widths yourself.",
    },
    {
      question: "How do I enter the widths manually?",
      answer:
        "Type them as a comma separated list, such as 10,20,8,12. The numbers are field widths in characters, not cumulative positions. A final field can be left off the list and it will take whatever remains on the line.",
    },
    {
      question: "What happens to a line shorter than the total width?",
      answer:
        "Missing characters are treated as empty rather than as an error, which is what trailing optional fields in most fixed width formats mean.",
    },
    {
      question: "Is the file I paste uploaded?",
      answer:
        "No. Parsing and CSV generation both happen in your browser. A payroll or statement extract is never transmitted.",
    },
  ],
}

export default meta
