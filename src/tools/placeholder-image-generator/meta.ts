import { Frame } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "placeholder-image-generator",
  title: "Placeholder Image Generator",
  description:
    "Create a sized placeholder image with custom colours and label, and download it.",
  longDescription:
    "Mockups and prototypes need images before the real ones exist. The usual answer is a hosted placeholder service, which means every prototype view makes a request to a third party, breaks when you work offline, and stops working entirely when that service goes down or starts charging. This generator draws the placeholder on a canvas in your browser and hands you a real file instead. Choose the dimensions, background and text colours, and label, pick a common preset such as an Open Graph card or a hero banner, and download it as PNG, JPEG, or WebP.",
  category: "image",
  keywords: [
    "placeholder image generator",
    "dummy image maker",
    "create placeholder png",
    "mockup image generator",
    "offline placeholder images",
  ],
  tags: ["placeholder", "image", "mockup", "dummy", "prototype", "canvas"],
  icon: Frame,
  features: [
    "Any dimensions up to 4096 pixels on each side",
    "Presets for Open Graph cards, favicons, avatars, and hero banners",
    "Custom background colour, text colour, and label",
    "Exports as PNG, JPEG, or WebP with a live preview",
    "Generates the file locally, so no third-party image host is involved",
  ],
  faqs: [
    {
      question: "Why generate a placeholder file instead of using a hosted service?",
      answer:
        "A hosted placeholder adds a third-party request to every page view of your prototype, fails when you are offline or behind a strict network, and leaves you with broken images if the service disappears. A downloaded file has none of those failure modes.",
    },
    {
      question: "What does the label show by default?",
      answer:
        "The dimensions, written as width by height, which is what makes a placeholder useful when you are checking that a layout reserves the right space. Replace it with any text you like, or clear it for a plain colour block.",
    },
    {
      question: "Which format should I pick?",
      answer:
        "PNG for flat colour blocks, which compresses them very well and stays sharp. JPEG only if you need a small file and a photo-like result. WebP is smaller than both and is supported by every current browser, so it is a good default for a prototype that only you will open.",
    },
    {
      question: "Is anything uploaded?",
      answer:
        "No. The image is drawn on a canvas in your browser and the download comes straight from that canvas, so no request leaves the page.",
    },
  ],
}

export default meta
