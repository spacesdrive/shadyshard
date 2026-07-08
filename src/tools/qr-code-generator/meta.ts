import { QrCode } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "qr-code-generator",
  title: "QR Code Generator",
  description:
    "Generate a QR code from any text or URL, with adjustable size and error correction.",
  longDescription:
    "Type or paste any text or URL to generate a QR code instantly, with adjustable size and error correction level. Generation happens locally using the qrcode library - nothing you type is sent anywhere.",
  category: "qr",
  keywords: [
    "qr code generator",
    "generate qr code",
    "qr code maker",
    "free qr code generator",
    "url to qr code",
  ],
  tags: ["qr code", "generator", "url"],
  icon: QrCode,
  features: [
    "Works with any text, URL, or short message",
    "Adjustable size and error correction level",
    "Download as PNG",
    "Live preview as you type",
    "Runs entirely in your browser",
  ],
  faqs: [
    {
      question: "Is my data sent anywhere?",
      answer:
        "No. The QR code is generated entirely in your browser using a local JavaScript library. Nothing you type is transmitted anywhere.",
    },
    {
      question: "What does error correction level do?",
      answer:
        "Higher error correction (H) makes the QR code more resistant to damage or partial obstruction, at the cost of a denser pattern. Low (L) produces a simpler pattern but is less fault-tolerant.",
    },
    {
      question: "Is there a limit to how much text I can encode?",
      answer:
        "QR codes can hold up to a few thousand characters depending on error correction level, but very long text produces a dense, harder-to-scan code - short URLs or messages work best.",
    },
  ],
  relatedTools: ["qr-code-scanner", "url-encoder-decoder"],
  isNew: true,
}

export default meta
