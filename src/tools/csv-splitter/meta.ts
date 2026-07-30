import { Split } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "csv-splitter",
  title: "CSV Splitter",
  description:
    "Split a large CSV into smaller files by row count, repeating the header row in every part.",
  longDescription:
    "Drop in a CSV that is too large for the tool you need to feed it to, choose how many rows each part should hold, and download the parts. The header row is repeated in every part by default so each file can be opened on its own. Splitting happens in your browser with no upload step, which matters because the files people need to split are usually customer exports, mailing lists, or transaction records.",
  category: "converters",
  keywords: [
    "csv splitter",
    "split large csv file",
    "split csv by row count",
    "divide csv into smaller files",
    "csv split with header",
  ],
  tags: ["csv", "split", "converter", "spreadsheet", "data", "file"],
  icon: Split,
  features: [
    "Split by rows per file, with the header repeated in every part",
    "Comma, semicolon, and tab delimiters, detected automatically",
    "Row, column, and part counts shown before you download anything",
    "Each part downloadable individually with a predictable file name",
    "Runs entirely in your browser with no upload",
  ],
  faqs: [
    {
      question: "Is my CSV uploaded anywhere?",
      answer:
        "No. The file is read with the browser's File API and split in the page. Nothing is transmitted, which is the reason to use a client-side splitter for exports containing personal data.",
    },
    {
      question: "Does each part keep the column headers?",
      answer:
        "Yes, as long as the header option is on. Every part starts with the same header row, so each file can be imported independently.",
    },
    {
      question: "How large a file can I split?",
      answer:
        "The whole file is held in memory, so the practical limit is your browser and available RAM rather than a fixed number. Files of a few tens of megabytes split comfortably; much larger exports are better handled with a command line tool.",
    },
    {
      question: "Are quoted fields handled correctly?",
      answer:
        "Yes. The parser follows RFC 4180 rules, so quoted fields containing commas, escaped quotes, and line breaks are kept intact rather than split in the middle.",
    },
  ],
  relatedTools: ["csv-to-json", "csv-to-tsv", "json-to-csv"],
}

export default meta
