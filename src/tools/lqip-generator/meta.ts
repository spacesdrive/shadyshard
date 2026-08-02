import { ImageDown } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "lqip-generator",
  title: "LQIP Placeholder Generator",
  description:
    "Turn an image into a tiny blurred base64 placeholder to show while the full image loads.",
  longDescription:
    "A low quality image placeholder is a heavily downscaled copy of an image, small enough to inline as a data URI, shown blurred behind the real image until it arrives. It removes the empty box and the layout jump that a lazy-loaded image otherwise causes. Drop an image here and you get the data URI, the dominant color, and ready-made CSS, HTML, and Next.js blurDataURL snippets, with a live preview of the blur so you can judge the size and quality before committing. The usual way to produce these is a build plugin or an image CDN. This does it in your browser from the image itself, so nothing is uploaded.",
  category: "image",
  keywords: [
    "lqip generator",
    "blurred image placeholder",
    "base64 image placeholder",
    "blurdataurl generator",
    "low quality image placeholder",
  ],
  tags: ["image", "lqip", "placeholder", "base64", "performance", "lazy loading"],
  icon: ImageDown,
  isNew: true,
  features: [
    "Adjustable placeholder width and JPEG quality with a live byte count",
    "Data URI, CSS background, HTML, and Next.js blurDataURL snippets",
    "Dominant color extracted as a single-color fallback",
    "Side by side preview of the blurred placeholder and the full image",
    "Runs on your device with no upload",
  ],
  faqs: [
    {
      question: "How small should the placeholder be?",
      answer:
        "Aim for under about 1 KB, which usually means a width between 16 and 32 pixels at moderate quality. Past that the placeholder starts costing more than the perceived improvement is worth, and because it is inlined in the HTML rather than fetched, every byte is on the critical path.",
    },
    {
      question: "Why is the placeholder blurred?",
      answer:
        "At this size the image is only a handful of pixels wide, so scaling it up produces visible blocks. A CSS blur filter smooths those into a soft impression of the final image, which is what makes the technique read as intentional rather than broken.",
    },
    {
      question: "What is blurDataURL for?",
      answer:
        "It is the property Next.js Image accepts when placeholder is set to blur. Supplying a data URI there gives you the same effect for images that Next.js cannot generate a placeholder for automatically, which is anything not imported statically at build time.",
    },
    {
      question: "Is my image uploaded?",
      answer:
        "No. The image is drawn to a canvas and re-encoded entirely in your browser, so an unreleased product photo or client asset never leaves your machine.",
    },
  ],
}

export default meta
