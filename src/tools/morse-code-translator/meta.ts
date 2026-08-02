import { RadioTower } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "morse-code-translator",
  title: "Morse Code Translator",
  description:
    "Convert text to Morse code or Morse back to text, and play the result as a tone.",
  longDescription:
    "Translate in either direction using the full ITU international Morse alphabet, including digits and the standard punctuation. The result can be played back as a sine tone at any speed from 5 to 40 words per minute, using the PARIS timing convention that amateur radio operators learn with, which makes the tool usable for practice rather than only for conversion. Characters Morse has no code for are named explicitly instead of being silently dropped, and unrecognised sequences are reported when decoding. Both the translation and the audio are generated in your browser with no network request.",
  category: "converters",
  keywords: [
    "morse code translator",
    "text to morse code",
    "morse code decoder",
    "morse code audio",
    "morse code practice",
  ],
  tags: ["morse", "translate", "encode", "decode", "radio", "audio", "cw"],
  icon: RadioTower,
  features: [
    "Full ITU Morse alphabet with digits and punctuation",
    "Translates text to Morse and Morse back to text",
    "Plays the code as a tone from 5 to 40 words per minute",
    "Standard PARIS timing for dit, dah, and gap lengths",
    "Names any character or sequence it could not translate",
  ],
  faqs: [
    {
      question: "How do I write Morse code so the decoder understands it?",
      answer:
        "Separate the letters of a word with a single space and separate words with a forward slash, which is the usual written convention: ... --- ... is SOS, and .... .. / - .... . .-. . is two words. Line breaks are treated as word breaks too, so pasting Morse laid out over several lines works.",
    },
    {
      question: "What do words per minute mean for Morse?",
      answer:
        "It is measured against the reference word PARIS, which is exactly 50 dit lengths including the spacing. At 15 words per minute, one dit is 80 milliseconds, a dash is three dits, the gap between letters is three dits, and the gap between words is seven. Beginners usually start around 5 to 10 and practise upward.",
    },
    {
      question: "Why are some characters missing from the output?",
      answer:
        "International Morse only defines codes for the 26 unaccented Latin letters, the ten digits, and a short list of punctuation. Accented letters, other scripts, and symbols outside that list have no standard code, so they are dropped and named in a notice above the output rather than being guessed at.",
    },
    {
      question: "Does the audio playback need an internet connection?",
      answer:
        "No. The tone is generated with the Web Audio API using an oscillator in your browser, not by downloading an audio file, so playback works offline once the page has loaded and nothing you type is sent anywhere.",
    },
  ],
}

export default meta
