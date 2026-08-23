import { SpellCheck } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "text-encoding-repair",
  title: "Text Encoding Repair",
  description:
    "Fix mojibake, the garbled text you get when UTF-8 is read as Latin-1 or Windows-1252.",
  longDescription:
    "When UTF-8 text is read by something expecting Latin-1 or Windows-1252, an accented character turns into two or three nonsense characters: cafe becomes caf plus a stray sequence, an apostrophe becomes a run beginning with a capital A with a circumflex. Paste the damaged text here to reverse the process, encoding it back to the bytes that were misread and decoding those as UTF-8. Text that was mangled more than once is repaired repeatedly until it stops changing. The repair only applies when the result is valid UTF-8, so text that merely looks unusual is left alone rather than being mangled further, and everything happens in your browser.",
  category: "text",
  keywords: [
    "fix mojibake",
    "repair garbled characters",
    "utf-8 read as latin-1 fix",
    "double encoded utf-8 repair",
    "fix weird characters in csv export",
  ],
  tags: ["encoding", "mojibake", "utf-8", "text", "repair", "unicode"],
  icon: SpellCheck,
  isNew: true,
  features: [
    "Reverses UTF-8 misread as Latin-1 or Windows-1252",
    "Repeats the repair for text that was double or triple encoded",
    "Refuses to change text where the result would not be valid UTF-8",
    "Reports how many passes were needed and how many characters changed",
    "Runs entirely in your browser on text of any length",
  ],
  faqs: [
    {
      question: "Why does my text look like that in the first place?",
      answer:
        "A file was written as UTF-8, where a non-ASCII character takes two or more bytes, and then read by a program that assumed each byte was one Latin-1 or Windows-1252 character. Every multi-byte character therefore came out as several single-byte ones. Exporting a spreadsheet to CSV and opening it in a program set to a legacy encoding is the most common way this happens.",
    },
    {
      question: "What does the number of passes mean?",
      answer:
        "One pass means the text was misread once. Two or more means the damaged text was saved and misread again, which is common when data moves through several systems. Each pass reverses one round of the misreading.",
    },
    {
      question: "Why did nothing change when I pasted my text?",
      answer:
        "The repair is only applied when reversing it produces valid UTF-8. If your text contains characters that could not have come from a misread UTF-8 sequence, no safe repair exists and the text is returned untouched, which is deliberate: a partial guess would corrupt it further.",
    },
    {
      question: "Can it fix text that also has HTML entities in it?",
      answer:
        "Not directly. This tool handles the byte-level misreading only. If your text also contains entities such as an ampersand followed by a name, decode those separately first, then repair the encoding.",
    },
    {
      question: "Is my text uploaded?",
      answer:
        "No. The whole repair is a pair of local operations, encoding the text back to bytes and decoding those bytes as UTF-8, both of which the browser can do on its own.",
    },
  ],
}

export default meta
