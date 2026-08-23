import { ShieldCheck } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "security-headers-analyzer",
  title: "Security Headers Analyzer",
  description:
    "Grade a set of pasted HTTP response headers against the standard security headers, without needing a public URL.",
  longDescription:
    "Paste the response headers from curl -I, from a browser's network panel, or from a proxy log, and get a graded breakdown of which security headers are present, which are missing, and which are set to a value weak enough not to help. Every online header scanner has to fetch the URL itself, which means it cannot see a staging site, an internal admin panel, an environment behind a VPN, or a response that only appears once you are authenticated. Working from pasted headers removes that limit entirely, and because the parsing runs in your browser, headers that carry session cookies or internal hostnames are not handed to a third party.",
  category: "security",
  keywords: [
    "security headers checker",
    "analyze http response headers",
    "content security policy checker",
    "hsts x-frame-options referrer-policy audit",
    "security headers for internal site",
  ],
  tags: ["http", "headers", "security", "csp", "hsts", "audit"],
  icon: ShieldCheck,
  isNew: true,
  features: [
    "Checks CSP, HSTS, X-Content-Type-Options, X-Frame-Options, Referrer-Policy, Permissions-Policy, and the cross-origin isolation headers",
    "Distinguishes a header that is missing from one set to a value that does not protect anything",
    "Flags headers that disclose server software and versions",
    "Gives a letter grade with the point breakdown behind it",
    "Works on staging, intranet, and authenticated responses no public scanner can reach",
  ],
  faqs: [
    {
      question: "How do I get the headers to paste in?",
      answer:
        "Run curl -I https://example.com from a machine that can reach the site, or open the browser's network panel, select the document request, and copy the response headers. Both formats paste in as they are, including the HTTP status line.",
    },
    {
      question: "Why does a present Content-Security-Policy still score partially?",
      answer:
        "A policy that allows unsafe-inline or unsafe-eval for scripts, or falls back to a wildcard source, permits most of what CSP exists to prevent. Those cases score half the available points and say which directive caused it, rather than being counted as a pass.",
    },
    {
      question: "Does X-Frame-Options still matter?",
      answer:
        "It is superseded by the CSP frame-ancestors directive, which every current browser prefers when both are present. This tool counts either one as protection against framing and only reports a gap when neither is set.",
    },
    {
      question: "Is the grade an official score?",
      answer:
        "No. It is a weighted summary of the checks listed on the page, with the weights shown, so you can see exactly why a response scored what it did. Treat it as a checklist rather than a certification, and read the individual findings rather than the letter.",
    },
    {
      question: "Are the pasted headers sent anywhere?",
      answer:
        "No. Parsing and grading happen in your browser. That matters because response headers often include Set-Cookie values, internal hostnames, and load balancer identifiers.",
    },
  ],
}

export default meta
