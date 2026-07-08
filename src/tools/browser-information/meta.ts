import { Globe } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "browser-information",
  title: "Browser Information",
  description: "See detailed information about your browser, device, and screen.",
  longDescription:
    "View your browser's user agent, platform, language, screen resolution, viewport size, and other environment details, read directly from your browser's own APIs. Nothing here is looked up from a server.",
  category: "browser",
  keywords: [
    "browser information",
    "what browser am i using",
    "browser details",
    "screen resolution checker",
    "my browser info",
  ],
  tags: ["browser", "info", "device", "diagnostics"],
  icon: Globe,
  features: [
    "User agent, platform, and language",
    "Screen resolution, viewport size, and color depth",
    "CPU core count and device memory, where available",
    "Time zone and online status",
    "One-click copy of everything as text",
  ],
  faqs: [
    {
      question: "Where does this information come from?",
      answer:
        "Entirely from your own browser's built-in APIs (navigator, screen, and window) - nothing is looked up from a server or any external service.",
    },
    {
      question: "Why are some fields missing?",
      answer:
        "A few properties, like device memory, are only exposed by some browsers for privacy reasons. If your browser doesn't support a field, it's shown as unavailable.",
    },
    {
      question: "Is this information sent anywhere?",
      answer:
        "No. It's read from your browser and displayed locally. Nothing is transmitted.",
    },
  ],
  relatedTools: ["user-agent-parser", "clipboard-inspector"],
  isNew: true,
}

export default meta
