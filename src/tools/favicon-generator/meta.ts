import { Grid2x2 } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "favicon-generator",
  title: "Favicon Generator",
  description:
    "Generate every standard favicon size from one image, right in your browser.",
  longDescription:
    "Drop in a square logo or icon to generate every commonly needed favicon size - 16x16, 32x32, 48x48, 180x180 (Apple touch icon), 192x192, and 512x512 - each downloadable individually. Resizing uses the Canvas API entirely on your device.",
  category: "image",
  keywords: [
    "favicon generator",
    "favicon maker",
    "generate favicon online",
    "apple touch icon generator",
    "png favicon sizes",
  ],
  tags: ["image", "favicon", "icon", "generator"],
  icon: Grid2x2,
  features: [
    "Generates 16x16, 32x32, 48x48, 180x180, 192x192, and 512x512 PNGs",
    "Live preview of every size at once",
    "Individual download button per size",
    "Runs entirely in your browser - the image is never uploaded",
    "Works best starting from a square source image",
  ],
  faqs: [
    {
      question: "What source image works best?",
      answer:
        "A square image (equal width and height) works best - non-square images will be stretched to fit each square favicon size.",
    },
    {
      question: "Which sizes do I actually need?",
      answer:
        "16x16 and 32x32 cover browser tabs, 180x180 is Apple's touch icon size for iOS home screens, and 192x192/512x512 cover Android/PWA manifest icons. Most sites use all of them.",
    },
    {
      question: "Is my image uploaded anywhere?",
      answer:
        "No. Every size is generated with the Canvas API entirely on your device. The image never leaves your computer.",
    },
  ],
  relatedTools: ["image-resizer", "svg-optimizer"],
  isNew: true,
}

export default meta
