import { FileMinus2 } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "pdf-split",
  title: "PDF Split",
  description:
    "Split a PDF into multiple smaller PDFs, a fixed number of pages at a time.",
  longDescription:
    "Upload a PDF and choose how many pages each output file should contain - the tool splits it into that many separate PDFs in order, each downloadable individually. To pull out one specific set of pages instead of splitting the whole file, use the PDF Page Extractor. Everything runs locally using pdf-lib; your file is never uploaded.",
  category: "pdf",
  keywords: [
    "split pdf",
    "split pdf into pages",
    "divide pdf file",
    "pdf splitter online",
    "break pdf into parts",
  ],
  tags: ["pdf", "split", "pages", "document"],
  icon: FileMinus2,
  features: [
    "Split by a fixed number of pages per file",
    "Download each resulting file individually",
    "Works with PDFs of any page count",
    "Runs entirely offline in your browser",
  ],
  faqs: [
    {
      question: "How is this different from the PDF Page Extractor?",
      answer:
        'Split divides an entire PDF into multiple sequential files of a fixed page count. Page Extractor pulls out one specific set of pages you choose (e.g. "1-3, 7") into a single output file.',
    },
    {
      question: "Can I download all the split files at once?",
      answer:
        "Each split file has its own download button. There's no zip bundling, since that would add a dependency for a convenience most users only need occasionally - download the ones you need individually.",
    },
  ],
  relatedTools: ["pdf-page-extractor", "pdf-merge", "pdf-page-counter"],
  isNew: true,
}

export default meta
