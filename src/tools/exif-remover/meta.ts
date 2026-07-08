import { Eraser } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "exif-remover",
  title: "EXIF Remover",
  description:
    "Strip EXIF metadata, like GPS location and camera details, from a photo before sharing it.",
  longDescription:
    "Drop in a photo to remove its EXIF metadata - camera make and model, GPS coordinates, timestamps, and other embedded data phones and cameras attach to photos. The image is re-encoded through the Canvas API, which strips EXIF as a side effect, entirely on your device.",
  category: "image",
  keywords: [
    "exif remover",
    "remove exif data",
    "strip metadata from photo",
    "remove gps location from photo",
    "exif data eraser",
  ],
  tags: ["image", "exif", "privacy", "metadata"],
  icon: Eraser,
  features: [
    "Strips camera, GPS, and timestamp metadata",
    "Runs entirely in your browser - the photo is never uploaded",
    "Drag-and-drop or click-to-browse upload",
    "Instant download of the cleaned file",
    "Especially useful before sharing photos publicly",
  ],
  faqs: [
    {
      question: "Why would I want to remove EXIF data?",
      answer:
        "Photos from phones and cameras often embed GPS coordinates, the exact device model, and a timestamp. Sharing a photo publicly can unintentionally reveal your location or other details through this metadata.",
    },
    {
      question: "How does this actually remove the metadata?",
      answer:
        "The photo is redrawn onto an HTML canvas and re-exported as a new file. Canvas re-encoding does not carry EXIF metadata over, so the output file has none.",
    },
    {
      question: "Is my photo uploaded anywhere?",
      answer:
        "No. Processing happens entirely in your browser using the Canvas API. The photo never leaves your device.",
    },
  ],
  relatedTools: ["image-compressor", "image-resizer"],
  isNew: true,
}

export default meta
