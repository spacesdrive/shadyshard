import { Bot } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "robots-txt-generator",
  title: "Robots.txt Generator",
  description:
    "Generate a robots.txt file with allow/disallow rules and a sitemap reference.",
  longDescription:
    "Build a robots.txt file by adding disallow and allow rules per user agent, plus your sitemap URL. Copy the result or download it ready to drop into your site's root. Everything runs locally in your browser.",
  category: "seo",
  keywords: [
    "robots.txt generator",
    "generate robots.txt",
    "robots.txt online",
    "robots.txt disallow generator",
    "seo robots.txt",
  ],
  tags: ["seo", "robots.txt", "crawler", "generator"],
  icon: Bot,
  features: [
    "Add multiple disallow/allow rules per user agent",
    "Optional sitemap URL reference",
    "Common presets: allow all, block all, block admin paths",
    "Copy or download the file directly",
    "Works entirely offline in your browser",
  ],
  faqs: [
    {
      question: "Where does robots.txt need to go?",
      answer:
        "At the root of your domain, e.g. https://example.com/robots.txt - it won't be respected anywhere else.",
    },
    {
      question: "Does robots.txt guarantee a page won't be indexed?",
      answer:
        "No. It only requests that well-behaved crawlers not fetch certain paths. To reliably prevent indexing of an already-discoverable page, use a noindex meta tag instead.",
    },
    {
      question: "Is my data sent anywhere?",
      answer:
        "No. The file is generated entirely in your browser from the rules you add.",
    },
  ],
  relatedTools: ["sitemap-generator", "meta-tag-generator"],
  isNew: true,
}

export default meta
