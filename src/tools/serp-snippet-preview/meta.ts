import { TextSearch } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "serp-snippet-preview",
  title: "SERP Snippet Preview",
  description:
    "Preview a Google search result and measure title and description pixel width before they get truncated.",
  longDescription:
    "Type a page URL, title tag, and meta description to see how the result is likely to render on Google desktop and mobile. Google truncates snippets by rendered pixel width rather than character count, so the tool measures each field with the same font size the search results use and shows where the cut-off falls. Everything is measured locally in your browser, so unpublished titles and descriptions never leave your machine.",
  category: "seo",
  keywords: [
    "serp preview",
    "google snippet preview",
    "title tag pixel width",
    "meta description length checker",
    "search result preview",
  ],
  tags: ["seo", "serp", "meta", "title", "preview", "search"],
  icon: TextSearch,
  features: [
    "Live desktop and mobile search result preview",
    "Pixel width measured with the search result font size, not a character count",
    "Truncation shown exactly where the snippet would be cut",
    "Per-field character count and remaining pixel budget",
    "Copy the title or description once it fits",
  ],
  faqs: [
    {
      question: "Why measure pixels instead of characters?",
      answer:
        "Google cuts titles and descriptions at a rendered width, not at a character count, and letters are not all the same width. A title made of wide letters such as W and M can be truncated well before 60 characters, while a title of the same length made of narrow letters fits comfortably.",
    },
    {
      question: "What width limits does the preview use?",
      answer:
        "Desktop uses 580 pixels for the title and 920 pixels for the description, mobile uses 470 pixels for the title and 680 pixels for the description. These are the commonly observed cut-off points, and Google can still rewrite a snippet, so treat the result as a strong guide rather than a guarantee.",
    },
    {
      question: "Does Google always use the title I write?",
      answer:
        "No. Google rewrites titles when it judges another heading or anchor text to be a better match for the query, so a title that fits is a starting point rather than a promise that it will be shown verbatim.",
    },
    {
      question: "Is the URL or copy I enter sent anywhere?",
      answer:
        "No. The preview is rendered and measured entirely in your browser with a canvas text measurement, and nothing is uploaded or stored.",
    },
  ],
  relatedTools: ["meta-tag-generator", "open-graph-preview", "hreflang-tag-generator"],
}

export default meta
