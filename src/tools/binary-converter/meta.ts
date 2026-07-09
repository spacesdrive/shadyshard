import { Binary as BinaryIcon } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "binary-converter",
  title: "Binary Converter",
  description: "Convert text to binary (0s and 1s) and back, using UTF-8 byte encoding.",
  longDescription:
    "Encode text into its binary representation (8-bit groups per byte, space-separated), or decode binary back to text. Uses UTF-8 encoding, so it correctly round-trips any Unicode text. Runs entirely in your browser.",
  category: "developer",
  keywords: [
    "binary converter",
    "text to binary",
    "binary to text",
    "convert text to 0s and 1s",
    "binary code translator",
  ],
  tags: ["binary", "encode", "decode", "convert"],
  icon: BinaryIcon,
  features: [
    "Encode text to space-separated 8-bit binary groups",
    "Decode binary back to text",
    "Correct UTF-8 handling for non-ASCII text",
    "Runs entirely offline in your browser",
  ],
  faqs: [
    {
      question: "What format does the binary output use?",
      answer:
        'Each byte as an 8-digit binary group (for example "01001000"), separated by spaces - one group per UTF-8 byte of the input text.',
    },
    {
      question: "Can I decode binary without spaces between bytes?",
      answer:
        "Yes, as long as the total length is a multiple of 8 - the decoder splits it into 8-bit groups automatically whether or not spaces are present.",
    },
  ],
  relatedTools: ["hex-encoder-decoder", "base64-encoder-decoder", "url-parser"],
  isNew: true,
}

export default meta
