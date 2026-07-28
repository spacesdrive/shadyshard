import { Timer } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "totp-code-generator",
  title: "TOTP Code Generator",
  description:
    "Generate time-based one-time passwords from a Base32 secret or an otpauth URI.",
  longDescription:
    "Paste a Base32 authenticator secret or a full otpauth:// URI to see the current TOTP code, the seconds left in the window, and the next code. Codes are computed with the browser's Web Crypto HMAC implementation, so the shared secret never leaves your device.",
  category: "security",
  keywords: [
    "totp code generator",
    "authenticator code from secret",
    "otpauth uri decoder",
    "two factor code generator",
  ],
  tags: ["totp", "2fa", "authenticator", "security", "otp"],
  icon: Timer,
  features: [
    "Live code with a countdown to the next time window",
    "Accepts a raw Base32 secret or a full otpauth:// URI",
    "Configurable digits, period, and HMAC algorithm",
    "Shows the next code so you can plan around a window expiring",
  ],
  faqs: [
    {
      question: "Is it safe to paste a two-factor secret here?",
      answer:
        "The secret is only held in page memory and every code is computed locally with Web Crypto, so nothing is transmitted. Even so, treat this as a testing and recovery aid rather than a replacement for a dedicated authenticator app, which keeps secrets in device storage.",
    },
    {
      question: "My code is rejected. What is wrong?",
      answer:
        "TOTP depends on the clock, so check that your device time is accurate. Then confirm the digit count, period, and algorithm match what the service issued, since some providers use 8 digits or a 60 second window.",
    },
    {
      question: "What can I paste from a QR code?",
      answer:
        "The otpauth:// URI encoded in the QR image. Paste it whole and the secret, issuer, digits, period, and algorithm are read from it automatically.",
    },
  ],
  relatedTools: ["qr-code-scanner", "password-generator", "password-strength-checker"],
}

export default meta
