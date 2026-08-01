import { ShieldAlert } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "punycode-converter",
  title: "Punycode Converter",
  description:
    "Convert internationalised domain names to and from their xn-- punycode form, with lookalike scripts flagged.",
  longDescription:
    "DNS carries only ASCII, so a domain containing accented or non-Latin characters is transmitted in an encoded form beginning with xn--. Paste either form here to see the other. The same mechanism enables the IDN homograph attack, where a domain registered with Cyrillic or Greek letters that are visually identical to Latin ones renders as a familiar brand name in the address bar while resolving somewhere else entirely. Each label is checked for scripts mixed within one word and for characters known to be confusable with Latin letters, and anything suspicious is called out with the exact character and its code point. Everything is decoded in your browser, so a domain pulled out of a suspicious email is not reported to anyone.",
  category: "security",
  keywords: [
    "punycode converter",
    "idn to punycode",
    "xn-- decoder",
    "idn homograph attack check",
    "unicode domain name converter",
  ],
  tags: ["punycode", "idn", "domain", "phishing", "homograph", "security", "dns"],
  icon: ShieldAlert,
  features: [
    "Converts Unicode domains to punycode and xn-- labels back to Unicode",
    "Detects scripts mixed inside a single label",
    "Flags Cyrillic and Greek characters that are confusable with Latin ones",
    "Reports the code point of each suspicious character",
    "Decodes locally, so a suspect domain is never looked up or reported",
  ],
  relatedTools: ["url-parser", "unicode-character-inspector", "email-header-analyzer"],
  faqs: [
    {
      question: "What is punycode?",
      answer:
        "It is the encoding, defined in RFC 3492, that represents Unicode characters in a domain name using only the ASCII letters, digits, and hyphens that DNS allows. An encoded label is marked with the xn-- prefix, so muenchen with an umlaut becomes xn--mnchen-3ya.",
    },
    {
      question: "What is an IDN homograph attack?",
      answer:
        "Registering a domain that uses characters from another script which look identical to Latin ones, so the rendered name is indistinguishable from a real brand. Cyrillic small a, e, o, p, c, and x are the usual choices. Browsers now display the punycode form when a name mixes scripts suspiciously, but the defence is not universal, and email clients and chat apps are weaker at it.",
    },
    {
      question: "Does a mixed script warning always mean a domain is malicious?",
      answer:
        "No. Plenty of legitimate domains mix a non-Latin script with ASCII digits or hyphens, and single-script non-Latin domains are entirely normal. The warning means the name is worth reading in its punycode form before trusting it, not that it is fraudulent.",
    },
    {
      question: "Is the domain I paste looked up or logged?",
      answer:
        "No. Both conversions are pure text transformations performed in your browser, with no DNS query and no network request of any kind.",
    },
  ],
}

export default meta
