import { Ratio } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "aspect-ratio-calculator",
  title: "Aspect Ratio Calculator",
  description:
    "Work out the missing width or height for a given aspect ratio, and see the simplified ratio for any dimensions.",
  longDescription:
    "Enter the dimensions you are working from and the tool reduces them to a simplified aspect ratio, then solves for the missing side when you set a new width or a new height. It is the calculation behind resizing a hero image without distortion, exporting a video at a different resolution, and checking whether a crop matches a platform's requirements. Presets cover the common ratios, and everything is calculated in your browser.",
  category: "math",
  keywords: [
    "aspect ratio calculator",
    "resize keeping aspect ratio",
    "16:9 resolution calculator",
    "image proportion calculator",
    "pixel dimensions calculator",
  ],
  tags: ["aspect ratio", "calculator", "image", "video", "dimensions", "design"],
  icon: Ratio,
  isNew: true,
  features: [
    "Simplified ratio and decimal ratio from any width and height",
    "Solve for the missing width or height in either direction",
    "Presets for 16:9, 4:3, 3:2, 1:1, 21:9, 9:16, and 2:3",
    "Optional rounding to whole pixels",
    "Proportional preview of the resulting shape",
  ],
  faqs: [
    {
      question: "What does an aspect ratio like 16:9 mean?",
      answer:
        "It is the width divided by the height, reduced to the smallest whole numbers. A 1920 by 1080 image is 16:9 because both sides divide by 120, and any other 16:9 size has the same shape at a different scale.",
    },
    {
      question: "Why do my calculated dimensions come out with decimals?",
      answer:
        "Because not every target size divides evenly by the ratio. With rounding on, the result is the nearest whole pixel, which can be a fraction of a pixel off the exact ratio. That difference is invisible in practice but will show up if you compare the ratio numbers directly.",
    },
    {
      question: "Which ratio should I use for social video?",
      answer:
        "Vertical feeds and stories generally use 9:16, square posts use 1:1, and standard landscape video is 16:9. Check the platform's current specification before an important upload, since these change.",
    },
    {
      question: "Does this resize my image?",
      answer:
        "No, it only calculates dimensions. Use the Image Resizer to actually resize a file, which also happens locally in your browser.",
    },
  ],
  relatedTools: ["image-resizer", "image-cropper", "percentage-calculator"],
}

export default meta
