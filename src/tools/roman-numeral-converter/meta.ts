import { Landmark } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "roman-numeral-converter",
  title: "Roman Numeral Converter",
  description:
    "Convert a number to Roman numerals, read a numeral back as a number, or write a full date.",
  longDescription:
    "Convert in both directions between ordinary numbers and Roman numerals, with a third mode that writes a complete date the way it appears on jewellery, engravings, and tattoos. Numerals are produced in standard subtractive form, so 4 is IV rather than IIII and 1999 is MCMXCIX. Reading a numeral back is validated rather than merely summed: a string like IIII or IC parses to a number but is not standard form, so the tool says what the standard spelling would be instead of quietly accepting it. That check is the difference worth having before a number gets engraved on something permanent.",
  category: "converters",
  keywords: [
    "roman numeral converter",
    "number to roman numerals",
    "roman numerals to number",
    "roman numeral date converter",
    "date in roman numerals",
  ],
  tags: ["roman", "numerals", "convert", "date", "number", "tattoo"],
  icon: Landmark,
  isNew: true,
  features: [
    "Converts numbers from 1 to 3999 into standard subtractive form",
    "Reads a Roman numeral back and reports the number",
    "Date mode with a choice of dot, slash, dash, or space separators",
    "Rejects non-standard spellings and shows the correct form",
    "Copy any result with one click",
  ],
  faqs: [
    {
      question: "Why does the converter stop at 3999?",
      answer:
        "Because M is the largest single numeral, and standard notation does not repeat a numeral more than three times. Numbers of 4000 and above need the vinculum, an overline that multiplies a numeral by a thousand, which is a typographic mark rather than a letter and does not survive being copied into most applications. Anything beyond 3999 is rejected rather than written as a long run of Ms.",
    },
    {
      question: "Is IIII wrong for 4?",
      answer:
        "It is non-standard, though not unheard of: clock faces have used IIII for centuries, and it appears in some inscriptions. Standard subtractive notation writes 4 as IV, which is what this tool produces. When you enter IIII in the reverse direction, the value is recognised but the tool tells you the standard spelling rather than accepting it silently.",
    },
    {
      question: "How should a date be written in Roman numerals?",
      answer:
        "There is no single official convention. The common approach, and the one used here, writes the day, month, and year each as its own numeral with a separator between them, so 14 March 2026 becomes XIV . III . MMXXVI. Pick the separator that suits the design, and note that the day and month order follows the day-first convention.",
    },
    {
      question: "Does anything I type get sent anywhere?",
      answer:
        "No. The conversion is arithmetic performed in your browser, with no network request and nothing stored. Dates people convert are usually personal, which is a reason for this to stay on your device.",
    },
  ],
}

export default meta
