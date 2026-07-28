import { Contact } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "vcard-generator",
  title: "vCard Generator",
  description:
    "Create a downloadable .vcf contact card from a name, phone, email, and address.",
  longDescription:
    "Fill in contact details to produce a vCard file that imports into phone contacts, Outlook, and most CRM tools, in either the widely supported 3.0 format or the newer 4.0. The card is built in your browser, so personal contact details are never uploaded, and the same text can be pasted into a QR code for a scannable business card.",
  category: "generators",
  keywords: [
    "vcard generator",
    "create vcf file",
    "digital business card file",
    "contact card generator",
  ],
  tags: ["vcard", "vcf", "contact", "generator", "business card"],
  icon: Contact,
  features: [
    "vCard 3.0 and 4.0 output",
    "Work and mobile phone numbers, email, website, and postal address",
    "Escapes commas and semicolons so fields cannot break the card",
    "Download the .vcf file or copy the text for a QR code",
  ],
  faqs: [
    {
      question: "Should I choose vCard 3.0 or 4.0?",
      answer:
        "Choose 3.0 unless you have a reason not to. It is the version most phones, address books, and QR scanners handle without surprises. Version 4.0 is a cleaner specification but support is less consistent.",
    },
    {
      question: "Can I turn this into a QR code business card?",
      answer:
        "Yes. Copy the generated vCard text and paste it into the QR Code Generator. Scanning the resulting code offers to save the contact.",
    },
    {
      question: "Are my contact details sent anywhere?",
      answer:
        "No. The card is assembled in the page and saved with the browser's own download mechanism, so nothing is transmitted.",
    },
  ],
  relatedTools: ["qr-code-generator", "ics-event-generator"],
}

export default meta
