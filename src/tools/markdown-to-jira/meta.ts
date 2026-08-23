import { FileType2 } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "markdown-to-jira",
  title: "Markdown to Jira Converter",
  description:
    "Convert Markdown into Jira wiki markup, including headings, tables, code blocks, and nested lists.",
  longDescription:
    "Jira uses its own wiki markup rather than Markdown, and the two disagree in exactly the places that matter: a single asterisk means bold in Jira and italic in Markdown, links put the text and the URL the other way round, tables use double pipes for the header row, and fenced code blocks become a code macro. Paste Markdown here to get the Jira equivalent, ready to drop into a ticket description or a comment. Everything is converted in your browser, which matters when the text you are pasting is an internal incident writeup or a customer report.",
  category: "converters",
  keywords: [
    "markdown to jira",
    "jira wiki markup converter",
    "convert markdown for jira ticket",
    "markdown to confluence markup",
    "jira formatting from markdown",
  ],
  tags: ["markdown", "jira", "converter", "wiki-markup", "atlassian", "text"],
  icon: FileType2,
  features: [
    "Headings, bold, italic, strikethrough, and inline code",
    "Fenced code blocks become a Jira code macro with the language kept",
    "Tables converted to the double-pipe header form Jira expects",
    "Nested bullet and numbered lists mapped to repeated markers",
    "Links and images rewritten into Jira's own bracket syntax",
  ],
  faqs: [
    {
      question: "Why does bold in Markdown become a single asterisk?",
      answer:
        "Jira wiki markup uses one asterisk for bold and one underscore for italic, where Markdown uses two asterisks for bold and one for italic. This is the difference that trips people up most often, because pasting Markdown straight into Jira turns bold text into italic text.",
    },
    {
      question: "Does this work with the newer Jira Cloud editor?",
      answer:
        "Jira Cloud's editor accepts wiki markup when you switch a field to the wiki markup renderer, and Jira Server and Data Center use it throughout. In the Cloud rich text editor, paste the converted markup into a field set to wiki markup rather than typing it into the rich text area.",
    },
    {
      question: "What happens to a code block with no language?",
      answer:
        "It becomes a noformat macro, which Jira renders as preformatted text without syntax highlighting. A fenced block that does name a language becomes a code macro with that language set.",
    },
    {
      question: "Is the text sent to Atlassian or anywhere else?",
      answer:
        "No. The conversion is a set of text transformations that run in your browser, with no request to Jira or anywhere else, so an unreleased writeup stays on your machine.",
    },
  ],
}

export default meta
