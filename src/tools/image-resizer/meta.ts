import { Maximize2 } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "image-resizer",
  title: "Image Resizer",
  description:
    "Resize an image to exact dimensions, with an optional locked aspect ratio.",
  longDescription:
    "Drop in an image and set a new width and height, with an aspect-ratio lock so you can resize proportionally with a single number. Resizing happens with the Canvas API entirely in your browser.",
  category: "image",
  keywords: [
    "image resizer",
    "resize image online",
    "change image dimensions",
    "resize photo",
    "image size changer",
  ],
  tags: ["image", "resize", "dimensions"],
  icon: Maximize2,
  features: [
    "Exact pixel width and height",
    "Optional locked aspect ratio",
    "Live preview at the new dimensions",
    "Drag-and-drop or click-to-browse upload",
    "Runs entirely in your browser - the image is never uploaded",
  ],
  faqs: [
    {
      question: "Does resizing reduce file size too?",
      answer:
        "Usually yes - smaller dimensions generally produce a smaller file, though for fine-grained file size control, pair this with Image Compressor's quality slider.",
    },
    {
      question: "What happens if I unlock the aspect ratio?",
      answer:
        "You can set width and height independently, which will stretch or squash the image if the ratio doesn't match the original.",
    },
    {
      question: "Is my image uploaded anywhere?",
      answer:
        "No. Resizing uses the Canvas API entirely on your device. The image never leaves your computer.",
    },
  ],
  relatedTools: ["image-compressor", "image-cropper"],
  isNew: true,
}

export default meta
