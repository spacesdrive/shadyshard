import { Crop } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "image-cropper",
  title: "Image Cropper",
  description: "Crop an image by dragging a selection box, right in your browser.",
  longDescription:
    "Drop in an image, drag to select the area you want to keep, and crop it. Cropping happens with the Canvas API entirely on your device - the image is never uploaded.",
  category: "image",
  keywords: [
    "image cropper",
    "crop image online",
    "photo cropper",
    "crop picture",
    "image crop tool",
  ],
  tags: ["image", "crop", "edit"],
  icon: Crop,
  features: [
    "Drag to select the crop area",
    "Pixel-accurate crop mapped to the image's real resolution",
    "Live preview of the cropped result",
    "Drag-and-drop or click-to-browse upload",
    "Runs entirely in your browser - the image is never uploaded",
  ],
  faqs: [
    {
      question: "Can I adjust the selection after drawing it?",
      answer:
        "Drag a new selection at any time before cropping - each drag replaces the previous selection.",
    },
    {
      question: "What format is the cropped image saved as?",
      answer:
        "The cropped result keeps the original file's format (for example, a JPG stays a JPG).",
    },
    {
      question: "Is my image uploaded anywhere?",
      answer:
        "No. Cropping uses the Canvas API entirely on your device. The image never leaves your computer.",
    },
  ],
  relatedTools: ["image-resizer", "image-compressor"],
  isNew: true,
}

export default meta
