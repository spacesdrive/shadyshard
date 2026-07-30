import { KeySquare } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "jwt-generator",
  title: "JWT Generator",
  description:
    "Sign a JSON Web Token with HS256, HS384, or HS512 and a shared secret, entirely in your browser.",
  longDescription:
    "Build a signed JWT for testing an API, a middleware guard, or an auth flow without standing up an issuer first. Enter the claims you want, pick an HMAC algorithm, supply a secret, and the token is signed with the browser's Web Crypto API. The signing secret is the whole security of an HMAC token, so it never leaves the page: no request is made, and nothing is stored. Use a throwaway secret for anything you paste into any tool, including this one.",
  category: "security",
  keywords: [
    "jwt generator",
    "create jwt token",
    "sign jwt hs256",
    "jwt test token",
    "json web token generator",
  ],
  tags: ["jwt", "token", "security", "hmac", "generator", "auth"],
  icon: KeySquare,
  features: [
    "HS256, HS384, and HS512 signing with the Web Crypto API",
    "Standard iat and exp claims added from a chosen lifetime",
    "Random secret generator using crypto.getRandomValues",
    "Inline JSON validation on the claims editor",
    "Copy the signed token, the header, or the payload",
  ],
  faqs: [
    {
      question: "Is my signing secret sent anywhere?",
      answer:
        "No. The token is signed in your browser with the Web Crypto API and no network request is made. Even so, treat any secret you paste into a browser tool as compromised and use a throwaway value rather than a production key.",
    },
    {
      question: "Why are only HMAC algorithms offered?",
      answer:
        "HS256, HS384, and HS512 sign with a shared secret, which is what a hand-made test token normally needs. RS256 and ES256 sign with a private key, and pasting a production private key into a web page is not something worth making convenient.",
    },
    {
      question: "What do iat and exp mean?",
      answer:
        "iat is the issued-at time and exp is the expiry, both as Unix timestamps in seconds. Most JWT libraries reject a token once the current time passes exp, so a short lifetime is useful when testing expiry handling.",
    },
    {
      question: "Can I verify a token here as well?",
      answer:
        "This tool signs tokens. To inspect an existing token's header and payload, use the JWT Decoder, which decodes without verifying the signature.",
    },
  ],
  relatedTools: ["jwt-decoder", "sha256-generator", "password-generator"],
}

export default meta
