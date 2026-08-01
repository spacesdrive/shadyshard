import { ScanText } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "unicode-character-inspector",
  title: "Unicode Character Inspector",
  description:
    "Break text into code points with hex values, HTML entities, UTF-8 byte counts, and invisible characters flagged.",
  longDescription:
    "Paste a string that is behaving strangely and see exactly what it is made of, one code point at a time, with its hex value, decimal value, HTML entity, and UTF-8 byte length. Invisible and easily confused characters are called out by name: zero-width spaces, byte order marks, non-breaking spaces, soft hyphens, directional marks, and the curly quotes and dashes that word processors substitute silently. These are the characters behind comparisons that fail on strings that look identical, regular expressions that stop matching, and CSV columns that will not line up. Grapheme clusters are counted separately from code points using the browser's own segmenter, which is why an emoji with a skin tone modifier reads as one character on screen but several underneath. The text is analysed in your browser and never uploaded.",
  category: "text",
  keywords: [
    "unicode character inspector",
    "find invisible characters",
    "zero width space detector",
    "unicode code point viewer",
    "utf-8 byte inspector",
  ],
  tags: ["unicode", "codepoint", "invisible", "debug", "encoding", "utf-8", "text"],
  icon: ScanText,
  features: [
    "Per character code point, hex, decimal, HTML entity, and UTF-8 byte count",
    "Names and flags invisible or confusable characters",
    "Counts grapheme clusters, code points, and bytes separately",
    "Highlights every non-ASCII character in the string",
    "Analysis runs entirely in your browser",
  ],
  relatedTools: ["invisible-character-remover", "character-counter", "html-escape"],
  faqs: [
    {
      question: "Why do two strings that look identical fail an equality check?",
      answer:
        "Usually because one contains a character the other does not: a zero-width space pasted from a web page, a non-breaking space from a word processor, or a curly apostrophe where the other has a straight one. All three are invisible or near invisible on screen and all three change the string. Pasting both here shows the difference immediately.",
    },
    {
      question: "What is the difference between characters, code points, and bytes?",
      answer:
        "A grapheme cluster is what a reader sees as one character. A code point is one Unicode value, and a single visible character can be several of them, as with a flag or an emoji carrying a skin tone modifier. A byte count is the UTF-8 encoded length, which is what a database column limit and a network payload are measured in.",
    },
    {
      question: "Where do stray invisible characters come from?",
      answer:
        "Copying from PDFs, word processors, chat clients, and rendered web pages. A byte order mark can be added by an editor saving a file, and directional marks appear in text mixing left to right and right to left scripts. They are legitimate characters, just rarely intended when they end up in a CSV or an identifier.",
    },
    {
      question: "Is the text I paste sent anywhere?",
      answer:
        "No. It is inspected with JavaScript string and encoding APIs in your browser, so a snippet from a private document stays on your machine.",
    },
  ],
}

export default meta
