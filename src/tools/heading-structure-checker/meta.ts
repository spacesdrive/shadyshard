import { Heading } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "heading-structure-checker",
  title: "Heading Structure Checker",
  description:
    "Paste HTML to see its heading outline and catch skipped levels, missing h1 tags, and empty headings.",
  longDescription:
    "Screen reader users navigate a page by jumping between headings, and search engines read the same outline to work out how a page is organised. Both break when a page goes straight from an h1 to an h3, carries several h1 elements, or contains a heading with no text because it was used for spacing. Paste a page's HTML to see the outline as a tree, with every structural problem listed against the heading that causes it. The markup is parsed by the browser's own parser into an inert document that cannot run scripts or load anything, and it is never sent anywhere, so an unpublished page or a page behind a login is fine to check.",
  category: "seo",
  keywords: [
    "heading structure checker",
    "h1 h2 hierarchy validator",
    "skipped heading level checker",
    "html heading outline tool",
    "accessibility heading audit",
  ],
  tags: ["seo", "accessibility", "headings", "html", "audit", "wcag"],
  icon: Heading,
  features: [
    "Renders the full h1 to h6 outline as an indented tree",
    "Flags skipped levels, multiple h1 elements, and a first heading that is not an h1",
    "Reports empty headings and headings that hold only an image",
    "Counts headings by level so you can see the shape at a glance",
    "Copies the outline as plain indented text for a report or ticket",
  ],
  faqs: [
    {
      question: "Is more than one h1 on a page actually a problem?",
      answer:
        "The HTML specification permits it, and sectioning elements were once meant to make it safe. In practice no browser ever implemented the document outline algorithm, so assistive technology and search engines both treat the h1 as the page title. One h1 per page remains the reliable choice, which is why more than one is reported here.",
    },
    {
      question: "Why is skipping from h2 to h4 flagged?",
      answer:
        "WCAG success criterion 1.3.1 requires that the structure a sighted reader perceives is available programmatically. A jump from h2 to h4 tells a screen reader there is a missing level of nesting, so a user navigating by heading cannot tell where they are. Going back up several levels is fine, since that just closes sections.",
    },
    {
      question: "Can I check a page I have not published yet?",
      answer:
        "Yes, and that is the main reason to paste markup rather than enter a URL. Use your browser's view-source or copy the outer HTML from the elements panel. Nothing is fetched and nothing is uploaded, so staging pages and pages behind a login work the same as public ones.",
    },
    {
      question: "Does it check headings inside iframes or added by JavaScript?",
      answer:
        "It checks exactly the markup you paste. If headings are added at runtime, copy the rendered HTML from the browser's elements panel rather than the original source, so what you check matches what a visitor gets.",
    },
  ],
}

export default meta
