import { FileCode2 } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "yaml-to-json",
  title: "YAML to JSON",
  description: "Convert YAML into equivalent JSON.",
  longDescription:
    "Paste YAML - configuration files, Kubernetes manifests, CI pipeline definitions - and get the equivalent JSON. Useful when a tool only accepts JSON but your source of truth is YAML. Runs entirely in your browser using js-yaml.",
  category: "converters",
  keywords: [
    "yaml to json",
    "convert yaml to json",
    "yaml to json converter online",
    "yaml parser",
    "yml to json",
  ],
  tags: ["yaml", "json", "convert", "data"],
  icon: FileCode2,
  features: [
    "Supports standard YAML syntax including anchors and multi-document markers",
    "Live conversion as you type",
    "Copy or download the resulting JSON",
    "Runs entirely offline in your browser",
  ],
  faqs: [
    {
      question: "Does this support multiple YAML documents in one input?",
      answer:
        "Only the first document (before a --- separator) is converted. For a single config file, this is rarely a concern.",
    },
    {
      question: "Why did my YAML fail to parse?",
      answer:
        "YAML is indentation-sensitive - the most common cause is mixing tabs and spaces, or inconsistent indentation between sibling keys. The error message includes the line number where parsing failed.",
    },
  ],
  relatedTools: ["json-to-yaml", "json-formatter", "xml-to-json"],
  isNew: true,
}

export default meta
