import { KeySquare } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "pkce-generator",
  title: "OAuth PKCE Generator",
  description:
    "Generate an OAuth 2.0 code verifier and its S256 code challenge, or check that an existing pair matches.",
  longDescription:
    "PKCE is the extension that makes the OAuth 2.0 authorization code flow safe for public clients: the client picks a random code verifier, sends the SHA-256 hash of it as the code challenge, and proves ownership by presenting the original verifier at the token endpoint. This tool generates a compliant pair using crypto.getRandomValues and the Web Crypto SHA-256 digest, and also works the other way, recomputing the challenge for a verifier you already have so you can tell whether a failing token exchange is a genuine mismatch or something else. Because a code verifier is a short-lived secret, it is generated in your browser and never transmitted or stored.",
  category: "security",
  keywords: [
    "pkce generator",
    "code verifier code challenge",
    "oauth2 pkce s256",
    "generate code challenge",
    "pkce tester",
  ],
  tags: ["oauth", "pkce", "oauth2", "openid", "auth", "sha256", "security"],
  icon: KeySquare,
  features: [
    "Generates a code verifier of any RFC 7636 length from 43 to 128 characters",
    "Derives the S256 code challenge with the Web Crypto SHA-256 digest",
    "Verify mode recomputes the challenge for a verifier you already hold",
    "Validates verifier length and the unreserved character set with specific messages",
    "Copies the verifier, challenge, and method as ready-to-paste parameters",
  ],
  faqs: [
    {
      question:
        "What is the difference between the code verifier and the code challenge?",
      answer:
        "The code verifier is the random secret your client generates and keeps. The code challenge is the base64url encoded SHA-256 hash of that verifier, and it is the value you put on the authorization request. At the token endpoint you send the original verifier, and the server hashes it again and compares. Only the challenge ever travels in a URL, so an attacker who intercepts the authorization request cannot redeem the code.",
    },
    {
      question: "Should I use S256 or plain?",
      answer:
        "Use S256. The plain method sends the verifier itself as the challenge, which removes the protection PKCE exists to provide, and RFC 7636 says clients must use S256 if they are capable of it. Every browser that can run this page can compute a SHA-256 digest, so plain is not offered here.",
    },
    {
      question: "How long should the code verifier be?",
      answer:
        "The specification allows 43 to 128 characters. The 43 character minimum corresponds to 256 bits of entropy, which is already sufficient. The 64 character default here gives 384 bits, and going to the 128 character maximum adds length without adding meaningful security.",
    },
    {
      question: "Is it safe to generate a code verifier on a web page?",
      answer:
        "For testing and debugging, yes, because nothing leaves your browser. The randomness comes from crypto.getRandomValues, which is the same cryptographically secure source a client library would use, and no value is sent over the network or written to storage. That said, your production client should generate its own verifier per authorization request rather than reuse one from any tool.",
    },
  ],
}

export default meta
