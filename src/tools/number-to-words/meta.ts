import { Hash } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "number-to-words",
  title: "Number to Words Converter",
  description:
    "Spell out any amount in words, in international or Indian lakh and crore format.",
  longDescription:
    "Cheques, invoices, promissory notes, and legal contracts usually require the amount to appear in words as well as digits, and writing it out by hand is exactly where a costly typo happens. Enter a number to get the written form, in either the international short scale of thousand, million, and billion, or the Indian system of lakh and crore. Currency mode adds the unit and the fractional part in the wording banks expect, such as rupees and paise or dollars and cents. Conversion happens locally in your browser.",
  category: "converters",
  keywords: [
    "number to words converter",
    "amount in words",
    "cheque amount in words",
    "rupees in words converter",
    "spell out numbers",
  ],
  tags: ["number", "words", "currency", "cheque", "invoice", "lakh", "crore"],
  icon: Hash,
  isNew: true,
  features: [
    "International short scale and Indian lakh and crore numbering",
    "Currency wording for rupees, dollars, euros, and pounds",
    "Handles decimals as the fractional currency unit",
    "Lower case, sentence case, title case, and upper case output",
    "Grouped digit preview so you can check the number you typed",
  ],
  faqs: [
    {
      question: "What is the difference between the international and Indian formats?",
      answer:
        "The international short scale groups digits in threes and names them thousand, million, and billion. The Indian system groups the first three digits then in twos, and names them thousand, lakh, and crore, so 2,500,000 reads as twenty five lakh in India and two point five million elsewhere.",
    },
    {
      question: "How is the decimal part written for a cheque?",
      answer:
        "In currency mode the fractional part is rounded to two digits and written as the subunit, so 1250.75 in rupees becomes one thousand two hundred fifty rupees and seventy five paise only. Banks generally expect the word only at the end, which is included.",
    },
    {
      question: "How large a number can it convert?",
      answer:
        "Up to fifteen digits before the decimal point, which covers hundreds of trillions in the international format and lakh crore amounts in the Indian one. Beyond that, JavaScript numbers lose whole-number precision, so larger input is rejected rather than converted incorrectly.",
    },
    {
      question: "Does the conversion happen on a server?",
      answer:
        "No. The number is converted in your browser with plain JavaScript, so nothing about the amounts you enter is transmitted or recorded.",
    },
  ],
}

export default meta
