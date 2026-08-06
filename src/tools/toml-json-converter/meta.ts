import { FileCode2 } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "toml-json-converter",
  title: "TOML to JSON Converter",
  description:
    "Convert TOML configuration to JSON and back, with dates, tables, and arrays of tables handled correctly.",
  longDescription:
    "Paste a Cargo.toml, a pyproject.toml, a Hugo or Netlify config, or any other TOML document and get the equivalent JSON, or go the other way and turn JSON into TOML. Nested tables, arrays of tables, inline tables, and TOML's own date and time types are all handled rather than flattened, and a syntax error is reported with the line it came from instead of an empty output box. Conversion runs entirely in your browser, which matters because configuration files are exactly the kind of thing that ends up carrying a registry token or an internal hostname.",
  category: "converters",
  keywords: [
    "toml to json converter",
    "json to toml",
    "convert cargo.toml to json",
    "pyproject.toml converter",
    "toml parser online",
  ],
  tags: ["toml", "json", "config", "converter", "cargo", "pyproject"],
  icon: FileCode2,
  features: [
    "Converts in both directions between TOML and JSON",
    "Handles nested tables, arrays of tables, and inline tables",
    "Preserves TOML date, time, and date-time values as ISO strings",
    "Reports syntax errors with the position they occurred at",
    "Copy or download the converted output",
  ],
  faqs: [
    {
      question: "Which version of TOML is supported?",
      answer:
        "TOML 1.0 in full, plus the additions in the 1.1 draft. That covers every construct you will meet in a Cargo.toml or a pyproject.toml.",
    },
    {
      question: "What happens to TOML dates when converting to JSON?",
      answer:
        "JSON has no date type, so offset date-times, local date-times, local dates, and local times all become ISO 8601 strings. Converting that JSON back to TOML produces strings rather than the original date types, since nothing in the JSON marks them as dates.",
    },
    {
      question: "Why does my JSON fail to convert to TOML?",
      answer:
        "TOML cannot represent a null value or a top-level array, and every key has to be a string. If your JSON contains any of those, the error message names the problem so you can adjust the document rather than guess.",
    },
    {
      question: "Is my configuration file uploaded?",
      answer:
        "No. Parsing and serialising both happen in your browser. A config file containing an API token or an internal URL never leaves your machine.",
    },
  ],
  isNew: true,
}

export default meta
