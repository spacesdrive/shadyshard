import { Tags } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "meta-tag-generator",
  title: "Meta Tag Generator",
  description:
    "Generate title, description, Open Graph, and Twitter Card meta tags for a page.",
  longDescription:
    "Fill in a page's title, description, URL, and image to generate the standard set of meta tags: title, meta description, canonical link, Open Graph, and Twitter Card. Copy the HTML straight into your page's head. Everything runs locally in your browser.",
  category: "seo",
  keywords: [
    "meta tag generator",
    "open graph tag generator",
    "twitter card generator",
    "seo meta tags generator",
    "html meta tags generator",
  ],
  tags: ["seo", "meta tags", "open graph", "twitter card"],
  icon: Tags,
  features: [
    "Title, meta description, and canonical link tags",
    "Full Open Graph tag set",
    "Twitter Card tags with large-image support",
    "Live character count for title and description",
    "One-click copy of the generated HTML",
  ],
  faqs: [
    {
      question: "What's a good length for the title and description?",
      answer:
        "Roughly 50-60 characters for the title and 150-160 for the description keeps them from being truncated in most search results - the character counts shown update live as you type.",
    },
    {
      question: "Do I need both Open Graph and Twitter Card tags?",
      answer:
        "Open Graph tags are used by Facebook, LinkedIn, and most other platforms, while Twitter/X primarily reads Twitter Card tags (falling back to Open Graph if absent). Including both covers the widest range of platforms.",
    },
    {
      question: "Is my page data sent anywhere?",
      answer: "No. The HTML is generated entirely in your browser from what you type.",
    },
  ],
  relatedTools: ["open-graph-preview", "sitemap-generator"],
  isNew: true,
}

export default meta
