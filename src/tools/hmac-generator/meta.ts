import { Fingerprint } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "hmac-generator",
  title: "HMAC Generator",
  description:
    "Compute an HMAC signature with SHA-1, SHA-256, SHA-384, or SHA-512 and compare it against an expected value.",
  longDescription:
    "Most webhook providers sign their requests with an HMAC of the raw request body and a shared secret, then send the result in a header. When verification fails, the fastest way to find out why is to compute the signature yourself and compare it byte for byte. This tool does that in the browser with the Web Crypto API: paste the raw body and the secret, pick the algorithm and output encoding, and check the result against the header you received. Nothing is uploaded, so a real webhook body and its secret stay on your machine.",
  category: "security",
  keywords: [
    "hmac generator",
    "hmac sha256 online",
    "webhook signature verification",
    "hmac calculator",
    "verify x-hub-signature-256",
  ],
  tags: ["hmac", "security", "webhook", "signature", "hash", "sha256"],
  icon: Fingerprint,
  isNew: true,
  features: [
    "HMAC with SHA-1, SHA-256, SHA-384, and SHA-512",
    "Secret key read as UTF-8 text, hex, or base64",
    "Hex or base64 signature output",
    "Comparison field that ignores a sha256= style prefix",
    "Computed with the Web Crypto API, with no request made",
  ],
  faqs: [
    {
      question: "Why does my computed signature not match the webhook header?",
      answer:
        "Almost always because the body being signed is not byte-identical to what was sent. Re-serialising parsed JSON changes key order and whitespace, which changes the signature. Sign the raw request body exactly as received.",
    },
    {
      question: "What encoding should the output use?",
      answer:
        "GitHub and Stripe send lowercase hex, while Shopify and several others send base64. Match whichever your provider documents, and note that some providers prefix the header value, for example sha256= on GitHub.",
    },
    {
      question: "Is HMAC the same as hashing?",
      answer:
        "No. A plain hash of a message can be recomputed by anyone. An HMAC mixes in a secret key, so only a party holding the key can produce a valid value, which is what makes it useful for authenticating a request.",
    },
    {
      question: "Is my secret sent anywhere?",
      answer:
        "No. The HMAC is computed in your browser and no network request is made. Even so, prefer a test secret over a live one when using any browser tool.",
    },
  ],
  relatedTools: ["sha256-generator", "jwt-generator", "file-hash-generator"],
}

export default meta
