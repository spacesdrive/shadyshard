import { Binary } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "base32-encoder-decoder",
  title: "Base32 Encoder and Decoder",
  description:
    "Encode and decode Base32 in the RFC 4648, base32hex, and Crockford alphabets.",
  longDescription:
    "Base32 is what you reach for when a value has to survive being written down, read aloud, or typed back in: it uses no lower case and no easily confused characters, which is why TOTP secrets, DNSSEC records, and onion addresses all use it. This encodes and decodes text or hex bytes in three alphabets. RFC 4648 is the standard one used by authenticator apps, base32hex sorts in the same order as the underlying bytes, and Crockford drops I, L, O, and U and accepts them as their look-alikes when decoding. Encoding and decoding run in your browser, so a shared secret pasted here is not transmitted.",
  category: "converters",
  keywords: [
    "base32 encoder",
    "base32 decoder",
    "rfc 4648 base32",
    "crockford base32",
    "decode totp secret",
  ],
  tags: ["base32", "encode", "decode", "convert", "rfc4648", "crockford"],
  icon: Binary,
  features: [
    "RFC 4648, base32hex, and Crockford alphabets",
    "Text or hex bytes as input",
    "Optional padding with equals signs",
    "Crockford decoding accepts I and L as 1 and O as 0",
    "Names the offending character when input cannot be decoded",
  ],
  faqs: [
    {
      question: "Which alphabet does an authenticator app secret use?",
      answer:
        "RFC 4648, without padding. That is the alphabet A to Z followed by the digits 2 to 7, which is why a TOTP secret never contains 0, 1, or 8. Decode one here and you get the raw shared secret bytes as hex.",
    },
    {
      question: "What makes Crockford base32 different?",
      answer:
        "It removes I, L, O, and U from the alphabet: the first three because they are easily confused with 1 and 0, and U to avoid accidental words. Decoding is case-insensitive and maps I and L back to 1 and O back to 0, so a value copied off a label by hand still decodes. It is the encoding ULIDs use.",
    },
    {
      question: "Why is Base32 longer than Base64?",
      answer:
        "Base32 packs five bits into each character rather than six, so the output is about 60 percent longer than the input against Base64's 33 percent. You trade that length for an alphabet that survives case-insensitive systems, hand transcription, and being read out loud.",
    },
    {
      question: "Is my input sent anywhere?",
      answer:
        "No. Encoding and decoding happen entirely in your browser, which matters because the values people usually decode here are shared secrets.",
    },
  ],
}

export default meta
