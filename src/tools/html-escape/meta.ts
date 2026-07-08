import { Code } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "html-escape",
  title: "HTML Escape",
  description:
    "Escape text into safe HTML entities, or unescape HTML entities back to plain text.",
  longDescription:
    "Escape special characters like <, >, &, and quotes into HTML entities so text can be safely embedded in HTML, or unescape existing entities back to plain text. Everything runs locally in your browser.",
  category: "text",
  keywords: [
    "html escape",
    "html unescape",
    "html entity encoder",
    "escape html characters",
    "html entities converter",
  ],
  tags: ["html", "escape", "entities", "text"],
  icon: Code,
  features: [
    "Escape and unescape in one tool with a tab switch",
    "Handles <, >, &, double quotes, and single quotes",
    "One-click copy of the result",
    "Live conversion as you type",
    "Works entirely offline in your browser",
  ],
  faqs: [
    {
      question: "Why would I need to escape HTML?",
      answer:
        "When inserting user-provided or arbitrary text into an HTML page, escaping special characters like < and & prevents them from being interpreted as markup, which is a basic defense against HTML injection.",
    },
    {
      question: "What characters get escaped?",
      answer:
        "The five standard HTML-significant characters: & becomes &amp;, < becomes &lt;, > becomes &gt;, \" becomes &quot;, and ' becomes &#39;.",
    },
    {
      question: "Is my text sent anywhere?",
      answer:
        "No. Escaping and unescaping happen entirely in your browser. Nothing is sent to a server.",
    },
  ],
  relatedTools: ["url-encoder-decoder", "base64-encoder-decoder"],
  isNew: true,
}

export default meta
