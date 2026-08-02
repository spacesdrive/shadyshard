import { Crop } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "pdf-margin-cropper",
  title: "PDF Margin Cropper",
  description:
    "Trim the white margins off every PDF page so the text fills the screen on an e-reader or tablet.",
  longDescription:
    "A paper-sized PDF read on a six inch e-reader wastes most of the screen on margins, which is why the text ends up too small. This trims a chosen amount off each edge of every page and saves a new PDF. Detect margins scans a rendered page for where the content actually starts and fills the four values in for you, so you do not have to guess. Both the crop box and the media box are narrowed, because readers disagree about which one they honour and setting only one can leave the old margins visible. The established tools for this are desktop applications; this one runs entirely in your browser and never uploads the file.",
  category: "pdf",
  keywords: [
    "crop pdf margins",
    "remove white space from pdf",
    "pdf for kindle margins",
    "trim pdf borders",
    "resize pdf page content",
  ],
  tags: ["pdf", "crop", "margins", "ereader", "kindle", "print"],
  icon: Crop,
  features: [
    "Detects the content area automatically from a rendered page",
    "Separate top, right, bottom, and left trim values in millimetres",
    "Live preview of the crop against the first page",
    "Sets both the crop box and the media box so every reader honours it",
    "Runs on your device with no upload",
  ],
  faqs: [
    {
      question: "How does automatic detection work?",
      answer:
        "The chosen page is rendered to a canvas in your browser and scanned inward from each edge until a pixel that is not background is found. That boundary, plus a small safety pad, becomes the trim value. It works well on text pages and less well on pages with a full-bleed background image, where there is no white margin to find.",
    },
    {
      question: "Does cropping delete the content in the margins?",
      answer:
        "No. Cropping narrows the visible page box, so anything outside it stops being displayed but is still in the file. That is why the operation is reversible and why the file size barely changes. Use the PDF Metadata Remover if you need content genuinely gone rather than hidden.",
    },
    {
      question: "Can I crop different amounts on different pages?",
      answer:
        "The trim values are applied to every page, which is what you want for a document with a consistent layout. For a file where odd and even pages have mirrored margins, split it, crop each half, and merge the result back with the PDF Merge tool.",
    },
    {
      question: "Is my PDF uploaded to crop it?",
      answer:
        "No. The file is read, rendered for the preview, and rewritten entirely in your browser. Nothing is sent anywhere, which matters for the scanned books, papers, and internal reports this is usually used on.",
    },
  ],
  relatedTools: ["pdf-n-up", "pdf-split", "pdf-merge", "pdf-to-images"],
}

export default meta
