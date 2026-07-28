import { Table } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "markdown-table-generator",
  title: "Markdown Table Generator",
  description:
    "Turn pasted CSV, TSV, or spreadsheet cells into a formatted Markdown table.",
  longDescription:
    "Paste rows copied straight out of a spreadsheet, or CSV text, and get a Markdown table with a header separator, per-column alignment, and optional padding so the raw Markdown stays readable. The conversion runs in your browser, so data pasted from an internal sheet never leaves your machine.",
  category: "converters",
  keywords: [
    "markdown table generator",
    "csv to markdown table",
    "excel to markdown",
    "convert spreadsheet to markdown",
  ],
  tags: ["markdown", "table", "csv", "converter", "documentation"],
  icon: Table,
  features: [
    "Accepts CSV, TSV, or cells pasted from a spreadsheet",
    "Per-column left, center, and right alignment",
    "Optional column padding for readable raw Markdown",
    "Escapes pipe characters so cell content cannot break the table",
  ],
  faqs: [
    {
      question: "Can I paste directly from Excel or Google Sheets?",
      answer:
        "Yes. Copied spreadsheet cells arrive as tab-separated text, which the tab delimiter option handles. Leave the delimiter on automatic and it is detected for you.",
    },
    {
      question: "What happens to pipe characters inside a cell?",
      answer:
        "They are escaped as backslash-pipe, which is how Markdown keeps a literal pipe from being read as a column separator.",
    },
    {
      question: "Does the output work in GitHub and GitLab?",
      answer:
        "Yes. The output uses GitHub Flavored Markdown table syntax, which GitHub, GitLab, and most static site generators support.",
    },
  ],
}

export default meta
