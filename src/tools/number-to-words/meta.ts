import { WholeWord } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "number-to-words",
  title: "Number to Words Converter",
  description:
    "Spell out any number in English words, including cheque and invoice wording for several currencies.",
  longDescription:
    "Write an amount in words for a cheque, a contract, or an invoice without second-guessing where the hyphens and the word and belong. Enter a number and the tool spells it out, in either the international scale of thousands, millions, and billions or the Indian scale of thousands, lakhs, and crores. Currency mode adds the wording banks expect, including the minor unit and a closing Only, and you can switch between sentence case, title case, and capitals to match the rest of the document. Everything is computed in your browser, which matters when the number is an amount you would rather not paste into someone else's server.",
  category: "converters",
  keywords: [
    "number to words",
    "amount in words converter",
    "cheque amount in words",
    "rupees in words",
    "spell out numbers in english",
  ],
  tags: ["number", "words", "currency", "cheque", "invoice"],
  icon: WholeWord,
  features: [
    "International scale with thousands, millions, and billions",
    "Indian scale with thousands, lakhs, and crores",
    "Currency wording for dollars, euros, pounds, and rupees",
    "Sentence case, title case, and uppercase output",
    "Ordinal numbers such as twenty-first and one hundredth",
  ],
  faqs: [
    {
      question: "What is the difference between the international and Indian scales?",
      answer:
        "The international scale groups digits in threes, so 1,000,000 reads as one million. The Indian scale groups the digits above a thousand in twos, so the same figure reads as ten lakh, and 10,000,000 reads as one crore.",
    },
    {
      question: "How does currency mode handle the decimal part?",
      answer:
        "It reads the first two decimal places as the minor unit and ignores anything beyond them, so 45.678 is spelled as forty five dollars and sixty seven cents. Enter no more than two decimal places if you want the amount to match a cheque exactly.",
    },
    {
      question: "Why does the output include the word Only at the end?",
      answer:
        "Banks in many countries expect an amount in words on a cheque to end with Only, because it prevents anyone appending further words to the line. Turn currency mode off if you just want the plain number spelled out.",
    },
    {
      question: "How large a number can it handle?",
      answer:
        "Up to quintillions on the international scale and up to kharab on the Indian scale. Beyond that the tool reports the number as too large rather than producing wording that is not in standard use.",
    },
  ],
}

export default meta
