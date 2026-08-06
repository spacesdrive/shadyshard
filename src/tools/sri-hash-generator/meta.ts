import { ShieldCheck } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "sri-hash-generator",
  title: "SRI Hash Generator",
  description:
    "Generate a Subresource Integrity hash for a local script or stylesheet and get the ready-made tag.",
  longDescription:
    "Subresource Integrity lets a browser refuse to run a third-party script whose bytes have changed since you vetted it, which is the defence against a compromised CDN serving something other than what you reviewed. Drop the exact file you are going to ship, or paste its contents, and get the base64 integrity value for SHA-256, SHA-384, or SHA-512, plus the complete script or link tag with crossorigin already set. Most generators want a public URL and fetch it themselves, which does not help for a file you built locally or one behind authentication. Here the file is read and hashed by your own browser and never uploaded.",
  category: "security",
  keywords: [
    "sri hash generator",
    "subresource integrity hash",
    "generate integrity attribute",
    "sha384 integrity for script tag",
    "cdn script integrity check",
  ],
  tags: ["sri", "integrity", "security", "hash", "cdn", "subresource"],
  icon: ShieldCheck,
  features: [
    "SHA-256, SHA-384, and SHA-512 digests in the base64 form SRI requires",
    "Works from a local file or pasted text, with no URL needed",
    "Complete script and link tags generated with crossorigin set",
    "Multiple algorithms can be emitted in one integrity attribute",
    "Hashing runs in your browser through the Web Crypto API",
  ],
  faqs: [
    {
      question: "Which algorithm should I use?",
      answer:
        "SHA-384 is the usual choice and is what most CDN documentation shows. SHA-256 is equally acceptable to browsers. Listing more than one algorithm is allowed, and a browser will use the strongest one it supports.",
    },
    {
      question: "Why does my integrity value not match the CDN's?",
      answer:
        "The hash covers the exact bytes served. A file that differs by a trailing newline, a different minification, or a different version produces a different hash. Hash the identical file the browser will download, not a local rebuild of it.",
    },
    {
      question: "Do I need the crossorigin attribute?",
      answer:
        "Yes, for a resource loaded from another origin. Without crossorigin set to anonymous the response is opaque, the browser cannot verify it, and it blocks the resource. The generated tags include it.",
    },
    {
      question: "Is the file uploaded to check it?",
      answer:
        "No. The file is read with the File API and hashed with crypto.subtle in your browser, so it never leaves your machine. That is what makes this usable for a private build artifact.",
    },
  ],
  isNew: true,
}

export default meta
