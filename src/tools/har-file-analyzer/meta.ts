import { Activity } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "har-file-analyzer",
  title: "HAR File Analyzer",
  description:
    "Summarise a HAR network capture: slowest requests, largest responses, and status codes.",
  longDescription:
    "Open a HAR file exported from your browser's network panel to see request counts, transfer size, status code and content type breakdowns, and the slowest and largest entries. HAR captures normally contain cookies and authorization headers, so this analyzer parses the file entirely in your browser and never uploads it.",
  category: "developer",
  keywords: [
    "har file analyzer",
    "har viewer online",
    "network waterfall analysis",
    "slow request debugging",
  ],
  tags: ["har", "network", "performance", "debugging", "developer"],
  icon: Activity,
  features: [
    "Totals for requests, transfer size, and wall-clock capture time",
    "Breakdown by HTTP status code and by content type",
    "Slowest requests and largest responses, ranked",
    "Counts entries that carry cookies or authorization headers",
  ],
  faqs: [
    {
      question: "Is it safe to analyse a HAR file here?",
      answer:
        "Yes. The file is read with the browser File API and parsed in page memory only. Nothing is uploaded, which matters because HAR exports usually include session cookies and authorization headers.",
    },
    {
      question: "Where do I get a HAR file?",
      answer:
        "In Chrome, Edge, or Firefox, open DevTools, go to the Network panel, reproduce the problem, then use the export or save-all-as-HAR action.",
    },
    {
      question: "Why is the transferred size smaller than the content size?",
      answer:
        "Transferred size is what came over the wire after compression, while content size is the decompressed body. A large gap usually means the response was gzip or brotli encoded.",
    },
  ],
  isNew: true,
}

export default meta
