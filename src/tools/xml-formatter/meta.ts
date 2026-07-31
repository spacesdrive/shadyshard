import { FileCode } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "xml-formatter",
  title: "XML Formatter",
  description:
    "Indent, validate, or minify XML, with parse errors reported in plain language.",
  longDescription:
    "Paste XML from an API response, a configuration file, an RSS feed, or a SOAP envelope and get it back properly indented, or collapsed to a single line. Validation comes first: the document is parsed with the browser's native DOMParser, so a mismatched tag or a stray ampersand is reported before any formatting is attempted rather than producing quietly wrong output. Comments, CDATA sections, processing instructions, and attribute order are all preserved. The document is parsed in your browser, which is worth knowing when the XML is an invoice, an export, or a request body containing real data.",
  category: "developer",
  keywords: [
    "xml formatter",
    "xml beautifier",
    "xml validator online",
    "pretty print xml",
    "minify xml",
  ],
  tags: ["xml", "formatter", "beautifier", "validator", "minify", "pretty print"],
  icon: FileCode,
  isNew: true,
  features: [
    "Formats with 2 space, 4 space, or tab indentation",
    "Minifies XML by removing insignificant whitespace",
    "Validates with the native DOMParser and reports the parse error",
    "Preserves comments, CDATA sections, and the XML declaration",
    "Copy or download the result without uploading anything",
  ],
  faqs: [
    {
      question: "What counts as invalid XML here?",
      answer:
        "Anything the browser's XML parser rejects: unclosed or mismatched tags, more than one root element, an unescaped ampersand or angle bracket in text, or an undefined entity. The parser's own message is shown so you can find the position of the problem.",
    },
    {
      question: "Does formatting change what the XML means?",
      answer:
        "For most documents no, because whitespace between elements is not significant. It can matter in mixed content where text and elements sit side by side inside the same element, so text nodes that contain more than whitespace are left on one line rather than re-wrapped.",
    },
    {
      question: "Will it check my XML against a schema or DTD?",
      answer:
        "No. This checks that the document is well formed, which is a separate question from whether it is valid against an XSD or DTD. Schema validation needs the schema itself and is not something the browser parser performs.",
    },
    {
      question: "Is my XML sent to a server?",
      answer:
        "No. Parsing and formatting both run in your browser using DOMParser, so the document never leaves your machine.",
    },
  ],
}

export default meta
