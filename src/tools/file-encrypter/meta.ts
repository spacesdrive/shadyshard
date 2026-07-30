import { FileKey } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "file-encrypter",
  title: "File Encrypter",
  description:
    "Encrypt any file with a password using AES-256-GCM, then decrypt it back locally.",
  longDescription:
    "Pick a file, choose a password, and get back an encrypted copy you can attach to an email or drop in cloud storage without the provider being able to read it. Encryption uses AES-256-GCM with a key derived from your password by PBKDF2-SHA256 over 310,000 iterations, all through the browser's built-in Web Crypto API. The file never leaves your device, there is no account, and the original filename is stored inside the encrypted payload rather than in the clear, so the encrypted copy reveals nothing but its size.",
  category: "security",
  keywords: [
    "encrypt file with password",
    "aes 256 file encryption online",
    "decrypt file in browser",
    "password protect a file",
    "encrypt before uploading to cloud",
  ],
  tags: ["encrypt", "decrypt", "aes", "password", "file", "privacy"],
  icon: FileKey,
  isNew: true,
  features: [
    "AES-256-GCM authenticated encryption via the Web Crypto API",
    "PBKDF2-SHA256 key derivation with 310,000 iterations",
    "Original filename is encrypted with the contents, not stored in the clear",
    "Tampered or wrong-password files fail loudly instead of producing garbage",
    "Works on any file type and never uploads anything",
  ],
  faqs: [
    {
      question: "Is my file uploaded to a server to be encrypted?",
      answer:
        "No. The file is read with the browser File API, encrypted with crypto.subtle in the page, and handed back to you as a download. No part of it is transmitted anywhere.",
    },
    {
      question: "What happens if I lose the password?",
      answer:
        "The file cannot be recovered. There is no key escrow, no recovery code, and no reset, because there is no server holding anything. Store the password somewhere safe before you delete the original.",
    },
    {
      question: "Can I decrypt the file with another tool such as OpenSSL?",
      answer:
        "Not directly. The encrypted file uses a small container of its own: a six-byte marker, then the 16-byte salt, then the 12-byte nonce, then the AES-GCM ciphertext of the filename and contents. Decrypt it here, or reimplement that layout.",
    },
    {
      question: "How large a file can it handle?",
      answer:
        "The whole file is held in memory while it is encrypted, so the limit is your device's available memory. Files above 100 MB are rejected rather than risking the tab running out of memory partway through.",
    },
  ],
}

export default meta
