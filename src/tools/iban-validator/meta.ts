import { Landmark } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "iban-validator",
  title: "IBAN Validator",
  description:
    "Check an IBAN's country, length, and check digits offline, and see the correct check digits when they are wrong.",
  longDescription:
    "Paste an international bank account number to confirm its country code is real, its length matches that country's registered format, and its two check digits satisfy the ISO 7064 mod-97 test that catches almost every typo and transposed pair of digits. When only the check digits are wrong, the correct pair is shown, which usually means a digit was mistyped rather than the account being wrong. Validation runs entirely in your browser: most IBAN checkers send the number to an API, and a bank account number is not something to hand to a third party while proofreading an invoice.",
  category: "developer",
  keywords: [
    "iban validator",
    "check iban number",
    "iban checksum mod 97",
    "validate bank account number offline",
    "iban format by country",
  ],
  tags: ["iban", "banking", "validation", "checksum", "finance", "privacy"],
  icon: Landmark,
  features: [
    "ISO 7064 mod-97 check digit verification",
    "Country code and registered length checked against the IBAN registry",
    "Shows the correct check digits when only those are wrong",
    "Formats the number into the four-character groups used on paper",
    "Runs offline, so the account number never leaves your browser",
  ],
  faqs: [
    {
      question: "Does a valid IBAN mean the account exists?",
      answer:
        "No. The mod-97 check confirms the number is internally consistent and correctly formatted for its country. It cannot tell you whether a bank issued that account, whether it is open, or who it belongs to. Only the receiving bank can confirm that.",
    },
    {
      question: "Why does it say the length is wrong for my country?",
      answer:
        "Every country has one fixed IBAN length registered with SWIFT, from 15 characters in Norway to 33 in Russia. A length mismatch almost always means a character was dropped or an extra one was pasted in, so it is reported separately from a check digit failure.",
    },
    {
      question: "What do the suggested check digits mean?",
      answer:
        "If the country code, length, and account part are all plausible but the checksum fails, the two digits that would make the number valid are calculated and shown. That tells you the error is likely in the check digits themselves rather than in the account number, but you should still confirm the whole number against the original document.",
    },
    {
      question: "Is my IBAN sent to a server?",
      answer:
        "No. The country table and the mod-97 arithmetic both run in the page, and there is no network request of any kind. That is the main reason to use an offline checker for something as sensitive as a bank account number.",
    },
  ],
}

export default meta
