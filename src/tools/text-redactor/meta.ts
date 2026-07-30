import { EyeOff } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "text-redactor",
  title: "Text Redactor",
  description:
    "Mask emails, keys, IPs, and card numbers in logs before pasting them anywhere.",
  longDescription:
    "Paste a log, stack trace, config dump, or support ticket and replace the sensitive parts with labelled placeholders before you share it with a colleague, a bug tracker, or an AI assistant. Each detector can be switched on or off, and repeated values keep the same numbered placeholder so the text still makes sense after redaction. Detection and replacement both run locally in your browser, which matters more here than for most tools: the text you are redacting is exactly the text you do not want leaving your machine.",
  category: "security",
  keywords: [
    "redact sensitive data",
    "remove api keys from logs",
    "mask personal data in text",
    "scrub logs before sharing",
    "pii redaction tool",
  ],
  tags: ["redact", "privacy", "logs", "pii", "secrets", "mask"],
  icon: EyeOff,
  isNew: true,
  features: [
    "Detects emails, phone numbers, IP addresses, and MAC addresses",
    "Finds API keys, tokens, JWTs, and URLs with embedded credentials",
    "Luhn-checked card number detection to avoid false positives",
    "Numbered placeholders keep repeated values linked after redaction",
    "Per-detector match counts so you can see what was replaced",
  ],
  faqs: [
    {
      question: "Is my text uploaded anywhere while it is being redacted?",
      answer:
        "No. Every detector is a regular expression evaluated in your browser, and the redacted output never leaves the page. Nothing is sent to a server and nothing is stored.",
    },
    {
      question: "Why do repeated values get numbered placeholders?",
      answer:
        "A log is usually only useful if you can still tell that two lines refer to the same user or the same host. Each distinct match gets its own number, so the first email becomes [EMAIL_1] everywhere it appears and a different email becomes [EMAIL_2].",
    },
    {
      question: "Will it catch every secret in my text?",
      answer:
        "No automatic detector can. It covers common shapes such as provider key prefixes, JWTs, long hex tokens, and key=value assignments, but an unusual internal identifier will slip through. Read the output before you share it.",
    },
    {
      question: "Why are card numbers checked with the Luhn algorithm?",
      answer:
        "Any run of 13 to 19 digits looks like a card number, including order IDs and timestamps. Validating the checksum first means ordinary long numbers in your logs are left alone.",
    },
  ],
}

export default meta
