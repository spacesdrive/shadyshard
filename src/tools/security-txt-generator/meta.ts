import { ShieldCheck } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "security-txt-generator",
  title: "security.txt Generator",
  description:
    "Build an RFC 9116 security.txt file so researchers know where to report a vulnerability.",
  longDescription:
    "security.txt is the file a researcher looks for before deciding whether reporting a bug to you is worth the effort. It lives at /.well-known/security.txt and lists a contact address, when the file expires, and optionally your disclosure policy, encryption key, and acknowledgements page. This tool builds the file field by field and checks the parts that are usually wrong: the Expires field is mandatory and must be a real future timestamp, contacts have to be absolute URIs rather than bare email addresses, and the Canonical field must point at the well-known path over HTTPS. Everything is assembled in your browser, so an unpublished security contact is not handed to a third-party service on the way.",
  category: "security",
  keywords: [
    "security.txt generator",
    "rfc 9116 security txt",
    "vulnerability disclosure contact file",
    "well-known security txt",
    "responsible disclosure file",
  ],
  tags: ["security.txt", "disclosure", "rfc9116", "vulnerability", "policy"],
  icon: ShieldCheck,
  features: [
    "Every field defined by RFC 9116, required and optional",
    "Validates contacts, canonical URLs, and language tags",
    "Warns when the expiry date is missing, past, or more than a year away",
    "Supports multiple contacts, encryption keys, and acknowledgement pages",
    "Copy the file or download it ready for /.well-known/security.txt",
  ],
  faqs: [
    {
      question: "Where does the file have to be published?",
      answer:
        "At https://yourdomain.com/.well-known/security.txt, served as plain text. A copy at the root of the domain is allowed for backwards compatibility, but the well-known path is the one researchers and scanners check first.",
    },
    {
      question: "Why is the Expires field required?",
      answer:
        "It stops an abandoned file from sending researchers to an address nobody reads. RFC 9116 makes the field mandatory and recommends a value less than a year away, so a stale contact eventually announces itself as stale rather than silently failing.",
    },
    {
      question: "Why can I not just put an email address in Contact?",
      answer:
        "The field takes a URI, so an email address has to be written as mailto:security@example.com. A phone number is tel:+1-201-555-0123, and a reporting form is its https URL. A bare address is the single most common reason a file fails validation.",
    },
    {
      question: "Should the file be signed?",
      answer:
        "Signing with OpenPGP is optional but recommended for sites that publish an encryption key, because it lets a reporter confirm the contact details were not tampered with in transit. This tool produces the plain text; sign it with your own key before publishing if you need that.",
    },
  ],
}

export default meta
