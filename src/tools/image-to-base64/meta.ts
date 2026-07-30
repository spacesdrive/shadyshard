import { Binary } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "image-to-base64",
  title: "Image to Base64 Converter",
  description:
    "Turn an image into a Base64 data URI with ready-made CSS, HTML, and Markdown snippets.",
  longDescription:
    "Inlining a small icon as a data URI removes a network request, which is why build tools do it automatically below a size threshold. This tool does the same thing by hand: drop an image and copy the raw Base64, the full data URI, or a finished CSS background, HTML img tag, or Markdown image snippet. It also decodes in the other direction, so you can paste a data URI out of a stylesheet and get the original image back as a file. Base64 grows the payload by about a third, so the encoded size is shown next to the original to help you decide whether inlining is worth it. Encoding and decoding both run in your browser.",
  category: "converters",
  keywords: [
    "image to base64",
    "base64 to image converter",
    "data uri generator",
    "inline image in css",
    "convert png to base64",
  ],
  tags: ["base64", "image", "data uri", "encode", "decode", "css"],
  icon: Binary,
  features: [
    "Raw Base64, full data URI, CSS background, HTML tag, and Markdown output",
    "Decodes a pasted data URI back into a downloadable image",
    "Shows the original size next to the encoded size and the overhead",
    "Warns when an image is large enough that inlining hurts more than it helps",
    "Reads the file locally, so nothing is uploaded",
  ],
  faqs: [
    {
      question: "Why is the Base64 version bigger than the original file?",
      answer:
        "Base64 represents three bytes with four ASCII characters, so the encoded form is about 33 percent larger, plus a short prefix. That is the cost of embedding binary data in a text file such as a stylesheet or an HTML document.",
    },
    {
      question: "When is inlining an image as a data URI a good idea?",
      answer:
        "For small assets, roughly under a few kilobytes, where saving a request outweighs the extra bytes. Larger images are better left as separate files, because a data URI cannot be cached independently and blocks the stylesheet or document it sits inside from being parsed as quickly.",
    },
    {
      question: "Can I convert a data URI back to a file?",
      answer:
        "Yes. Switch to the decode tab, paste either the full data URI or the bare Base64, and the image is previewed and can be downloaded. The file type is taken from the data URI prefix, or detected from the image itself when only Base64 is pasted.",
    },
    {
      question: "Does the image get uploaded to encode it?",
      answer:
        "No. The file is read with the browser File API and encoded in the page, so private screenshots and unreleased assets never leave your device.",
    },
  ],
}

export default meta
