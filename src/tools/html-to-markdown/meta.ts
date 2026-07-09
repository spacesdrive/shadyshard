import { FileText } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "html-to-markdown",
  title: "HTML to Markdown",
  description: "Convert HTML markup into clean Markdown source.",
  longDescription:
    "Paste HTML and get the equivalent Markdown, using headings, bold/italic, links, lists, and code blocks converted to their Markdown syntax. Useful for pulling formatted web content into a Markdown-based note or documentation file. Runs entirely in your browser using Turndown.",
  category: "converters",
  keywords: [
    "html to markdown",
    "convert html to markdown",
    "html to md converter",
    "html markdown converter online",
    "strip html to markdown",
  ],
  tags: ["html", "markdown", "convert", "document"],
  icon: FileText,
  features: [
    "Converts headings, emphasis, links, lists, and code blocks",
    "Live conversion as you type",
    "Copy or download the resulting Markdown",
    "Runs entirely offline in your browser",
  ],
  faqs: [
    {
      question: "Will this preserve complex layouts like tables or embedded media?",
      answer:
        "Basic tables convert to Markdown table syntax where possible, but complex layouts, embedded scripts, and styling don't have a Markdown equivalent and are dropped rather than approximated.",
    },
    {
      question: "Is my HTML executed or rendered anywhere?",
      answer:
        "No. It's parsed as markup only, never rendered as a live page, so embedded scripts never run.",
    },
  ],
  relatedTools: ["markdown-to-html", "markdown-preview", "html-escape"],
  isNew: true,
}

export default meta
