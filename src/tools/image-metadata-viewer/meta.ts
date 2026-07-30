import { Aperture } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "image-metadata-viewer",
  title: "Image Metadata Viewer",
  description:
    "Read the EXIF, IPTC, XMP, and GPS metadata embedded in a photo without uploading it anywhere.",
  longDescription:
    "Photos carry far more than pixels: camera model, lens, exposure settings, the software that edited them, the time they were taken, and often the exact coordinates of where. This viewer reads all of it in your browser using the File API, so a photo you are about to share is inspected without ever being uploaded to check what it reveals. JPEG, PNG, WebP, HEIC, AVIF, TIFF, and GIF files are supported. If the metadata turns out to be more than you want to publish, the EXIF Remover strips it, also locally.",
  category: "image",
  keywords: [
    "exif viewer",
    "image metadata viewer",
    "check photo gps location",
    "view exif data online",
    "iptc xmp metadata reader",
  ],
  tags: ["image", "exif", "metadata", "privacy", "gps", "photo"],
  icon: Aperture,
  features: [
    "EXIF, IPTC, XMP, ICC, and file-level metadata grouped by source",
    "GPS coordinates surfaced separately with a privacy warning",
    "JPEG, PNG, WebP, HEIC, AVIF, TIFF, and GIF supported",
    "Copy or download every tag as JSON",
    "Read in your browser with no upload",
  ],
  faqs: [
    {
      question: "Is my photo uploaded to read its metadata?",
      answer:
        "No. The file is read with the browser's File API and parsed in the page. Nothing is transmitted, which matters because the most sensitive thing in a photo's metadata is often the exact location it was taken.",
    },
    {
      question: "Why does my photo have no metadata?",
      answer:
        "Most social platforms strip metadata when an image is uploaded, so a photo saved from a feed usually has nothing left. Screenshots and images exported by many editors also start without EXIF.",
    },
    {
      question: "What does the GPS data reveal?",
      answer:
        "Latitude and longitude accurate to a few metres, and often altitude. That is enough to identify a home address from a photo taken indoors, which is why it is worth checking before publishing images taken on a phone.",
    },
    {
      question: "How do I remove this metadata?",
      answer:
        "Use the EXIF Remover, which re-encodes the image without any metadata block. It also runs entirely in your browser.",
    },
  ],
  relatedTools: ["exif-remover", "image-compressor", "file-signature-inspector"],
}

export default meta
