import { FileCode } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "markdown-to-html",
  title: "Markdown to HTML",
  description:
    "Convert Markdown source into sanitized HTML markup you can copy or download.",
  longDescription:
    "Paste Markdown and get the equivalent HTML source code, ready to copy into a page or download as an .html file. The output is sanitized before being shown, so it's also safe to preview. For a live side-by-side Markdown preview instead of raw HTML output, use Markdown Preview. Runs entirely in your browser using marked and DOMPurify.",
  category: "converters",
  keywords: [
    "markdown to html",
    "convert markdown to html",
    "md to html converter",
    "markdown html converter online",
    "markdown source to html",
  ],
  tags: ["markdown", "html", "convert", "document"],
  icon: FileCode,
  features: [
    "Converts Markdown to sanitized HTML markup",
    "Copy or download the resulting HTML",
    "Live conversion as you type",
    "Runs entirely offline in your browser",
  ],
  faqs: [
    {
      question: "How is this different from Markdown Preview?",
      answer:
        "Markdown Preview shows a rendered visual preview alongside the source. This tool gives you the actual HTML markup as text, ready to paste into another page or codebase.",
    },
    {
      question: "Is the output HTML safe to use directly?",
      answer:
        "It's sanitized with DOMPurify before being shown, which strips dangerous constructs like inline scripts. Still review generated HTML before using it somewhere with different security requirements.",
    },
  ],
  relatedTools: ["markdown-preview", "html-to-markdown", "html-escape"],
  isNew: true,
}

export default meta
