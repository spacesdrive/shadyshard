import { FileKey } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "pdf-password-checker",
  title: "PDF Password Checker",
  description:
    "Check whether a PDF is password-protected or encrypted, without a server.",
  longDescription:
    "Drop in a PDF to check whether it's encrypted or password-protected. This detects encryption, it does not verify or crack a password - pdf-lib, the library this tool uses, cannot open a password-protected PDF at all, with or without the correct password, so there is no way for this tool to test a guessed password against the file. If your PDF reports as encrypted, you'll need the actual password and a full PDF application to open it. Runs entirely in your browser.",
  category: "pdf",
  keywords: [
    "check pdf password",
    "is pdf encrypted",
    "pdf password protected check",
    "pdf encryption checker",
    "detect pdf password",
  ],
  tags: ["pdf", "password", "encryption", "document"],
  icon: FileKey,
  features: [
    "Detects whether a PDF is encrypted or password-protected",
    "Clearly explains what it cannot do (password verification or removal)",
    "Runs entirely offline in your browser",
  ],
  faqs: [
    {
      question: "Can this tool remove or crack a PDF password?",
      answer:
        "No. It only detects whether a PDF is encrypted. Removing password protection requires the correct password and dedicated software - this tool does not attempt to bypass encryption in any way.",
    },
    {
      question: "Why can't this just try a password I give it?",
      answer:
        "The library this tool is built on (pdf-lib) does not support decrypting a PDF with a password at all, so there's no underlying capability to test a password against, even if the tool offered a field for one.",
    },
  ],
  relatedTools: ["pdf-metadata-viewer", "pdf-page-counter", "checksum-verifier"],
  isNew: true,
}

export default meta
