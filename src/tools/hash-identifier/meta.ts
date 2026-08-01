import { Fingerprint } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "hash-identifier",
  title: "Hash Identifier",
  description:
    "Work out which algorithm produced a hash from its length, character set, and prefix.",
  longDescription:
    "Paste one or more hashes and get the formats that match, ranked by how likely each is, with the hashcat mode number and John the Ripper format name where they exist. Bare hex digests are matched on length and character set, while the prefixed formats used by modern password storage, such as bcrypt, Argon2, yescrypt, and the Unix crypt family, are matched on their identifier. The tool identifies formats, it does not crack or reverse anything, and every check is a pattern match performed in your browser, so a hash pulled from an engagement or a capture the flag challenge is not sent anywhere.",
  category: "security",
  keywords: [
    "hash identifier",
    "identify hash type",
    "what hash is this",
    "hash type detector",
    "hashcat mode lookup",
  ],
  tags: ["hash", "identify", "md5", "sha1", "bcrypt", "hashcat", "ctf", "security"],
  icon: Fingerprint,
  isNew: true,
  features: [
    "Identifies MD5, SHA family, NTLM, bcrypt, Argon2, and the Unix crypt formats",
    "Shows the hashcat mode number and John the Ripper format name where they apply",
    "Ranks matches by confidence instead of guessing a single answer",
    "Checks several hashes at once, one per line",
    "Flags input that is base64 or a JSON Web Token rather than a digest",
  ],
  faqs: [
    {
      question: "Can this tool crack or reverse a hash?",
      answer:
        "No, and no tool can reverse a cryptographic hash directly. Identifying the algorithm is the first step before running a real cracking tool such as hashcat or John the Ripper against a wordlist, which is why the matching hashcat mode and John format name are shown next to each candidate.",
    },
    {
      question: "Why does a 32 character hash show both MD5 and NTLM?",
      answer:
        "Because they are genuinely indistinguishable by inspection. Both are 128 bit digests written as 32 hexadecimal characters, so nothing in the string itself separates them. Where the hash came from decides it: a Windows credential dump is NTLM, a legacy web application database is almost always MD5.",
    },
    {
      question: "What does the confidence ranking mean?",
      answer:
        "Most likely means the format is the common interpretation of that pattern, possible means it is a real format with the same shape that appears less often, and less likely means it is technically consistent but unusual. All the candidates shown for a hash fit its length and character set, so treat the ranking as prior probability rather than evidence.",
    },
    {
      question: "Is the hash I paste sent anywhere?",
      answer:
        "No. Identification is pattern matching against a table built into the page, running in your browser with no network request. Nothing is uploaded, stored, or logged, which matters when the hash came from a client system or an active engagement.",
    },
  ],
}

export default meta
