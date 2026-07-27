import { Lock } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "text-encrypter",
  title: "Text Encrypter",
  description:
    "Encrypt and decrypt a message with a password using AES-256-GCM in your browser.",
  longDescription:
    "Protect a note, a recovery phrase, or a short document with a password before storing or sending it. The key is derived from your password with PBKDF2 and the message is sealed with AES-256-GCM using the browser's built-in Web Crypto implementation, so neither the password nor the plaintext ever leaves your device.",
  category: "security",
  keywords: [
    "encrypt text with password",
    "aes 256 text encryption online",
    "decrypt message browser",
    "password protect a note",
  ],
  tags: ["encryption", "aes", "privacy", "security", "password"],
  icon: Lock,
  features: [
    "AES-256-GCM encryption with authenticated decryption",
    "PBKDF2-SHA256 key derivation with a random salt per message",
    "Compact Base64 output that is safe to paste into chat or email",
    "Specific errors for a wrong password or a modified message",
  ],
  faqs: [
    {
      question: "What exactly does the output contain?",
      answer:
        "A single Base64 string holding a 16-byte random salt, a 12-byte random nonce, and the AES-GCM ciphertext with its authentication tag. Everything the decrypter needs except the password is in that string.",
    },
    {
      question: "Can a wrong password silently produce garbage?",
      answer:
        "No. AES-GCM verifies an authentication tag during decryption, so a wrong password or an altered message fails with an error instead of returning incorrect plaintext.",
    },
    {
      question: "Is this a replacement for a password manager or PGP?",
      answer:
        "No. It is meant for one-off encryption of short text. For sharing keys with other people over time, use a password manager or an end-to-end encrypted messenger.",
    },
  ],
  isNew: true,
}

export default meta
