import { Printer } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "print-size-calculator",
  title: "Print Size and DPI Calculator",
  description:
    "Work out how large an image can print at a given DPI, or how many pixels a print size needs.",
  longDescription:
    "The relationship between pixels, print size, and DPI is one division, but getting it wrong wastes a print run. Enter an image's pixel dimensions to see the largest size it prints cleanly at 300, 200, or 150 DPI, or enter the size you want and get the pixel count you need. The result is rated against the usual thresholds: 300 DPI for photo and magazine quality, 150 to 200 for large prints seen from further away, and below 100 for a poster or banner viewed across a room. Megapixels, aspect ratio, and the equivalent size in centimetres are shown alongside, and everything is calculated in your browser.",
  category: "math",
  keywords: [
    "print size calculator",
    "dpi calculator",
    "pixels to inches calculator",
    "how big can i print my photo",
    "ppi to print size",
  ],
  tags: ["print", "dpi", "ppi", "image", "photography", "calculator", "resolution"],
  icon: Printer,
  features: [
    "Pixels to print size, or print size to required pixels",
    "Inches and centimetres side by side",
    "Quality rating against the usual DPI thresholds",
    "Megapixel count and aspect ratio",
    "Common print sizes listed with the pixels each one needs",
  ],
  faqs: [
    {
      question: "What DPI do I actually need?",
      answer:
        "300 DPI is the standard for something held in the hand, such as a photo print, a magazine page, or a brochure. 150 to 200 is enough for a large framed print viewed from a step back, and 100 or less is normal for posters and banners, where the viewing distance does the work. Doubling the viewing distance roughly halves the DPI you need.",
    },
    {
      question: "What is the difference between DPI and PPI?",
      answer:
        "PPI counts image pixels per inch and is what this calculation is really about; DPI counts ink dots per inch and belongs to the printer. The two are used interchangeably in everyday conversation, and print shops ask for DPI when they mean PPI, which is why this tool uses the term they use.",
    },
    {
      question: "Can I print larger than the calculator says?",
      answer:
        "Yes, quality falls off gradually rather than at a cliff edge. The rating here is what to aim for, not a hard limit, and a large print seen from two metres away can look fine at 100 DPI. Upscaling adds pixels but no detail, so it helps the printer more than it helps the image.",
    },
    {
      question: "Does the image itself get uploaded?",
      answer:
        "There is no upload at all. You enter numbers rather than a file, and the arithmetic runs in your browser.",
    },
  ],
}

export default meta
