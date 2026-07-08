import { Type } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "character-counter",
  title: "Character Counter",
  description:
    "Count characters as you type, with live limits for X, SMS, and meta descriptions.",
  longDescription:
    "Count characters live as you type and see exactly how much room you have left against common platform limits, like an X post, an SMS segment, or a search engine meta description. Everything is calculated locally in your browser.",
  category: "text",
  keywords: [
    "character counter",
    "character count online",
    "twitter character counter",
    "sms character limit",
    "meta description length checker",
  ],
  tags: ["text", "counter", "characters", "limit"],
  icon: Type,
  features: [
    "Live character count as you type",
    "Presets for X posts, SMS segments, and meta descriptions",
    "Over-limit warning with the exact overage",
    "Character count with and without spaces",
    "Works entirely offline in your browser",
  ],
  faqs: [
    {
      question: "How is this different from the Word Counter?",
      answer:
        "Word Counter gives a broad statistics dashboard (words, sentences, paragraphs, reading time). This tool is focused specifically on character limits for platforms like X and SMS, with a live countdown against the limit you pick.",
    },
    {
      question: "Does it count emoji and spaces?",
      answer:
        "Yes, every character including spaces counts toward the total, matching how most platforms count length. A separate count without spaces is also shown.",
    },
    {
      question: "Is my text sent anywhere?",
      answer:
        "No. Counting happens entirely in your browser. Nothing is sent to a server.",
    },
  ],
  relatedTools: ["word-counter", "reading-time-calculator"],
  isNew: true,
}

export default meta
