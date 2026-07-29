import { BookOpenCheck } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "readability-score-checker",
  title: "Readability Score Checker",
  description:
    "Score text with Flesch Reading Ease, Flesch-Kincaid, Gunning Fog, SMOG, Coleman-Liau, and ARI.",
  longDescription:
    "Paste a draft to get six standard readability scores side by side, plus the sentence and syllable statistics they are calculated from. The tool also lists the longest sentences in the text, which is usually the fastest way to move a score without rewriting everything. All analysis runs locally in your browser, so unpublished drafts and client copy stay on your machine.",
  category: "text",
  keywords: [
    "readability score checker",
    "flesch reading ease calculator",
    "flesch kincaid grade level",
    "gunning fog index",
    "text readability test",
  ],
  tags: ["text", "readability", "writing", "flesch", "grade level", "editing"],
  icon: BookOpenCheck,
  isNew: true,
  features: [
    "Flesch Reading Ease with a plain-language interpretation band",
    "Flesch-Kincaid, Gunning Fog, SMOG, Coleman-Liau, and ARI grade levels",
    "Word, sentence, syllable, and complex word counts",
    "Longest sentences listed so you know what to cut first",
    "Copy a summary report of every score",
  ],
  faqs: [
    {
      question: "What is a good Flesch Reading Ease score?",
      answer:
        "Scores of 60 to 70 are considered plain English for a general audience, which is the range most publishers and content teams aim for. Technical documentation often sits in the 30 to 50 band, and that is acceptable when the audience is specialist.",
    },
    {
      question: "Why do the grade level scores disagree with each other?",
      answer:
        "Each formula weighs different inputs. Flesch-Kincaid and SMOG count syllables, Gunning Fog counts words of three or more syllables, and Coleman-Liau and ARI count characters instead. Reading them together is more useful than trusting any single number.",
    },
    {
      question: "How are syllables counted?",
      answer:
        "Syllables are estimated with the standard vowel-group heuristic used by most readability tools, which handles ordinary English well but can be off by one on unusual names and loanwords. Scores on short passages are therefore less stable than on a few hundred words.",
    },
    {
      question: "Is my draft uploaded anywhere?",
      answer: "No. The text is analysed in your browser and never leaves the page.",
    },
  ],
  relatedTools: ["word-counter", "reading-time-calculator", "word-frequency-counter"],
}

export default meta
