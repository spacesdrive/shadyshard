import { Signature } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "signature-pad",
  title: "Signature Pad",
  description:
    "Draw a signature with a mouse, trackpad, or finger and download it as a transparent PNG.",
  longDescription:
    "Sign with a pointer or touchscreen, adjust the pen thickness and ink color, and export the result as a PNG with either a transparent or a white background. A transparent PNG drops cleanly onto a contract, a form, or a slide without a white box around it. The drawing lives only in a canvas element in this page, so your signature is never uploaded, stored, or shared, which is the main reason to avoid the sign-up-required signing services for this one small step.",
  category: "image",
  keywords: [
    "signature pad online",
    "draw signature png",
    "transparent signature image",
    "create signature for documents",
    "handwritten signature generator",
  ],
  tags: ["signature", "image", "png", "draw", "canvas"],
  icon: Signature,
  features: [
    "Draw with mouse, trackpad, stylus, or finger",
    "Adjustable pen thickness and ink color",
    "Transparent or white background on export",
    "Undo the last stroke or clear the whole pad",
    "Nothing leaves your browser",
  ],
  faqs: [
    {
      question: "Is my signature uploaded or stored anywhere?",
      answer:
        "No. The strokes are drawn onto a canvas element in this page and exported with the browser's own PNG encoder. Nothing is transmitted, and closing the tab discards it.",
    },
    {
      question: "Why choose a transparent background?",
      answer:
        "A transparent PNG lets the page or slide behind the signature show through, so it looks like ink on the document instead of a pasted white rectangle. Use the white background only if the software you are pasting into cannot handle transparency.",
    },
    {
      question: "Can I sign on a phone or tablet?",
      answer:
        "Yes. The pad uses pointer events, so drawing with a finger or a stylus works the same way as a mouse.",
    },
    {
      question: "Is a drawn signature legally binding?",
      answer:
        "That depends entirely on your jurisdiction and the document. This tool produces an image; it makes no claim about the legal status of that image and is not a substitute for legal advice.",
    },
  ],
  isNew: true,
}

export default meta
