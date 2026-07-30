import { Pilcrow } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "lorem-ipsum-generator",
  title: "Lorem Ipsum Generator",
  description:
    "Generate placeholder paragraphs, sentences, words, or list items for a layout.",
  longDescription:
    "Placeholder text exists so a layout can be judged on its shape rather than on whatever copy happens to be handy. Choose how much you need, in paragraphs, sentences, words, or list items, and whether to keep the traditional opening line. Output can be plain text or wrapped in HTML paragraph or list markup, ready to paste into a template. Sentence and paragraph lengths vary the way real prose does, so the result does not fall into an obviously repeating rhythm. Generation runs in your browser.",
  category: "generators",
  keywords: [
    "lorem ipsum generator",
    "placeholder text generator",
    "dummy text for design",
    "filler text paragraphs",
    "lorem ipsum html",
  ],
  tags: ["lorem ipsum", "placeholder", "text", "dummy", "design", "filler"],
  icon: Pilcrow,
  features: [
    "Generate by paragraph, sentence, word, or list item",
    "Optionally start with the traditional lorem ipsum opening",
    "Plain text, HTML paragraphs, or an HTML list",
    "Varied sentence and paragraph lengths instead of a fixed rhythm",
    "Live word and character counts for the generated text",
  ],
  faqs: [
    {
      question: "Why use lorem ipsum instead of real copy?",
      answer:
        "Readable text pulls attention to what it says. Placeholder text keeps the review on typography, spacing, and line length, which is what a layout draft is meant to be judged on. Swap in real copy before anyone signs off on the design, since real copy is almost never the same length.",
    },
    {
      question: "Can I get the text as HTML?",
      answer:
        "Yes. Choose HTML paragraphs to wrap each paragraph in a p element, or the list option to produce a ul with one li per item, which is the shape you usually need when filling in a component.",
    },
    {
      question: "Is the text the same every time?",
      answer:
        "No. Words are drawn at random for each generation, so pressing generate again gives different filler at the same length. Only the opening line is fixed, and only when that option is switched on.",
    },
    {
      question: "Where does the text come from?",
      answer:
        "It uses the standard Latin word list that lorem ipsum has been built from since it was first used as typesetting filler. It is not meaningful Latin and is not intended to be translated.",
    },
  ],
}

export default meta
