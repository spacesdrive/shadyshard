import { FileJson2 } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "jsonl-converter",
  title: "JSONL to JSON Converter",
  description:
    "Convert JSON Lines to a JSON array and back, with per-line validation that names the failing line.",
  longDescription:
    "JSON Lines, also written JSONL or NDJSON, is what most log pipelines, bulk export endpoints, and machine learning datasets emit: one self-contained JSON object per line. This converter turns that into a normal JSON array so it can be opened in an editor or fed to a tool that expects one document, and converts an array back to JSON Lines for streaming. Every line is validated separately, so a single malformed record is reported by line number instead of failing the whole file. The conversion runs in your browser, so exported records stay local.",
  category: "developer",
  keywords: [
    "jsonl to json",
    "ndjson converter",
    "json lines converter",
    "json to jsonl",
    "convert ndjson to json array",
  ],
  tags: ["json", "jsonl", "ndjson", "converter", "developer", "data"],
  icon: FileJson2,
  isNew: true,
  features: [
    "Convert JSON Lines to a JSON array and an array back to JSON Lines",
    "Per-line validation reporting the line number and the parse error",
    "Blank lines skipped so trailing newlines do not break the parse",
    "Record count and invalid line count shown as you type",
    "Copy or download the result as .json or .jsonl",
  ],
  faqs: [
    {
      question: "What is the difference between JSONL, NDJSON, and JSON Lines?",
      answer:
        "They are three names for the same format: one complete JSON value per line, separated by newlines, with no surrounding array brackets or commas. This tool treats them identically.",
    },
    {
      question: "Why use JSON Lines instead of a JSON array?",
      answer:
        "A JSON array has to be parsed as one document, so a large file must fit in memory. JSON Lines can be appended to and read one record at a time, which is why logs and bulk exports use it.",
    },
    {
      question: "What happens to a malformed line?",
      answer:
        "It is reported with its line number and the parser's message, and the remaining valid lines are still converted. That makes it practical to find the one bad record in a large export.",
    },
    {
      question: "How large a file can it handle?",
      answer:
        "The limit is your browser's memory, since everything is held in the page. Files of a few tens of megabytes are usually fine; multi-gigabyte exports should be processed with a streaming command line tool instead.",
    },
  ],
  relatedTools: ["json-formatter", "json-validator", "json-to-csv"],
}

export default meta
