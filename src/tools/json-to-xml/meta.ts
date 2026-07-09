import { Code2 } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "json-to-xml",
  title: "JSON to XML",
  description: "Convert a JSON object into XML markup.",
  longDescription:
    'Paste a JSON object and a root element name, and get the equivalent XML. An "@attributes" key on any object becomes that element\'s attributes, arrays become repeated sibling elements, and everything else becomes nested child elements. Runs entirely in your browser using the native XMLSerializer - no XML library dependency.',
  category: "converters",
  keywords: [
    "json to xml",
    "convert json to xml",
    "json to xml converter online",
    "json to xml generator",
    "javascript object to xml",
  ],
  tags: ["json", "xml", "convert", "data"],
  icon: Code2,
  features: [
    "Set the root element's tag name",
    '"@attributes" keys become XML attributes',
    "Arrays become repeated sibling elements",
    "Runs entirely offline in your browser",
  ],
  faqs: [
    {
      question: "How do I add attributes to an element?",
      answer:
        'Give that level of your JSON object an "@attributes" key whose value is an object of attribute name/value pairs - the same convention this site\'s XML to JSON tool produces, so the two tools round-trip.',
    },
    {
      question: "What if my JSON is just a string or number, not an object?",
      answer: "It becomes the text content of the root element directly.",
    },
  ],
  relatedTools: ["xml-to-json", "json-formatter", "yaml-to-json"],
  isNew: true,
}

export default meta
