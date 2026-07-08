import { Link } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "slug-generator",
  title: "Slug Generator",
  description: "Convert a title into a clean, URL-safe slug.",
  longDescription:
    "Type a title or heading to instantly get a clean, URL-safe slug: lowercased, accents removed, special characters stripped, and words joined with your choice of separator. Everything runs locally in your browser.",
  category: "text",
  keywords: [
    "slug generator",
    "url slug generator",
    "text to slug",
    "seo friendly url generator",
    "permalink generator",
  ],
  tags: ["text", "slug", "url", "seo"],
  icon: Link,
  features: [
    "Removes accents and special characters",
    "Choice of hyphen or underscore separator",
    "Collapses repeated separators automatically",
    "Live preview as you type",
    "Works entirely offline in your browser",
  ],
  faqs: [
    {
      question: "What happens to accented characters?",
      answer:
        "Accented letters are normalized to their closest plain ASCII equivalent (e.g. café becomes cafe) so the slug stays URL-safe without percent-encoding.",
    },
    {
      question: "Can I use underscores instead of hyphens?",
      answer:
        "Yes, switch the separator option. Hyphens are the more common convention for SEO-friendly URLs.",
    },
    {
      question: "Is my text sent anywhere?",
      answer:
        "No. The slug is generated entirely in your browser. Nothing is sent to a server.",
    },
  ],
  relatedTools: ["case-converter", "word-counter"],
  isNew: true,
}

export default meta
