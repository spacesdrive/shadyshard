import { FileText } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "word-counter",
  title: "Word Counter",
  description:
    "Count words, characters, sentences, and paragraphs in your text instantly.",
  longDescription:
    "Paste or type any text to get an instant breakdown of word count, character count, sentence count, paragraph count, and estimated reading time. Everything is calculated locally in your browser as you type - nothing is ever sent anywhere.",
  category: "text",
  keywords: [
    "word counter",
    "character counter",
    "count words online",
    "text statistics",
    "reading time calculator",
  ],
  tags: ["text", "counter", "writing", "words", "characters"],
  icon: FileText,
  features: [
    "Live word and character counts",
    "Sentence and paragraph detection",
    "Estimated reading time",
    "Character count with and without spaces",
    "Works entirely offline in your browser",
  ],
  faqs: [
    {
      question: "Does this word counter store or upload my text?",
      answer:
        "No. All counting happens locally in your browser using JavaScript. Your text is never sent to a server.",
    },
    {
      question: "How is reading time calculated?",
      answer:
        "Reading time is estimated at an average adult reading speed of 200 words per minute.",
    },
    {
      question: "Does it count numbers and punctuation as words?",
      answer:
        "Words are counted as whitespace-separated tokens, so numbers are counted as words but standalone punctuation is not.",
    },
  ],
  isNew: true,
}

export default meta
