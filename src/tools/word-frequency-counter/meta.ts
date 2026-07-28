import { BarChart3 } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "word-frequency-counter",
  title: "Word Frequency Counter",
  description:
    "Rank the words in a text by how often they appear, with stop words filtered out.",
  longDescription:
    "Paste an article, a transcript, or a page of copy to see which words carry it, ranked by count with each word's share of the total. Filter out common stop words and short words to focus on the terms that matter, then copy or download the table as CSV. The text is analysed in your browser and never uploaded.",
  category: "text",
  keywords: [
    "word frequency counter",
    "keyword density checker",
    "most used words in text",
    "word count by word",
  ],
  tags: ["text", "frequency", "keywords", "writing", "seo"],
  icon: BarChart3,
  features: [
    "Words ranked by count, with each word's share of the total",
    "Optional stop word filtering for common English words",
    "Minimum word length and result limit controls",
    "Copy or download the full table as CSV",
  ],
  faqs: [
    {
      question: "How does this differ from a word counter?",
      answer:
        "A word counter reports how many words a text has in total. This tool reports how often each distinct word appears, which is what you need when checking repetition or keyword balance.",
    },
    {
      question: "Which words are treated as stop words?",
      answer:
        "A built-in list of around 80 common English function words such as the, and, of, and to. Turn the filter off to include them in the ranking.",
    },
    {
      question: "How are contractions and hyphenated words handled?",
      answer:
        "Apostrophes and hyphens inside a word are kept, so it is and well-known each count as a single word rather than being split apart.",
    },
  ],
}

export default meta
