import { Gauge } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "gzip-size-calculator",
  title: "Gzip Size Calculator",
  description:
    "Measure how small a file or snippet gets after gzip, deflate, and raw deflate.",
  longDescription:
    "Paste code or drop a build artifact to see its real over-the-wire size. Raw byte count is a poor proxy for what a visitor downloads, because servers compress text assets before sending them, and the compression ratio varies enormously with how repetitive the content is. This tool compresses the input with the browser's own Compression Streams API, the same algorithms a server uses, and reports raw, gzip, deflate, and raw deflate sizes side by side. Set a budget in kilobytes to check a bundle against a performance budget without running a build. Nothing is uploaded.",
  category: "developer",
  keywords: [
    "gzip size calculator",
    "compressed file size checker",
    "check bundle size gzip",
    "deflate size online",
    "performance budget checker",
  ],
  tags: ["gzip", "compression", "bundle", "performance", "size", "deflate"],
  icon: Gauge,
  isNew: true,
  features: [
    "Gzip, deflate, and raw deflate sizes measured in one pass",
    "Compression ratio and bytes saved for each algorithm",
    "Optional kilobyte budget with a pass or fail verdict",
    "Accepts pasted text or a dropped file of any type",
    "Uses the browser Compression Streams API, so nothing is uploaded",
  ],
  faqs: [
    {
      question: "Does this match the gzip size my server or CI reports?",
      answer:
        "It will be very close but not always byte-identical. Compression Streams uses the browser's zlib at its default level, while a server or build tool may use a different level or a different implementation. Treat the number as an accurate estimate for budgeting, not as a byte-exact reproduction of one specific toolchain.",
    },
    {
      question: "Why is Brotli not included?",
      answer:
        "Browsers can decompress Brotli but expose no API for compressing with it, and shipping a Brotli encoder would mean adding a large dependency for one number. Gzip remains the useful comparison point because it is what almost every host falls back to.",
    },
    {
      question: "What is the difference between deflate and raw deflate?",
      answer:
        "Deflate wraps the compressed data in a zlib header and checksum, raw deflate omits both, and gzip uses a slightly larger header of its own. On anything above a few kilobytes the three sizes are nearly identical, since the header is a fixed handful of bytes.",
    },
    {
      question: "Is my file uploaded to measure it?",
      answer:
        "No. The file is read locally with the File API and compressed in the page. No request is made and nothing is retained after you close the tab.",
    },
  ],
}

export default meta
