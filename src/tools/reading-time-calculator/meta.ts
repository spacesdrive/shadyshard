import { Clock3 } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "reading-time-calculator",
  title: "Reading Time Calculator",
  description:
    "Estimate how long an article takes to read, with an adjustable reading speed.",
  longDescription:
    "Paste an article or draft to estimate its reading time, with a reading-speed slider so you can match slow, average, or fast readers. Useful for blog post metadata, video-to-article estimates, or just knowing how long a piece is. Everything runs locally in your browser.",
  category: "text",
  keywords: [
    "reading time calculator",
    "estimated reading time",
    "words per minute calculator",
    "article reading time",
    "how long to read",
  ],
  tags: ["text", "reading time", "wpm", "writing"],
  icon: Clock3,
  features: [
    "Adjustable reading speed from 100 to 400 words per minute",
    "Minutes and seconds precision, not just a rounded number",
    "Live word count alongside the estimate",
    "Useful for blog post metadata and content planning",
    "Works entirely offline in your browser",
  ],
  faqs: [
    {
      question: "What reading speed should I use?",
      answer:
        "200 words per minute is a common average for adult silent reading and is the default here. Use a lower speed for technical or dense material, or a higher speed for skimmable content.",
    },
    {
      question: "How is this different from the reading time shown in Word Counter?",
      answer:
        "Word Counter shows a fixed estimate at 200 WPM as one of several stats. This tool is dedicated to reading time specifically, with an adjustable speed and minute-and-second precision.",
    },
    {
      question: "Is my text sent anywhere?",
      answer:
        "No. The estimate is calculated entirely in your browser. Nothing is sent to a server.",
    },
  ],
  relatedTools: ["word-counter", "character-counter"],
  isNew: true,
}

export default meta
