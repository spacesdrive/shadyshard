import { ClipboardPaste } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "clipboard-inspector",
  title: "Clipboard Inspector",
  description:
    "See exactly what's on your clipboard: its text, length, and detected format.",
  longDescription:
    "Read your clipboard's current text content, or paste directly into the box, to see its character count, byte size, and a best-guess at its format (URL, JSON, email, or plain text). Everything runs locally in your browser.",
  category: "browser",
  keywords: [
    "clipboard inspector",
    "what's on my clipboard",
    "clipboard viewer",
    "check clipboard content",
    "clipboard checker",
  ],
  tags: ["clipboard", "browser", "inspector"],
  icon: ClipboardPaste,
  features: [
    "Read clipboard text with one click",
    "Or paste directly into the box",
    "Character and byte count",
    "Best-guess format detection (URL, JSON, email, plain text)",
    "Works entirely offline in your browser",
  ],
  faqs: [
    {
      question: "Why did my browser ask for permission?",
      answer:
        "Reading the clipboard requires explicit permission, which your browser prompts for on first use. If you decline, you can still paste directly into the text box instead.",
    },
    {
      question: "Does this only work with text?",
      answer:
        "Yes, this inspects text clipboard content. Images and other clipboard formats aren't read or displayed.",
    },
    {
      question: "Is my clipboard content sent anywhere?",
      answer:
        "No. It's read and analyzed entirely in your browser. Nothing is transmitted.",
    },
  ],
  relatedTools: ["browser-information", "user-agent-parser"],
  isNew: true,
}

export default meta
