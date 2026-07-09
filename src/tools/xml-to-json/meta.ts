import { Braces } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "xml-to-json",
  title: "XML to JSON",
  description: "Convert XML markup into an equivalent JSON structure.",
  longDescription:
    'Paste XML and get the equivalent JSON: attributes become an "@attributes" object, repeated child tags become arrays, and leaf elements with only text become plain string values. Runs entirely in your browser using the native DOMParser - no XML library dependency.',
  category: "converters",
  keywords: [
    "xml to json",
    "convert xml to json",
    "xml to json converter online",
    "xml parser",
    "xml to javascript object",
  ],
  tags: ["xml", "json", "convert", "data"],
  icon: Braces,
  features: [
    "Converts attributes, text, and nested elements",
    "Repeated child tags become JSON arrays",
    "Copy or download the resulting JSON",
    "Runs entirely offline in your browser",
  ],
  faqs: [
    {
      question: "How are XML attributes represented in the JSON?",
      answer:
        'Under an "@attributes" object on that element\'s JSON representation, separate from its text content or child elements.',
    },
    {
      question: "What happens to XML comments or processing instructions?",
      answer:
        "They're dropped - only element structure, attributes, and text content convert.",
    },
  ],
  relatedTools: ["json-to-xml", "csv-to-json", "yaml-to-json"],
  isNew: true,
}

export default meta
