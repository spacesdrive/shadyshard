import { FileImage } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "image-to-base64",
  title: "Image to Base64",
  description:
    "Encode an image as a Base64 data URI ready to paste into HTML, CSS, JSON, or Markdown.",
  longDescription:
    "Drop in a PNG, JPG, SVG, WebP, GIF, or icon file and get its Base64 data URI, along with ready-made snippets for an img tag, a CSS background-image rule, and Markdown. Inlining an image removes an HTTP request, which is worth doing for a small icon or a one-off email asset, and it is the only practical way to embed an image in a single self-contained HTML file. The encoded string is roughly a third larger than the original file, so the size of both is shown to make that trade-off visible before you commit to it. The file is read with the browser File API and encoded on your device, with no upload step.",
  category: "image",
  keywords: [
    "image to base64",
    "base64 data uri generator",
    "png to base64",
    "svg to css background data uri",
    "encode image base64 online",
  ],
  tags: ["base64", "data uri", "image", "encode", "css", "html", "inline"],
  icon: FileImage,
  features: [
    "Data URI, raw Base64, img tag, CSS background, and Markdown snippets",
    "Works with PNG, JPG, WebP, GIF, SVG, and ICO files",
    "Shows original and encoded size so the growth is visible",
    "Live preview rendered from the generated data URI itself",
    "Encodes locally with no upload",
  ],
  relatedTools: ["base64-encoder-decoder", "svg-optimizer", "favicon-generator"],
  faqs: [
    {
      question: "When is inlining an image as Base64 a good idea?",
      answer:
        "For small assets: icons, a logo in an HTML email, a texture used in one CSS rule, or an image that has to travel inside a single self-contained file. It saves a request. For anything large it is usually a loss, because the data cannot be cached separately, cannot be lazy loaded, and inflates the file that contains it.",
    },
    {
      question: "Why is the Base64 string bigger than the file?",
      answer:
        "Base64 represents every 3 bytes with 4 text characters, so the encoded form is about 33 percent larger, plus the data URI prefix. Gzip recovers some of that on the wire but not all of it.",
    },
    {
      question: "Can I use this for SVG in CSS?",
      answer:
        "Yes. The CSS snippet wraps the data URI in a url() so it can be pasted directly into a background-image rule. SVG is text, so it also works percent-encoded rather than Base64, which is often slightly smaller, but the Base64 form quotes reliably in every context.",
    },
    {
      question: "Is the image uploaded to a server?",
      answer:
        "No. It is read with the browser File API and encoded in JavaScript on your device, so the image never leaves your machine.",
    },
  ],
}

export default meta
