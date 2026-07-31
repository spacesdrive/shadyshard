import { FileArchive } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "gzip-size-calculator",
  title: "Gzip Size Calculator",
  description:
    "Measure how small a file or snippet becomes after gzip and deflate compression, with the saving shown as a percentage.",
  longDescription:
    "Paste code, JSON, or markup, or drop in a build artifact, and see the real compressed size next to the raw size. The numbers come from the browser's own Compression Streams API running the actual gzip and deflate algorithms, not from an estimate or a rule of thumb, which matters because compressed size is what a visitor actually downloads and what a bundle size budget is normally written against. Comparing two versions of the same file is the usual reason to reach for this: a change that adds 4 KB of repetitive markup often adds only a few hundred bytes once compressed. Nothing is uploaded, so an unreleased bundle can be measured safely.",
  category: "developer",
  keywords: [
    "gzip size calculator",
    "compressed file size checker",
    "gzip compression ratio",
    "bundle size gzip",
    "deflate size",
  ],
  tags: ["gzip", "deflate", "compression", "bundle", "performance", "size"],
  icon: FileArchive,
  isNew: true,
  features: [
    "Real gzip and deflate compression via the browser Compression Streams API",
    "Accepts pasted text or a dropped file of any type",
    "Shows raw size, compressed size, saving percentage, and compression ratio",
    "Compares gzip, deflate, and raw deflate side by side",
    "Runs locally, so an unreleased build can be measured without uploading it",
  ],
  faqs: [
    {
      question: "Is this the same gzip my web server uses?",
      answer:
        "It is the same DEFLATE algorithm in the same gzip container, run by the browser itself. A server may pick a different compression level, so its output can differ by a small margin, but the figure here is a realistic measurement rather than an estimate.",
    },
    {
      question: "Why is compressed size a better measure than file size?",
      answer:
        "Text served over HTTP is normally compressed in transit, so the compressed size is what a visitor waits for. Repetitive code compresses far better than dense code, which is why two files of the same raw size can have very different real costs.",
    },
    {
      question: "Can it measure Brotli compression too?",
      answer:
        "No. The browser Compression Streams API provides gzip, deflate, and raw deflate only, and there is no Brotli option available to a page. As a rough guide Brotli usually lands 10 to 20 percent below gzip on the same text.",
    },
    {
      question: "Is my file uploaded to measure it?",
      answer:
        "No. The file is read with the browser File API and compressed in memory on your device. No part of it is sent to a server.",
    },
  ],
}

export default meta
