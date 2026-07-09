import { Link2 } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "url-parser",
  title: "URL Parser",
  description:
    "Break a URL down into its protocol, host, path, query parameters, and hash.",
  longDescription:
    "Paste a URL to see it decomposed into protocol, hostname, port, path, every query parameter as a separate row, and the hash fragment. Unlike the URL Encoder & Decoder, which percent-encodes or decodes a string, this tool parses a URL's actual structure. Runs entirely in your browser using the native URL API.",
  category: "developer",
  keywords: [
    "url parser",
    "parse url online",
    "url structure breakdown",
    "query string parser",
    "url components",
  ],
  tags: ["url", "parse", "query string", "developer"],
  icon: Link2,
  features: [
    "Breaks a URL into protocol, host, port, path, and hash",
    "Lists every query parameter as a separate row",
    "Uses the browser's native, spec-compliant URL parser",
    "Runs entirely offline in your browser",
  ],
  faqs: [
    {
      question: "How is this different from the URL Encoder & Decoder?",
      answer:
        "URL Encoder & Decoder percent-encodes or decodes a string. URL Parser takes a complete URL and breaks it into its structural parts - protocol, host, path, query parameters, hash - rather than encoding or decoding anything.",
    },
    {
      question: "What happens if I paste an invalid URL?",
      answer:
        "The tool reports that the URL couldn't be parsed, using the same validation the browser itself uses for links.",
    },
  ],
  relatedTools: ["url-encoder-decoder", "user-agent-parser", "meta-tag-generator"],
  isNew: true,
}

export default meta
