import { Smartphone } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "user-agent-parser",
  title: "User Agent Parser",
  description: "Parse a user agent string into browser, engine, OS, and device type.",
  longDescription:
    "Paste any user agent string, or use your own browser's, to break it down into browser name and version, rendering engine, operating system, and device type. Everything runs locally in your browser.",
  category: "browser",
  keywords: [
    "user agent parser",
    "parse user agent string",
    "user agent decoder",
    "what browser is this user agent",
    "ua string parser",
  ],
  tags: ["user agent", "browser", "parser"],
  icon: Smartphone,
  features: [
    "Detects browser name and version",
    "Detects rendering engine",
    "Detects operating system",
    "Detects device type (desktop, mobile, or tablet)",
    "Works entirely offline in your browser",
  ],
  faqs: [
    {
      question: "Can I parse someone else's user agent string?",
      answer:
        "Yes, paste any user agent string - from a server log, a bug report, or anywhere else - and it will be parsed the same way as your own.",
    },
    {
      question: "Why might the detection be wrong?",
      answer:
        "User agent strings are notoriously inconsistent and often spoofed or contain legacy compatibility tokens from other browsers, which can occasionally cause misdetection - this uses common pattern matching, not an exhaustive database.",
    },
    {
      question: "Is the user agent string sent anywhere?",
      answer:
        "No. Parsing happens entirely in your browser using pattern matching. Nothing is sent to a server.",
    },
  ],
  relatedTools: ["browser-information", "clipboard-inspector"],
  isNew: true,
}

export default meta
