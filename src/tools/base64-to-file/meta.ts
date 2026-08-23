import { FileDown } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "base64-to-file",
  title: "Base64 to File Converter",
  description:
    "Decode a Base64 string or data URI back into a downloadable file, with the real type read from its bytes.",
  longDescription:
    "API responses, database columns, and email attachments all carry files as Base64, and getting one back out usually means writing a throwaway script. Paste the string here instead, with or without a data URI prefix, and it is decoded into a real file you can download. The type is identified from the file's own magic bytes rather than from whatever the data URI claims, so a PDF labelled as an octet stream is still recognised as a PDF and given the right extension. Images are previewed before you download. Decoding happens in your browser, which is what makes this safe to use on an attachment from a production system.",
  category: "converters",
  keywords: [
    "base64 to file",
    "base64 to pdf converter",
    "decode data uri to file",
    "base64 decode download",
    "convert base64 string to image file",
  ],
  tags: ["base64", "decode", "file", "data-uri", "converter", "download"],
  icon: FileDown,
  features: [
    "Accepts raw Base64, a data URI, and the URL-safe Base64 alphabet",
    "Tolerates line breaks and missing padding",
    "Identifies the real file type from magic bytes, not from the declared one",
    "Previews decoded images before download",
    "Suggests a filename and extension you can override",
  ],
  faqs: [
    {
      question: "What is the difference between the declared and detected type?",
      answer:
        "A data URI states a MIME type in its prefix, and that value is whatever produced the string chose to write. The detected type comes from the first few bytes of the decoded data, which is what the file actually is. When the two disagree, trust the detected type.",
    },
    {
      question: "Why does it say my string is not valid Base64?",
      answer:
        "The most common causes are a truncated copy, a string that still contains JSON escaping such as backslashes, or characters outside the Base64 alphabet. Line breaks and missing padding are handled, so those are not the problem.",
    },
    {
      question: "Is there a size limit?",
      answer:
        "Only your device's memory. The decoded bytes are held in the page until you download them, so a very large string may fail to allocate, which is reported rather than left to hang. Base64 is about a third larger than the data it encodes, so a 30 MB string is roughly a 22 MB file.",
    },
    {
      question: "Is the decoded file uploaded anywhere?",
      answer:
        "No. Decoding uses the browser's own Base64 support and the download is generated from an in-memory blob. Nothing is transmitted, which matters because Base64 blobs pulled from logs and API responses are often real customer documents.",
    },
  ],
}

export default meta
