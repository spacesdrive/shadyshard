import { ShieldCheck } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "spf-dmarc-record-checker",
  title: "SPF and DMARC Record Checker",
  description:
    "Validate an SPF or DMARC DNS record and read back what each tag and mechanism actually does.",
  longDescription:
    "Paste an SPF or DMARC TXT record to have every mechanism, qualifier, and tag parsed, explained in plain language, and checked against the syntax rules in RFC 7208 and RFC 7489. The checker detects which record type you pasted, counts the DNS lookups an SPF record will cost against the limit of ten that causes a permanent error, warns about the common mistakes that quietly break authentication, such as a trailing +all, a missing all mechanism, more than one SPF record on a domain, or a DMARC record with a reporting address but no policy. Since Google, Yahoo, Microsoft, and Apple began requiring authenticated mail from bulk senders, a great many domains have had to publish these records for the first time, and a record with a syntax error is treated as no record at all. Because this checks text you paste rather than looking up a live domain, you can validate a record before you publish it, and nothing you paste leaves your browser.",
  category: "security",
  keywords: [
    "spf record checker",
    "dmarc record validator",
    "check spf syntax before publishing",
    "spf dns lookup limit",
    "dmarc policy explained",
  ],
  tags: ["email", "spf", "dmarc", "dns", "security", "deliverability"],
  icon: ShieldCheck,
  features: [
    "Detects and validates both SPF and DMARC records",
    "Explains every mechanism, qualifier, and tag in plain language",
    "Counts SPF DNS lookups against the limit of ten",
    "Flags syntax errors and the misconfigurations that silently weaken a policy",
    "Works on a draft record, before it is published to DNS",
    "Parses in your browser, with no DNS query and no upload",
  ],
  faqs: [
    {
      question: "Why check a record here instead of against a live domain?",
      answer:
        "Most checkers look up whatever is already published, so they cannot tell you whether the record you are about to publish is correct. Checking the text directly lets you catch a syntax error before it reaches DNS, where a broken record is treated as no record at all and can start failing delivery immediately.",
    },
    {
      question: "What is the SPF ten lookup limit?",
      answer:
        "Every include, a, mx, ptr, exists, and redirect mechanism costs a DNS lookup when a receiver evaluates your record, and RFC 7208 caps the total at ten. Going over produces a permanent error, which most receivers treat as an SPF failure. The count here covers the mechanisms in the record you pasted, but not the lookups nested inside any domain you include, so treat it as a floor rather than the final number.",
    },
    {
      question: "What should my DMARC policy be?",
      answer:
        "Start at p=none, which asks receivers to report but not to act, and use the aggregate reports to confirm that all of your legitimate mail passes. Move to p=quarantine and then p=reject once it does. Publishing p=reject before your own systems pass alignment will cause your own mail to be rejected.",
    },
    {
      question: "Does this tool query DNS or contact my domain?",
      answer:
        "No. It parses the text you paste, entirely in your browser. There is no DNS query and no network request, which is what lets it validate a draft record that does not exist yet.",
    },
  ],
  relatedTools: ["email-header-analyzer", "robots-txt-tester", "url-parser"],
  isNew: true,
}

export default meta
