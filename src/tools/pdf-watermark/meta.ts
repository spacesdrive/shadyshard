import { Stamp } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "pdf-watermark",
  title: "PDF Watermark",
  description:
    "Stamp text such as DRAFT or CONFIDENTIAL across the pages of a PDF with adjustable size, angle, color, and opacity.",
  longDescription:
    "Add a diagonal or horizontal text watermark to every page of a PDF, or only to the pages you name. Font size, rotation, color, and opacity are all adjustable, so the mark can be a faint background wash or a bold notice. Because the whole thing runs on pdf-lib inside your browser, a contract, invoice, or unreleased report never leaves your machine, which is the part most free online watermark services cannot offer.",
  category: "pdf",
  keywords: [
    "pdf watermark",
    "add watermark to pdf free",
    "stamp confidential on pdf",
    "watermark pdf without upload",
    "draft watermark pdf",
  ],
  tags: ["pdf", "watermark", "stamp", "document", "privacy"],
  icon: Stamp,
  features: [
    "Watermark all pages or a specific page range",
    "Adjustable font size, rotation, color, and opacity",
    "Works on any unencrypted PDF",
    "Downloads a new file, leaving the original untouched",
    "Runs entirely in your browser with no upload",
  ],
  faqs: [
    {
      question: "Is my PDF uploaded to add the watermark?",
      answer:
        "No. The file is read with the File API and rewritten by pdf-lib inside your browser. Nothing is transmitted, which makes this safe for confidential documents.",
    },
    {
      question: "Can the watermark be removed afterwards?",
      answer:
        "A text watermark added this way is drawn into each page's content stream, so it is not a separate layer you can toggle off in a reader. It can still be removed by anyone with a full PDF editor, so treat it as a visible notice rather than as protection.",
    },
    {
      question: "Why can I only use plain characters?",
      answer:
        "The watermark uses a standard PDF font, which covers the Latin alphabet, digits, and common punctuation. Characters outside that set, including most non-Latin scripts and emoji, cannot be encoded and will be reported as an error.",
    },
    {
      question: "Does this work on a password-protected PDF?",
      answer:
        "No. An encrypted PDF cannot be read without its password, and the tool reports that clearly instead of producing a broken file.",
    },
  ],
}

export default meta
