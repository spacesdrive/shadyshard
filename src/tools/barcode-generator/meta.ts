import { Barcode } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "barcode-generator",
  title: "Barcode Generator",
  description:
    "Create Code 128, EAN-13, UPC-A, Code 39, and ITF-14 barcodes and download them as SVG or PNG.",
  longDescription:
    "Type a value, pick a symbology, and get a scannable barcode you can download as a vector SVG for print or a PNG for a screen. Bar width, height, font size, and the human readable line underneath are all adjustable, and check digits are validated up front so an EAN-13 with a wrong final digit is reported rather than silently rendered into something a scanner will reject. Most free barcode sites either watermark the download, cap how many codes you can make, or require an account. This one renders in your browser, so the product codes and asset tags you type are never sent anywhere and there is no limit on how many you generate.",
  category: "generators",
  keywords: [
    "barcode generator",
    "code 128 barcode online",
    "ean 13 generator",
    "upc barcode maker",
    "free barcode svg download",
  ],
  tags: ["barcode", "code128", "ean13", "upc", "generator", "svg"],
  icon: Barcode,
  features: [
    "Code 128, EAN-13, EAN-8, UPC-A, Code 39, ITF-14, and MSI",
    "Download as vector SVG for print or PNG for screen use",
    "Adjustable bar width, height, and text options",
    "Check digit and length validation with a specific error message",
    "Rendered in your browser with no account and no usage limit",
  ],
  faqs: [
    {
      question: "Which symbology should I use?",
      answer:
        "Code 128 is the general purpose choice for internal labels, asset tags, and shipping references, because it encodes the full ASCII set compactly. EAN-13 and UPC-A are for retail products and require a real, registered company prefix. ITF-14 is for shipping cartons of retail goods.",
    },
    {
      question: "Why is my EAN-13 rejected?",
      answer:
        "EAN-13 needs exactly 12 or 13 digits, and if you supply 13 the last one is the check digit and has to be correct. Enter the first 12 digits and the check digit is calculated for you.",
    },
    {
      question: "Can I use these barcodes commercially?",
      answer:
        "The generated image is yours to use. Note that retail symbologies encode a number that must be assigned to you by GS1; generating a well formed EAN-13 does not make that number yours to sell products under.",
    },
    {
      question: "Is my data uploaded to generate the barcode?",
      answer:
        "No. The barcode is drawn in your browser and the value you type never leaves it, which matters when the value is an internal asset tag or an unreleased product code.",
    },
  ],
  isNew: true,
}

export default meta
