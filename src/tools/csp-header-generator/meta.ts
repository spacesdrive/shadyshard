import { ShieldCheck } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "csp-header-generator",
  title: "CSP Header Generator",
  description:
    "Build a Content-Security-Policy header directive by directive and get both the header and the meta tag form.",
  longDescription:
    "Start from a strict, moderate, or basic preset, then edit each directive's source list to match what your site actually loads. The tool assembles the header value, warns about the combinations that quietly defeat the point of a policy such as unsafe-inline alongside a script allowlist, and outputs both the HTTP header and the equivalent meta tag. Report-only mode is a switch, because rolling a policy out in report mode first is the difference between finding your gaps and breaking your site. Everything is assembled in your browser.",
  category: "security",
  keywords: [
    "content security policy generator",
    "csp header builder",
    "csp meta tag generator",
    "content-security-policy example",
    "csp report only header",
  ],
  tags: ["security", "csp", "headers", "web security", "generator"],
  icon: ShieldCheck,
  features: [
    "Strict, moderate, and basic starting presets",
    "Editable source list for 13 common directives",
    "Warnings for source combinations that weaken the policy",
    "Report-only switch and upgrade-insecure-requests toggle",
    "Outputs both the HTTP header and the meta tag equivalent",
  ],
  faqs: [
    {
      question: "Should I start with the header or the meta tag?",
      answer:
        "Prefer the HTTP response header. A meta tag is applied later in page parsing and cannot express frame-ancestors, sandbox, or report-uri, so use it only when you cannot set response headers.",
    },
    {
      question: "What does report-only mode do?",
      answer:
        "Content-Security-Policy-Report-Only tells the browser to report violations without blocking anything. Deploying a new policy in report-only mode first lets you find everything the policy would have broken before it affects visitors.",
    },
    {
      question: "Why is unsafe-inline flagged as a problem?",
      answer:
        "script-src 'unsafe-inline' allows any inline script to run, which is the exact class of injection a CSP is meant to stop. If you cannot remove inline scripts yet, a nonce or a hash gives you the same result without opening the policy up.",
    },
    {
      question: "Does the generator check my site?",
      answer:
        "No. It assembles the header text from the values you enter, entirely in your browser. It does not fetch your site or send your policy anywhere.",
    },
  ],
  isNew: true,
}

export default meta
