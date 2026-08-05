import { Table2 } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "html-table-converter",
  title: "HTML Table to CSV, JSON, and Markdown",
  description:
    "Paste HTML and pull every table out of it as CSV, TSV, JSON, or a Markdown table.",
  longDescription:
    "Copying a table out of a web page usually means fighting with merged cells, nested markup, and stray whitespace. This tool parses the HTML you paste, expands every colspan and rowspan into a proper rectangular grid, and hands back clean CSV, TSV, JSON, or Markdown. If the page contains several tables you can pick which one to convert. The HTML is parsed with the browser's own parser in an inert document, so scripts in the markup never run and nothing is uploaded.",
  category: "converters",
  keywords: [
    "html table to csv",
    "html table to json",
    "convert html table to markdown",
    "extract table from html",
    "scrape table into excel",
  ],
  tags: ["html", "table", "csv", "json", "markdown"],
  icon: Table2,
  features: [
    "Handles colspan and rowspan by expanding merged cells into a full grid",
    "Picks any table when the pasted markup contains several",
    "Exports as CSV, TSV, JSON objects, JSON rows, or a Markdown table",
    "Optional header row detection and merged-cell value repeating",
    "Copy or download the result, all parsed locally in your browser",
  ],
  faqs: [
    {
      question: "How are merged cells handled?",
      answer:
        "A cell spanning several columns or rows is expanded so the grid stays rectangular. By default the merged value is repeated into every position it covers, which is what spreadsheets expect. Turn that off to leave the extra positions empty instead.",
    },
    {
      question: "Can I paste a whole web page rather than just the table?",
      answer:
        "Yes. Paste the full HTML source and the tool lists every table it finds so you can choose the one you want. Only the table you pick is converted.",
    },
    {
      question: "Is the HTML I paste safe to process here?",
      answer:
        "Yes. The markup is parsed into an inert document with the browser's DOMParser, which does not execute scripts or load images, and only the text of each cell is read. Nothing is rendered and nothing leaves your browser.",
    },
    {
      question: "Why does my table lose formatting like links and bold text?",
      answer:
        "The output formats are plain data, so only the text of each cell is kept. A cell containing a link becomes the link's visible text, not the URL.",
    },
  ],
}

export default meta
