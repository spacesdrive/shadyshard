import { ScanLine } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "qr-code-scanner",
  title: "QR Code Scanner",
  description:
    "Scan a QR code from your camera or an uploaded image, entirely in your browser.",
  longDescription:
    "Scan a QR code using your device's camera, or upload an image containing one, to instantly decode its contents. Decoding happens locally using the jsQR library - no image or camera frame is ever sent anywhere.",
  category: "qr",
  keywords: [
    "qr code scanner",
    "scan qr code online",
    "qr code reader",
    "decode qr code",
    "qr code scanner from image",
  ],
  tags: ["qr code", "scanner", "camera", "decoder"],
  icon: ScanLine,
  features: [
    "Scan live using your device's camera",
    "Or upload an image containing a QR code",
    "Detects the code's content automatically",
    "One-click copy of the decoded text",
    "Runs entirely in your browser - frames are never uploaded",
  ],
  faqs: [
    {
      question: "Does this upload my camera feed anywhere?",
      answer:
        "No. Camera frames are captured and analyzed locally in your browser using the jsQR library. Nothing is transmitted anywhere.",
    },
    {
      question: "Why is my camera not working?",
      answer:
        "Your browser will ask for camera permission the first time - it must be allowed. Camera access also requires a secure (HTTPS) connection, which this site uses.",
    },
    {
      question: "Can I scan a QR code from a screenshot instead?",
      answer:
        "Yes, use the upload option instead of the camera and select any image file containing a QR code.",
    },
  ],
  relatedTools: ["qr-code-generator"],
  isNew: true,
}

export default meta
