import { FileMinus } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "pdf-metadata-remover",
  title: "PDF Metadata Remover",
  description: "Strip title, author, subject, keywords, and other metadata from a PDF.",
  longDescription:
    "Upload a PDF to remove its embedded document metadata - title, author, subject, keywords, creator, and producer - before sharing it. Useful when a PDF's metadata reveals more than you want it to (the software or account it was created with, an internal document title, and so on). To see what metadata a PDF has before removing it, use the PDF Metadata Viewer. Runs entirely in your browser via pdf-lib.",
  category: "pdf",
  keywords: [
    "remove pdf metadata",
    "strip pdf author",
    "clean pdf metadata",
    "anonymize pdf",
    "pdf metadata scrubber",
  ],
  tags: ["pdf", "metadata", "privacy", "document"],
  icon: FileMinus,
  features: [
    "Clears title, author, subject, keywords, creator, and producer",
    "Leaves page content completely unchanged",
    "Runs entirely offline in your browser",
  ],
  faqs: [
    {
      question: "Does this remove everything that could identify a PDF's origin?",
      answer:
        "It clears the standard document metadata fields (title, author, subject, keywords, creator, producer). It does not attempt to detect or remove other identifying signals sometimes embedded in a PDF's structure, such as hidden XMP metadata blocks some producers add outside these standard fields.",
    },
    {
      question: "Will this change how my PDF looks?",
      answer:
        "No. Only the document metadata is cleared - all page content stays identical.",
    },
  ],
  relatedTools: ["pdf-metadata-viewer", "exif-remover", "pdf-compressor"],
  isNew: true,
}

export default meta
