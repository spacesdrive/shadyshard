import { Map } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "sitemap-generator",
  title: "Sitemap Generator",
  description: "Turn a list of URLs into a valid sitemap.xml file, ready to download.",
  longDescription:
    "Paste a list of URLs, one per line, along with a default change frequency and priority, to generate a valid sitemap.xml. Copy or download the result. Everything runs locally in your browser.",
  category: "seo",
  keywords: [
    "sitemap generator",
    "generate sitemap.xml",
    "xml sitemap generator",
    "sitemap creator online",
    "create sitemap",
  ],
  tags: ["seo", "sitemap", "xml", "generator"],
  icon: Map,
  features: [
    "Paste any list of URLs, one per line",
    "Configurable default change frequency and priority",
    "Produces standards-compliant sitemap.xml markup",
    "Copy or download the file directly",
    "Works entirely offline in your browser",
  ],
  faqs: [
    {
      question: "Does this crawl my site to find URLs?",
      answer:
        "No, this tool doesn't crawl anything - it turns a list of URLs you provide into properly formatted sitemap XML. You need to supply the URL list yourself.",
    },
    {
      question: "Where should I upload the generated sitemap.xml?",
      answer:
        "To the root of your site, e.g. https://example.com/sitemap.xml, and reference it from robots.txt for crawlers to discover it automatically.",
    },
    {
      question: "Is my URL list sent anywhere?",
      answer:
        "No. The sitemap is generated entirely in your browser from what you paste in.",
    },
  ],
  relatedTools: ["robots-txt-generator", "meta-tag-generator"],
  isNew: true,
}

export default meta
