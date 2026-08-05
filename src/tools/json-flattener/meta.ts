import { Braces } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "json-flattener",
  title: "JSON Flattener",
  description:
    "Flatten nested JSON into dot-notation keys, or rebuild the nested structure from flat keys.",
  longDescription:
    "Flat key paths are what translation files, environment configuration, log pipelines, and spreadsheet columns actually want, while the JSON you are handed is nested several levels deep. This tool converts between the two in both directions: flatten to keys such as user.address.city, or paste flat keys and get the nested object back. You choose the separator and whether array items use bracket indexes, and empty objects and arrays are preserved rather than silently disappearing, which is the detail most flatteners get wrong. Parsing and conversion happen in your browser, so configuration files with real values never leave the page.",
  category: "developer",
  keywords: [
    "json flattener",
    "flatten nested json",
    "json to dot notation",
    "unflatten json keys",
    "json key path converter",
  ],
  tags: ["json", "flatten", "dot notation", "config", "i18n"],
  icon: Braces,
  features: [
    "Flatten nested JSON into dot, underscore, or slash separated keys",
    "Unflatten flat keys back into a nested object",
    "Bracket or separator notation for array indexes",
    "Preserves empty objects and empty arrays",
    "Outputs JSON or plain key and value lines",
  ],
  faqs: [
    {
      question: "What happens to arrays when I flatten?",
      answer:
        "Each item gets its own key. With bracket notation on, an item becomes items[0].name; with it off, the index joins the path with the separator, giving items.0.name. Empty arrays are kept as a single key with an empty array as its value.",
    },
    {
      question: "Can I get the nested structure back afterwards?",
      answer:
        "Yes. Switch to unflatten and paste the flat object. Bracket indexes are rebuilt as arrays. Numeric path segments that are not in brackets are treated as object keys, because a key such as 2 is a valid object key and guessing would silently change your data.",
    },
    {
      question: "Which separator should I use?",
      answer:
        "A dot is the usual choice and is what most translation and configuration libraries expect. Use an underscore when the keys become environment variable names, and a slash when they become paths.",
    },
    {
      question: "Is my JSON uploaded anywhere?",
      answer:
        "No. The JSON is parsed and converted by JavaScript running in your browser, and it is discarded when you close the tab.",
    },
  ],
}

export default meta
