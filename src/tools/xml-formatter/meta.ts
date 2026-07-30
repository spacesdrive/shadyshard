import { FileCode2 } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "xml-formatter",
  title: "XML Formatter",
  description: "Indent, minify, and validate XML with the exact parse error location.",
  longDescription:
    "Paste XML from an API response, a configuration file, an RSS feed, or a SOAP envelope and get it back indented and readable, or collapsed onto one line for embedding. Parsing uses the browser's own DOMParser, so what you see reported is the same well-formedness check the browser applies, and a malformed document produces the parser's own message rather than a vague failure. Comments, CDATA sections, processing instructions, and the XML declaration are all preserved. Everything runs locally in your browser.",
  category: "developer",
  keywords: [
    "xml formatter",
    "xml beautifier online",
    "pretty print xml",
    "minify xml",
    "xml validator",
  ],
  tags: ["xml", "format", "beautify", "minify", "validate", "pretty print"],
  icon: FileCode2,
  features: [
    "Indent with two spaces, four spaces, or tabs",
    "Minify to a single line for embedding in code",
    "Well-formedness check with the browser parser's own error message",
    "Preserves comments, CDATA, processing instructions, and the XML declaration",
    "Element count and before-and-after byte size",
  ],
  faqs: [
    {
      question: "Does this validate XML against a schema?",
      answer:
        "No. It checks that the document is well formed, meaning tags are balanced, attributes are quoted, and entities are valid. Checking a document against an XSD or DTD needs a validating parser, which browsers do not provide.",
    },
    {
      question: "Will formatting change what my XML means?",
      answer:
        "Indenting adds whitespace between elements, which is significant in some documents. Elements whose content is only text are left on one line so their values are never altered, but if your consumer treats whitespace between elements as data, use the minify option instead.",
    },
    {
      question: "Is my XML sent to a server?",
      answer:
        "No. Parsing and formatting both happen in your browser with DOMParser, so configuration files and API responses containing internal details stay on your machine.",
    },
    {
      question: "Why does my HTML fail to parse here?",
      answer:
        "XML is stricter than HTML. Unclosed tags such as a bare img or br, unquoted attribute values, and bare ampersands are all valid HTML but not well-formed XML, so the parser rejects them.",
    },
  ],
}

export default meta
