import { FileLock2 } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "file-encrypter",
  title: "File Encrypter",
  description:
    "Encrypt any file with a password using AES-256-GCM, entirely in your browser, and decrypt it back later.",
  longDescription:
    "Pick a file, choose a password, and get back an encrypted copy you can email, upload, or hand over on a USB stick without the contents being readable. The key is derived from your password with PBKDF2-SHA256 over 310,000 iterations and a fresh random salt, then used for AES-256-GCM, all through the browser's own Web Crypto implementation. The original filename is encrypted along with the contents, so the encrypted file gives nothing away, and it is restored when you decrypt. Nothing is uploaded: the file is read from disk into the page, transformed, and offered back as a download, which is the only way a password-based tool like this can be trusted with something private in the first place.",
  category: "security",
  keywords: [
    "encrypt file with password",
    "aes 256 gcm file encryption browser",
    "decrypt file online no upload",
    "password protect a file locally",
    "client side file encryption",
  ],
  tags: ["encryption", "aes", "privacy", "security", "file", "password"],
  icon: FileLock2,
  isNew: true,
  features: [
    "AES-256-GCM with PBKDF2-SHA256 key derivation over 310,000 iterations",
    "A fresh random salt and nonce for every file",
    "The original filename is encrypted with the contents and restored on decrypt",
    "Tampering is detected, since GCM decryption fails on any modified byte",
    "No upload, no account, and no size cap beyond your device's memory",
  ],
  faqs: [
    {
      question: "What exactly is in the encrypted file?",
      answer:
        "An eight-byte marker identifying the format, the 16-byte random salt, the 12-byte random nonce, and the AES-GCM ciphertext. The ciphertext covers the original filename as well as the file contents, so the encrypted copy reveals neither.",
    },
    {
      question: "Can I decrypt the file with another tool?",
      answer:
        "Not without implementing the same small container format, since there is no single standard for password-encrypted files that browsers can produce. Keep a copy of the original if long-term access through other software matters, and treat this as protection for a file in transit rather than an archival format.",
    },
    {
      question: "What happens if I forget the password?",
      answer:
        "The file cannot be recovered. There is no key escrow, no recovery code, and no server that has ever seen the password, which is the point. Choose a password you can retrieve from a password manager.",
    },
    {
      question: "How large a file can it handle?",
      answer:
        "The whole file is held in memory while it is encrypted, so the practical limit is your device's available memory rather than a fixed number. Files up to a few hundred megabytes are fine on a typical desktop; very large files may fail to allocate, and the tool reports that rather than hanging.",
    },
    {
      question: "Does the file leave my device?",
      answer:
        "No. It is read with the File API, transformed with Web Crypto, and handed back as a download. There is no server involved at any point, which you can confirm by loading the page and then going offline.",
    },
  ],
}

export default meta
