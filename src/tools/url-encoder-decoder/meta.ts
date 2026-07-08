import { Link2 } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "url-encoder-decoder",
  title: "URL Encoder & Decoder",
  description:
    "Percent-encode text for safe use in a URL, or decode a percent-encoded string back to plain text.",
  longDescription:
    "Encode text so it's safe to use inside a URL query string or path segment, or decode a percent-encoded URL component back to readable text. Uses the browser's native encodeURIComponent and decodeURIComponent. Everything runs locally.",
  category: "developer",
  keywords: [
    "url encoder",
    "url decoder",
    "percent encoding",
    "encodeuricomponent online",
    "url encode decode",
  ],
  tags: ["url", "encoding", "developer", "converter"],
  icon: Link2,
  features: [
    "Encode and decode in one tool with a tab switch",
    "Uses the standard encodeURIComponent/decodeURIComponent behavior",
    "Inline error message for malformed percent-encoded input",
    "One-click copy of the result",
    "Works entirely offline in your browser",
  ],
  faqs: [
    {
      question: "Does this encode a full URL or just a component?",
      answer:
        "It encodes a single value (like a query parameter) the way encodeURIComponent does, escaping characters such as &, ?, and / that would otherwise be interpreted as URL structure. It is not meant for encoding an entire URL that should keep its scheme and slashes intact.",
    },
    {
      question: "What happens with invalid percent-encoded input when decoding?",
      answer:
        "You'll see an inline error message explaining the input contains a malformed escape sequence, instead of a crash.",
    },
    {
      question: "Is my data sent anywhere?",
      answer:
        "No. Encoding and decoding happen entirely in your browser. Nothing is sent to a server.",
    },
  ],
  relatedTools: ["base64-encoder-decoder", "json-formatter"],
  isNew: true,
}

export default meta
