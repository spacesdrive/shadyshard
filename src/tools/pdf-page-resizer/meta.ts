import { Scaling } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "pdf-page-resizer",
  title: "PDF Page Resizer",
  description:
    "Rescale every page of a PDF to A4, Letter, or another standard size without cropping the content.",
  longDescription:
    "A document laid out for US Letter prints with the wrong margins on A4, and a mixed-size PDF confuses a printer entirely. This redraws every page onto a page of the size you choose, scaling the content to match rather than just relabelling the page box, which is what makes the difference between a file that prints correctly and one the printer shrinks again on its way out. Fit keeps the original proportions and centres the page, leaving even margins; stretch fills the new size exactly and distorts the content, which is occasionally what you want for a scanned form. Everything happens in your browser through pdf-lib, so contracts and reports are never uploaded.",
  category: "pdf",
  keywords: [
    "resize pdf pages",
    "change pdf page size to a4",
    "convert pdf letter to a4",
    "scale pdf pages without upload",
    "pdf page size converter",
  ],
  tags: ["pdf", "resize", "a4", "letter", "print", "page-size"],
  icon: Scaling,
  features: [
    "A3, A4, A5, US Letter, US Legal, and Tabloid presets",
    "Automatic, portrait, or landscape orientation per page",
    "Fit keeps proportions and centres; stretch fills the page exactly",
    "Normalises a PDF whose pages are currently different sizes",
    "Runs on your device, with no upload and no page limit",
  ],
  faqs: [
    {
      question: "Does resizing change the file size?",
      answer:
        "Only slightly, and not in the way compression does. The page content is drawn onto new pages at a different scale, so the same objects are still embedded. To make a file smaller, use a compression tool instead.",
    },
    {
      question: "What does automatic orientation do?",
      answer:
        "It keeps each page in the orientation it already has, so a document where one page is landscape stays that way rather than being rotated to match the rest. Choose portrait or landscape to force every page to the same orientation.",
    },
    {
      question: "Why do I get white margins after resizing?",
      answer:
        "Fit mode preserves the original aspect ratio, so changing from a proportionally wider size to a narrower one leaves even bands at the top and bottom, or at the sides. That is deliberate, since the alternative is either cropping content or distorting it. Stretch mode removes the margins by distorting the page.",
    },
    {
      question: "Can it handle a password-protected PDF?",
      answer:
        "No. A PDF encrypted with a password cannot be read in the browser without decrypting it first, and this tool reports that rather than producing a broken file.",
    },
  ],
}

export default meta
