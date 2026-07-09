import { Weight } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "file-size-analyzer",
  title: "File Size Analyzer",
  description:
    "Drop in multiple files to see each one's size plus a total, average, and largest file.",
  longDescription:
    "Drop in one or more files to see each file's exact size alongside summary statistics: total combined size, average size, and the largest file in the batch. Useful for quickly checking whether a set of files fits within an upload limit before you try. Runs entirely in your browser - files are read for their size only, never uploaded.",
  category: "security",
  keywords: [
    "file size analyzer",
    "check file size online",
    "total size of multiple files",
    "batch file size checker",
    "file size calculator",
  ],
  tags: ["file size", "batch", "analyze", "inspect"],
  icon: Weight,
  features: [
    "Shows exact size per file in bytes, KB, or MB",
    "Total, average, and largest-file summary for a batch",
    "Works with any number of files at once",
    "Runs entirely offline in your browser",
  ],
  faqs: [
    {
      question: "Do the files get uploaded anywhere to check their size?",
      answer:
        "No. A file's size is available from the browser's File API the moment it's selected, without reading or uploading its contents.",
    },
  ],
  relatedTools: ["file-hash-generator", "mime-type-inspector", "image-compressor"],
  isNew: true,
}

export default meta
