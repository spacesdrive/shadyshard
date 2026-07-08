import { Binary } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "base64-encoder-decoder",
  title: "Base64 Encoder & Decoder",
  description:
    "Encode text to Base64 or decode Base64 back to text, with full Unicode support.",
  longDescription:
    "Switch between encoding and decoding Base64 data. Text is converted to UTF-8 bytes before encoding and decoded back to UTF-8 after decoding, so non-ASCII characters round-trip correctly. Everything runs locally in your browser.",
  category: "developer",
  keywords: [
    "base64 encoder",
    "base64 decoder",
    "base64 to text",
    "text to base64",
    "base64 converter online",
  ],
  tags: ["base64", "encoding", "developer", "converter"],
  icon: Binary,
  features: [
    "Encode and decode in one tool with a tab switch",
    "Correct UTF-8 handling for non-ASCII characters",
    "Inline error message for invalid Base64 input",
    "One-click copy of the result",
    "Works entirely offline in your browser",
  ],
  faqs: [
    {
      question: "Does this handle special characters and emoji correctly?",
      answer:
        "Yes. Text is encoded as UTF-8 bytes before Base64 encoding and decoded back through UTF-8 after decoding, so accented letters, emoji, and other non-ASCII characters round-trip correctly.",
    },
    {
      question: "What happens if I paste invalid Base64 into the decoder?",
      answer:
        "You'll see an inline error message explaining that the input is not valid Base64, instead of a crash or silent wrong output.",
    },
    {
      question: "Is my data uploaded anywhere?",
      answer:
        "No. Encoding and decoding happen entirely in your browser using native JavaScript APIs. Nothing is sent to a server.",
    },
  ],
  relatedTools: ["url-encoder-decoder", "json-formatter"],
  isNew: true,
}

export default meta
