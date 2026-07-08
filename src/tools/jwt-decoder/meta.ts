import { Unlock } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "jwt-decoder",
  title: "JWT Decoder",
  description:
    "Decode a JSON Web Token's header and payload and inspect its claims and expiry.",
  longDescription:
    "Paste a JWT to see its decoded header and payload as formatted JSON, plus an at-a-glance expiry status if the token has an exp claim. This decodes the token only - it does not verify the signature, since that requires the issuer's secret or public key, which never leaves the issuing server.",
  category: "developer",
  keywords: [
    "jwt decoder",
    "decode jwt online",
    "jwt parser",
    "json web token decoder",
    "jwt debugger",
  ],
  tags: ["jwt", "developer", "token", "decoder"],
  icon: Unlock,
  features: [
    "Decodes the header and payload as formatted JSON",
    "Flags expired tokens using the exp claim",
    "Shows the raw signature segment",
    "Inline error message for malformed tokens",
    "Works entirely offline in your browser",
  ],
  faqs: [
    {
      question: "Does this verify the token's signature?",
      answer:
        "No. Verifying a signature requires the issuer's secret (HMAC) or public key (RSA/ECDSA), which this tool never has and never asks for. This only decodes the header and payload, which are base64url-encoded but not encrypted.",
    },
    {
      question: "Is my token sent anywhere?",
      answer:
        "No. Decoding happens entirely in your browser. Nothing is sent to a server - which matters, since a JWT's payload often contains sensitive claims.",
    },
    {
      question: "Why does it say my token is expired?",
      answer:
        "The payload's exp claim is a Unix timestamp for when the token expires. If that time has already passed, the token is flagged as expired, the same check a server would perform.",
    },
  ],
  relatedTools: ["base64-encoder-decoder", "json-formatter", "sha256-generator"],
  isNew: true,
}

export default meta
