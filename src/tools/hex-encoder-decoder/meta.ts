import { Binary } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "hex-encoder-decoder",
  title: "HEX Encoder & Decoder",
  description: "Convert text to hexadecimal and back, using UTF-8 byte encoding.",
  longDescription:
    "Encode text to its hexadecimal byte representation, or decode a hex string back to text. Uses UTF-8 encoding via TextEncoder/TextDecoder, so it correctly round-trips any Unicode text, not just ASCII. Runs entirely in your browser.",
  category: "developer",
  keywords: [
    "hex encoder",
    "hex decoder",
    "text to hex",
    "hex to text",
    "hexadecimal converter online",
  ],
  tags: ["hex", "hexadecimal", "encode", "decode"],
  icon: Binary,
  features: [
    "Encode text to hex or decode hex back to text",
    "Correct UTF-8 handling for non-ASCII text",
    "Accepts hex with or without spaces between bytes",
    "Runs entirely offline in your browser",
  ],
  faqs: [
    {
      question: "Does this handle emoji and non-English text correctly?",
      answer:
        "Yes. Text is encoded as UTF-8 bytes before converting to hex, so multi-byte characters round-trip correctly rather than being mangled the way naive character-code hex conversion would.",
    },
    {
      question: "What hex formats does the decoder accept?",
      answer:
        'Hex digits with or without spaces between byte pairs ("48656c6c6f" or "48 65 6c 6c 6f" both work). An odd number of hex digits is rejected as invalid.',
    },
  ],
  relatedTools: ["binary-converter", "base64-encoder-decoder", "url-encoder-decoder"],
  isNew: true,
}

export default meta
