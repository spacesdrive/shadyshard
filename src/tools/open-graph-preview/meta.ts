import { GalleryHorizontal } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "open-graph-preview",
  title: "Open Graph Preview",
  description:
    "Preview how a title, description, and image will look as a shared social media card.",
  longDescription:
    "Fill in a title, description, image URL, and site URL to see a live preview of how the link card will look when shared on social platforms. Everything runs locally in your browser - image URLs are loaded directly by your browser, not proxied through a server.",
  category: "seo",
  keywords: [
    "open graph preview",
    "og image preview",
    "social share preview",
    "link preview generator",
    "twitter card preview",
  ],
  tags: ["seo", "open graph", "social", "preview"],
  icon: GalleryHorizontal,
  features: [
    "Live card preview as you type",
    "Shows how the domain and title truncate at typical lengths",
    "Works with any publicly accessible image URL",
    "Companion to Meta Tag Generator for producing the actual tags",
    "Works entirely offline in your browser",
  ],
  faqs: [
    {
      question: "Does this match exactly what Facebook or X will show?",
      answer:
        "This gives a close visual approximation based on common card layouts. Actual rendering varies slightly by platform and can be affected by their own crawlers and caching.",
    },
    {
      question: "Why isn't my image showing?",
      answer:
        "The image URL must be publicly accessible over HTTPS. If it's on localhost or behind authentication, your browser can't load it here either.",
    },
    {
      question: "Where do I get the actual meta tags for this preview?",
      answer:
        "Use the Meta Tag Generator with the same title, description, and image to produce the HTML to add to your page.",
    },
  ],
  relatedTools: ["meta-tag-generator", "robots-txt-generator"],
  isNew: true,
}

export default meta
