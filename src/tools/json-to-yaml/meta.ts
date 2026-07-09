import { FileCog } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "json-to-yaml",
  title: "JSON to YAML",
  description: "Convert JSON into equivalent YAML.",
  longDescription:
    "Paste JSON and get the equivalent YAML, useful for turning an API response or config object into a more human-readable YAML file. Runs entirely in your browser using js-yaml.",
  category: "converters",
  keywords: [
    "json to yaml",
    "convert json to yaml",
    "json to yaml converter online",
    "json to yml",
    "json config to yaml",
  ],
  tags: ["json", "yaml", "convert", "data"],
  icon: FileCog,
  features: [
    "Live conversion as you type",
    "Produces clean, readable YAML indentation",
    "Copy or download the resulting YAML",
    "Runs entirely offline in your browser",
  ],
  faqs: [
    {
      question: "Does the resulting YAML preserve key order?",
      answer: "Yes, keys appear in the same order as they do in the source JSON object.",
    },
  ],
  relatedTools: ["yaml-to-json", "json-formatter", "json-to-xml"],
  isNew: true,
}

export default meta
