import { ListTree } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "markdown-toc-generator",
  title: "Markdown TOC Generator",
  description:
    "Turn the headings in a Markdown document into a nested table of contents with working anchor links.",
  longDescription:
    "Paste a README or any Markdown file and get back a table of contents built from its headings, indented to match the heading levels and linked with GitHub-style anchors. Headings inside fenced code blocks are ignored, and repeated heading text gets the numbered anchor suffix GitHub adds, so the links resolve correctly rather than all pointing at the first match. Choose the heading levels to include and whether the list is bulleted or numbered, then copy it into the top of your document. Parsing happens in your browser.",
  category: "text",
  keywords: [
    "markdown table of contents generator",
    "readme toc generator",
    "markdown toc anchor links",
    "generate toc from headings",
    "github markdown anchors",
  ],
  tags: ["markdown", "toc", "readme", "documentation", "text"],
  icon: ListTree,
  features: [
    "GitHub-compatible heading anchors, including duplicate handling",
    "Selectable minimum and maximum heading levels",
    "Bulleted or numbered output",
    "Ignores headings inside fenced code blocks",
    "Copy or download the generated table of contents",
  ],
  faqs: [
    {
      question: "How are the anchor links built?",
      answer:
        "Heading text is lowercased, punctuation is dropped, and spaces become hyphens, which is the rule GitHub uses. Repeated headings get -1, -2, and so on appended in document order, matching GitHub's own behaviour.",
    },
    {
      question: "Why is the top-level heading missing?",
      answer:
        "The default range starts at level 2, because a document's single level 1 heading is its title and listing it in its own table of contents is redundant. Set the minimum level to 1 if you want it included.",
    },
    {
      question: "Do these anchors work outside GitHub?",
      answer:
        "They work anywhere that generates heading ids the same way, which includes GitHub, GitLab, and most static site generators. A renderer with a different slug rule may need the anchors adjusted.",
    },
    {
      question: "Is my document uploaded?",
      answer:
        "No. The Markdown is parsed with plain string handling in your browser and never sent anywhere.",
    },
  ],
}

export default meta
