import { EyeOff } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "text-redactor",
  title: "Text Redactor",
  description:
    "Replace emails, phone numbers, card numbers, keys, and your own terms with placeholders before sharing text.",
  longDescription:
    "Paste a log, a ticket, a contract, or a prompt you are about to send to an AI assistant, and this replaces the identifying parts with numbered placeholders such as [EMAIL_1] and [API_KEY_2]. The same value always gets the same placeholder, so the text still makes sense to whoever or whatever reads it. Because the substitution table stays in the page, you can paste the reply back into the restore tab and get the real values put back. Detection covers email addresses, phone numbers, IP and MAC addresses, card numbers validated with the Luhn check, IBANs, JWTs, long API keys, URLs, and any custom terms you add, such as names and company names. Everything runs in your browser, which is the point: text you are redacting because it is sensitive should not be uploaded to do the redacting.",
  category: "security",
  keywords: [
    "redact text online",
    "remove pii from text",
    "anonymize text before chatgpt",
    "scrub sensitive data",
    "text anonymizer",
  ],
  tags: ["redact", "privacy", "pii", "anonymize", "security", "llm", "mask"],
  icon: EyeOff,
  features: [
    "Detects emails, phone numbers, IP and MAC addresses, cards, IBANs, JWTs, API keys, and URLs",
    "Custom term list for names, company names, and project code names",
    "Consistent numbered placeholders, so repeated values stay linked",
    "Restore tab puts the real values back into a reply",
    "Counts every replacement by type so nothing is silently missed",
  ],
  faqs: [
    {
      question: "How do I get the original values back?",
      answer:
        "The substitution table is kept in the page while the tab is open. Paste the reply that contains the placeholders into the Restore tab and every placeholder is swapped back for the value it stood for. Reloading the page clears the table, since it is never stored anywhere.",
    },
    {
      question: "Will it catch names and addresses?",
      answer:
        "Not automatically. Recognising a person's name in free text needs a language model, and running one would mean sending your text somewhere. Instead there is a custom terms box: add the names, company names, and project code names that appear in your text and each is replaced with its own placeholder.",
    },
    {
      question: "Why are some numbers left alone?",
      answer:
        "Card numbers are only replaced when they pass the Luhn check, which is the checksum every real card number satisfies. That keeps order numbers, invoice numbers, and timestamps from being redacted just because they are long. Turn on the card detector and check the count if you expected a match.",
    },
    {
      question: "Is the text I paste sent anywhere?",
      answer:
        "No. Detection, replacement, and restoration all run locally in your browser with no network request. A tool that uploaded the text in order to redact it would defeat the purpose.",
    },
  ],
}

export default meta
