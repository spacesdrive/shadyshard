import { MailSearch } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "email-header-analyzer",
  title: "Email Header Analyzer",
  description:
    "Trace an email's delivery path and read its SPF, DKIM, and DMARC results from the raw headers.",
  longDescription:
    "Paste the raw headers from a suspicious or misrouted message to see the route it took, how long each hop added, and whether it passed sender authentication. The analyzer rebuilds the Received chain in delivery order with the time each server held the message, pulls the SPF, DKIM, and DMARC verdicts out of the Authentication-Results header, decodes subject and sender fields that were encoded for transport, and flags mismatches between the visible From address and the envelope return path that often indicate spoofing. Message headers carry internal hostnames, private IP addresses, recipient addresses, and mail server software versions, which is why sending them to a third party service to be parsed is worth avoiding. Everything here is parsed by your browser and never leaves your device.",
  category: "security",
  keywords: [
    "email header analyzer",
    "trace email delivery path",
    "check spf dkim dmarc results",
    "email spoofing detection",
    "read received headers",
  ],
  tags: ["email", "security", "phishing", "headers", "spf", "dkim", "dmarc"],
  icon: MailSearch,
  features: [
    "Rebuilds the Received chain in delivery order with per hop delays",
    "Extracts SPF, DKIM, and DMARC verdicts from Authentication-Results",
    "Decodes subject and sender fields encoded for transport",
    "Flags From, Reply-To, and Return-Path mismatches",
    "Lists every header with a copy button",
    "Parses locally, so internal hostnames and addresses stay private",
  ],
  faqs: [
    {
      question: "Where do I find the raw headers of an email?",
      answer:
        "In Gmail, open the message, use the three dot menu and choose Show original. In Outlook, open the message and use File then Properties, or the message menu View then View message source. Apple Mail exposes them under View, Message, All Headers. Copy everything from the top of the message down to the first blank line.",
    },
    {
      question: "What do the SPF, DKIM, and DMARC results actually mean?",
      answer:
        "SPF checks whether the sending server was authorised by the envelope sender's domain. DKIM checks a cryptographic signature over the message. DMARC checks that a passing SPF or DKIM result aligns with the domain in the visible From address. A DMARC pass is the strongest signal, because SPF and DKIM can both pass for a domain the sender does not actually own.",
    },
    {
      question: "Can I trust the Received headers?",
      answer:
        "Only from the top down. Each server adds its Received header above the existing ones, so a sender can forge the lower entries but cannot forge the ones added by servers you trust. Read the chain starting from the receiving server closest to you and stop trusting it at the first server outside your control.",
    },
    {
      question: "Are my headers uploaded anywhere?",
      answer:
        "No. All parsing happens in your browser with JavaScript. This matters more than usual for headers, because they expose internal hostnames, private IP addresses, and recipient addresses that most analyzers process on their own servers.",
    },
  ],
  relatedTools: ["spf-dmarc-record-checker", "jwt-decoder", "url-parser"],
  isNew: true,
}

export default meta
