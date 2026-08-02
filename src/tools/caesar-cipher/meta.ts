import { RotateCw } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "caesar-cipher",
  title: "Caesar Cipher and ROT13",
  description:
    "Encode or decode a Caesar shift, apply ROT13 or ROT47, or try all 26 shifts at once.",
  longDescription:
    "A Caesar cipher moves every letter a fixed number of places through the alphabet, and ROT13 is the special case of a shift of thirteen, which makes it its own inverse. Set any shift from 0 to 25 to encode or decode, switch to ROT47 to rotate the whole printable ASCII range including digits and punctuation, or paste ciphertext with an unknown shift and see all 26 possibilities at once. The likely answer is marked by comparing each candidate's letter frequencies against English, which usually identifies the right row immediately. Case and every non-letter character are preserved, and everything runs in your browser.",
  category: "security",
  keywords: [
    "caesar cipher",
    "rot13 decoder",
    "caesar cipher decoder",
    "rot47",
    "shift cipher solver",
  ],
  tags: ["cipher", "rot13", "caesar", "decode", "encode", "ctf", "puzzle"],
  icon: RotateCw,
  features: [
    "Encode or decode with any shift from 0 to 25",
    "ROT13 and ROT47 presets, both of which are their own inverse",
    "Brute-force view showing all 26 shifts with the likely answer highlighted",
    "Preserves letter case, spacing, digits, and punctuation",
    "Copy any individual result straight from the results table",
  ],
  faqs: [
    {
      question: "Is a Caesar cipher secure?",
      answer:
        "No, and it has not been for a very long time. There are only 25 useful shifts, so anyone can try all of them in seconds, which is exactly what this tool's brute-force view does. Use it for puzzles, capture the flag challenges, geocaching hints, and obscuring spoilers, never for anything that needs to stay private. For that, use real encryption.",
    },
    {
      question: "Why is ROT13 the same for encoding and decoding?",
      answer:
        "Because 13 is half of 26. Shifting forward 13 places and then forward another 13 returns you to the original letter, so applying ROT13 twice is the identity. ROT47 works the same way over the 94 printable ASCII characters, since 47 is half of 94.",
    },
    {
      question: "How does the tool pick the likely shift?",
      answer:
        "It scores each of the 26 candidate plaintexts against the standard letter frequency distribution of English and highlights the highest scoring one. This works well for a sentence or more of ordinary English text and less well for short strings, single words, or text in another language, so check the other rows if the highlighted one is not readable.",
    },
    {
      question: "What happens to numbers and punctuation?",
      answer:
        "In Caesar and ROT13 mode they pass through untouched, which is the conventional behaviour and keeps the output readable. ROT47 is different by design: it rotates every printable ASCII character, so digits and punctuation are transformed as well.",
    },
  ],
}

export default meta
