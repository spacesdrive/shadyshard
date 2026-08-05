import { EyeOff } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "image-redactor",
  title: "Image Redactor",
  description:
    "Black out, blur, or pixelate parts of a screenshot before you share it, without uploading the file.",
  longDescription:
    "Screenshots leak more than people expect: an account number in a sidebar, a colleague's email in a notification, a licence key in a title bar. Drag a box over anything that should not be public and choose how to hide it. A black box removes the pixels outright, which is the only option that is genuinely irreversible; blur and pixelate are offered because they look better in a blog post, with a plain warning that both can sometimes be undone by software. The image is decoded, edited, and re-encoded on a canvas in your browser, so the original never leaves your machine, and the exported PNG carries no EXIF metadata because canvas re-encoding does not preserve it.",
  category: "image",
  keywords: [
    "redact screenshot online",
    "blur part of an image",
    "pixelate sensitive information",
    "black out text in a picture",
    "hide personal data in screenshot",
  ],
  tags: ["image", "redact", "blur", "pixelate", "privacy"],
  icon: EyeOff,
  isNew: true,
  features: [
    "Drag to select any area, or enter exact coordinates for keyboard use",
    "Black box, blur, and pixelate modes with adjustable strength",
    "Undo the last region or clear them all",
    "Exports a PNG with EXIF metadata dropped",
    "Runs entirely in the browser, with no upload",
  ],
  faqs: [
    {
      question: "Which redaction mode is actually safe?",
      answer:
        "The black box. It replaces the pixels with solid colour, so the original values are gone from the exported file. Blur and pixelate transform the pixels rather than discarding them, and text hidden that way has been recovered before, particularly at low strengths over small fonts.",
    },
    {
      question: "Does the exported image still contain the hidden data?",
      answer:
        "No. The export is a fresh PNG drawn from the edited canvas, not the original file with an overlay on top. There is no layer to remove and no original underneath, which is the failure mode of redacting inside a document editor.",
    },
    {
      question: "Is my screenshot uploaded anywhere?",
      answer:
        "No. The file is read with the browser's File API and drawn to a canvas locally. No network request is made with the image, which is the reason to use a local tool for this rather than a hosted editor.",
    },
    {
      question: "Can I redact without using a mouse?",
      answer:
        "Yes. The coordinates panel lets you type the left, top, width, and height of a region in pixels and add it from the keyboard, and each region in the list can be removed with its own button.",
    },
  ],
}

export default meta
