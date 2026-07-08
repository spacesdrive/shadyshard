import { FileType } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "markdown-preview",
  title: "Markdown Preview",
  description:
    "Write Markdown on the left and see the rendered, sanitized HTML on the right.",
  longDescription:
    "Type or paste Markdown to see it rendered live as HTML side by side with the source. Output is sanitized before rendering to strip any unsafe script content. Everything runs locally in your browser.",
  category: "text",
  keywords: [
    "markdown preview",
    "markdown editor online",
    "markdown to html",
    "live markdown renderer",
    "markdown viewer",
  ],
  tags: ["markdown", "text", "preview", "html"],
  icon: FileType,
  features: [
    "Live side-by-side preview as you type",
    "Supports headings, lists, links, code blocks, tables, and more",
    "Output is sanitized to prevent unsafe HTML/script content",
    "Copy the rendered HTML",
    "Works entirely offline in your browser",
  ],
  faqs: [
    {
      question: "Is the rendered HTML safe to paste elsewhere?",
      answer:
        "The output is sanitized to strip script tags and other unsafe content before it's rendered or copied, but always review generated HTML before publishing it, as with any tool.",
    },
    {
      question: "What Markdown features are supported?",
      answer:
        "Standard Markdown: headings, bold/italic, links, images, ordered and unordered lists, blockquotes, code blocks, inline code, and tables.",
    },
    {
      question: "Is my Markdown sent anywhere?",
      answer:
        "No. Rendering happens entirely in your browser. Nothing is sent to a server.",
    },
  ],
  relatedTools: ["html-escape", "word-counter"],
  isNew: true,
}

export default meta
