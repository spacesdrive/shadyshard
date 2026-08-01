import { PanelTop } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "og-image-generator",
  title: "Open Graph Image Generator",
  description:
    "Draw a 1200 by 630 social share image from a title, description, and site name, and download it as PNG.",
  longDescription:
    "A link shared on social media, Slack, or Discord shows the image named in its og:image tag, and a page without one is rendered as a bare text row that attracts noticeably less attention. Type a title, an optional description, and your site name, choose the colours, and download a correctly sized 1200 by 630 PNG. The title wraps and shrinks to fit rather than being cut off, so a long headline still fits inside the safe area every platform crops to. The image is drawn on a canvas in your browser and saved directly from it, so no design tool, account, or rendering service is involved and nothing you type is uploaded.",
  category: "seo",
  keywords: [
    "open graph image generator",
    "og image 1200x630",
    "social share image maker",
    "twitter card image generator",
    "link preview image",
  ],
  tags: ["og image", "open graph", "social", "seo", "preview", "canvas", "generator"],
  icon: PanelTop,
  features: [
    "Exports the standard 1200 by 630 pixel size",
    "Title wraps and auto-fits so long headlines are not cut off",
    "Custom background, accent, and text colours with light and dark presets",
    "Optional description and site name lines",
    "Drawn on a canvas locally, with no account or rendering service",
  ],
  relatedTools: ["open-graph-preview", "meta-tag-generator", "serp-snippet-preview"],
  faqs: [
    {
      question: "Why is 1200 by 630 the right size?",
      answer:
        "It is the size Facebook documents for a large link preview and the aspect ratio, close to 1.91 to 1, that X, LinkedIn, Slack, and Discord all crop toward. Using it means one image works everywhere instead of being letterboxed or cropped differently per platform.",
    },
    {
      question: "How do I use the image once it is downloaded?",
      answer:
        "Upload it with your site's assets and point at it with an absolute URL in the og:image and twitter:image meta tags. Relative paths do not work, because the crawler fetching it has no page context to resolve them against.",
    },
    {
      question: "Why does my new image not show when I share the link?",
      answer:
        "Platforms cache link previews aggressively, often for days. Facebook's Sharing Debugger and LinkedIn's Post Inspector both let you force a re-fetch, and adding a version query string to the image URL also works.",
    },
    {
      question: "Is the text I type sent anywhere?",
      answer:
        "No. The image is composed on a canvas element in your browser and downloaded from it directly, so unpublished headlines stay on your machine.",
    },
  ],
}

export default meta
