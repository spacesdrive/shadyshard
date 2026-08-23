import { QrCode } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "bulk-qr-code-generator",
  title: "Bulk QR Code Generator",
  description:
    "Generate a QR code for every line of a list or CSV, then download the whole set as a printable PDF sheet.",
  longDescription:
    "Event badges, asset tags, shelf labels, and table cards all need the same QR code repeated with a different value each time, which is tedious one code at a time. Paste a list, one value per line, or a two-column CSV where the second column is the caption printed under each code, and every code is generated at once. The whole set downloads as a PDF laid out for printing, with each code labelled, and any single code can be saved as a PNG on its own. Every free bulk generator caps the batch somewhere, usually between 100 and 500, because each code costs them server time. Here the codes are drawn in your browser, so the only limit is how long you are willing to wait, and the values never leave your device.",
  category: "qr",
  keywords: [
    "bulk qr code generator",
    "qr codes from csv list",
    "batch qr code printable sheet",
    "generate many qr codes at once",
    "qr code labels for inventory",
  ],
  tags: ["qr", "bulk", "csv", "labels", "printing", "generator"],
  icon: QrCode,
  isNew: true,
  features: [
    "One QR code per line, or a two-column CSV where the second column is the caption",
    "Downloads the whole batch as a print-ready PDF sheet with captions",
    "Individual codes downloadable as PNG",
    "Adjustable size and error correction level for the whole batch",
    "No batch cap and no account, because the codes are generated on your device",
  ],
  faqs: [
    {
      question: "What format should the list be in?",
      answer:
        "One value per line is enough. To caption the codes, put the value first, a comma, then the caption, as in https://example.com/a,Table 1. Values containing a comma should be wrapped in double quotes, the same as in any CSV.",
    },
    {
      question: "Which error correction level should I use?",
      answer:
        "Level M is a sensible default. Move up to Q or H when the codes will be printed small, stuck on a curved surface, or likely to get scuffed, since a higher level lets more of the code be damaged before it stops scanning. Higher levels make the code denser, so print it larger to compensate.",
    },
    {
      question: "How many codes can it generate?",
      answer:
        "There is no fixed cap. Several hundred codes generate in a few seconds; a few thousand will take longer and use a noticeable amount of memory, since every code is drawn and held in the page. Split a very large batch if the tab becomes slow.",
    },
    {
      question: "Are my URLs or codes sent anywhere?",
      answer:
        "No. The codes are drawn on a canvas in your browser and the PDF is assembled there too. This matters for batches that encode order numbers, ticket identifiers, or unlisted links.",
    },
  ],
}

export default meta
