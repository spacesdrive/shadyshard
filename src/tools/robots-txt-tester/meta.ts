import { ShieldQuestion } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "robots-txt-tester",
  title: "Robots.txt Tester",
  description:
    "Test which URLs a robots.txt file allows or blocks for a given crawler user agent.",
  longDescription:
    "Paste a robots.txt file and a list of URLs or paths, pick a crawler user agent, and see which ones are allowed and which are blocked, along with the exact rule that decided each result. Matching follows the Robots Exclusion Protocol (RFC 9309) that Google and other major crawlers implement: the longest matching path wins, Allow beats Disallow on an equal-length tie, and both the wildcard and the end-of-path anchor are supported. Google retired its own robots.txt Tester in Search Console, and most replacements fetch your live site from their servers, so they cannot check a staging site, an intranet host, or a draft file you have not published yet. This tester runs entirely in your browser, so you can check a robots.txt before it ever goes live and nothing you paste leaves your device.",
  category: "seo",
  keywords: [
    "robots.txt tester",
    "test robots.txt rules",
    "is url blocked by robots.txt",
    "robots exclusion protocol checker",
    "crawler user agent test",
  ],
  tags: ["seo", "robots", "crawler", "googlebot", "testing", "indexing"],
  icon: ShieldQuestion,
  features: [
    "Test many URLs against one robots.txt at once",
    "Shows the exact rule that allowed or blocked each URL",
    "Supports wildcards, end-of-path anchors, and user agent groups",
    "Presets for Googlebot, Bingbot, and other common crawlers",
    "Reports sitemap directives and unparsable lines",
    "Runs entirely in your browser, so unpublished files can be tested",
  ],
  faqs: [
    {
      question: "How does this decide whether a URL is allowed?",
      answer:
        "It follows the Robots Exclusion Protocol as standardised in RFC 9309, which is what Googlebot implements. The most specific user agent group is selected, then the rule with the longest matching path pattern wins. If an Allow rule and a Disallow rule match with the same length, the Allow rule wins, and a URL with no matching rule is allowed.",
    },
    {
      question: "Why not just use the tester in Google Search Console?",
      answer:
        "Google retired the robots.txt Tester in Search Console. The robots.txt report that replaced it shows the file Google last fetched from your live site, so it cannot test a file you have not published, a staging environment, or a change you are still drafting.",
    },
    {
      question: "Does my robots.txt or my URL list get uploaded anywhere?",
      answer:
        "No. The file, the URLs, and the results are all processed by JavaScript in your browser. Nothing is sent to a server, which is why this works on internal or unpublished sites.",
    },
    {
      question: "Does a Disallow rule remove a page from search results?",
      answer:
        "No. Disallow stops compliant crawlers from fetching a page, but the URL can still be indexed if other pages link to it. Use a noindex robots meta tag on a page that must stay out of search results, and make sure that page is not also blocked by robots.txt, because a crawler that cannot fetch the page will never see the noindex directive.",
    },
  ],
  relatedTools: ["robots-txt-generator", "sitemap-generator", "meta-tag-generator"],
  isNew: true,
}

export default meta
