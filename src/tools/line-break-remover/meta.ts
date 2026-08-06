import { WrapText } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "line-break-remover",
  title: "Line Break Remover",
  description:
    "Strip the hard line breaks out of pasted text while keeping real paragraph breaks intact.",
  longDescription:
    "Text copied out of a PDF, an email client, or a terminal usually arrives wrapped at a fixed width, so every visual line ends in a real line break and the paragraph will not reflow when you paste it somewhere else. This removes those breaks. The default mode joins wrapped lines but leaves blank-line paragraph boundaries alone, which is what you almost always want, and separate modes remove every break or only collapse runs of blank lines. Hyphenated words split across a line break can be rejoined in the same pass. Everything runs in your browser, so a draft or an extract from a contract stays on your machine.",
  category: "text",
  keywords: [
    "remove line breaks",
    "delete line breaks from text",
    "unwrap text copied from pdf",
    "join wrapped lines",
    "remove newlines online",
  ],
  tags: ["text", "line breaks", "newlines", "pdf", "formatting", "cleanup"],
  icon: WrapText,
  features: [
    "Joins wrapped lines while keeping paragraph breaks",
    "Modes for removing every break or only collapsing blank lines",
    "Optional rejoining of words hyphenated across a break",
    "Optional trimming and whitespace collapsing per line",
    "Live before and after line counts",
  ],
  faqs: [
    {
      question: "What is the difference between the three modes?",
      answer:
        "Join wrapped lines removes single line breaks but treats a blank line as a paragraph boundary and keeps it. Remove every line break flattens the text into one continuous line. Collapse blank lines leaves the wrapping alone and only reduces runs of empty lines to a single break.",
    },
    {
      question: "Why do some words end up joined incorrectly?",
      answer:
        "If the source text hyphenated a word across a line break, joining the lines leaves the hyphen in the middle. Turn on rejoining hyphenated words and a hyphen at the end of a line is removed when the next line starts with a lowercase letter.",
    },
    {
      question: "Does it handle Windows line endings?",
      answer:
        "Yes. Carriage return and line feed pairs, bare carriage returns, and bare line feeds are all recognised, so text from any operating system is handled the same way.",
    },
    {
      question: "Is my text uploaded anywhere?",
      answer:
        "No. The text is processed by JavaScript in your browser and never sent to a server.",
    },
  ],
  isNew: true,
}

export default meta
