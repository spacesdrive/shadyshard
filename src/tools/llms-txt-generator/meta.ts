import { Bot } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "llms-txt-generator",
  title: "llms.txt Generator",
  description:
    "Build a valid llms.txt file that tells AI crawlers and assistants what your site is and which pages matter.",
  longDescription:
    "llms.txt is a plain Markdown file at the root of a site that gives language models a short description of what the site is and a curated list of the pages worth reading, in the same spirit as robots.txt but aimed at assistants rather than search crawlers. This tool builds one from a structured form: a site name, a one-line summary, optional context, and as many link sections as you need, including the Optional section the specification reserves for pages a model can skip. Every link is checked for a valid absolute URL as you type, since a relative path is the mistake that most often makes the file useless. Nothing is crawled or uploaded, so the file is exactly the pages you chose to list.",
  category: "seo",
  keywords: [
    "llms.txt generator",
    "create llms txt file",
    "ai crawler file",
    "llms txt format example",
    "aeo file for language models",
  ],
  tags: ["llms.txt", "ai", "seo", "crawler", "markdown"],
  icon: Bot,
  isNew: true,
  features: [
    "Builds the heading, summary, and link sections the specification defines",
    "Supports the reserved Optional section for lower-priority pages",
    "Validates every URL and reports the line each problem is on",
    "Live preview of the exact file that will be written",
    "Copy the text or download a ready-to-upload llms.txt",
  ],
  faqs: [
    {
      question: "Where does the file go?",
      answer:
        "At the root of the domain, so it is reachable at https://example.com/llms.txt. It is served as plain text and does not need to be linked from anywhere, though linking it does no harm.",
    },
    {
      question: "Is llms.txt the same as robots.txt?",
      answer:
        "No. robots.txt tells crawlers which paths they may fetch and is enforced by convention. llms.txt is descriptive: it explains what the site is and points at the pages most worth reading, so a model answering a question has the right context rather than whatever it happened to crawl.",
    },
    {
      question: "What is the Optional section for?",
      answer:
        "The specification reserves a section titled Optional for links that can be skipped when a model has a limited context budget. Put changelogs, archives, and secondary references there and keep the primary documentation in its own sections.",
    },
    {
      question: "Why does the tool not crawl my site to fill this in?",
      answer:
        "There is no server here to crawl from, and a generated dump of every page is usually worse than a short curated list. Naming the ten pages you actually want quoted produces a more useful file than an automatic index of several hundred.",
    },
  ],
}

export default meta
