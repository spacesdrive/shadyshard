import { FileDiff } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "json-patch-generator",
  title: "JSON Patch Generator",
  description:
    "Compare two JSON documents and generate the RFC 6902 patch that turns one into the other.",
  longDescription:
    "Paste the document you have and the document you want, and get the JSON Patch that describes the difference as a list of add, remove, and replace operations with proper JSON Pointer paths. This is the format PATCH endpoints, Kubernetes, and most JSON:API servers expect, and writing it by hand for a deeply nested object is where the pointer-escaping mistakes creep in. Both documents are parsed and compared in your browser, so an API payload with real customer data can be diffed without sending it to a service.",
  category: "developer",
  keywords: [
    "json patch generator",
    "rfc 6902",
    "json diff to patch",
    "json pointer path",
    "generate patch from two json files",
  ],
  tags: ["json", "patch", "diff", "rfc6902", "api", "developer"],
  icon: FileDiff,
  features: [
    "Generates add, remove, and replace operations per RFC 6902",
    "Correct JSON Pointer escaping for keys containing / or ~",
    "Reports which document failed to parse and why",
    "Pretty or compact patch output",
    "Copy or download the patch as a .json file",
  ],
  faqs: [
    {
      question: "Does it generate move and copy operations?",
      answer:
        "No. It emits only add, remove, and replace, which is enough to express any difference between two documents. Detecting move and copy requires guessing intent from matching values, and a guess that is wrong produces a patch that applies cleanly but means something different from what you wanted.",
    },
    {
      question: "How are arrays compared?",
      answer:
        "Element by element at the same index, then additions or removals for the length difference. Removals are emitted from the end backwards so that each index is still valid at the point its operation runs, which is what RFC 6902 requires of a sequentially applied patch.",
    },
    {
      question: "Is my JSON uploaded anywhere?",
      answer:
        "No. Both documents are parsed and compared by JavaScript running in your browser. Nothing is transmitted, which matters when the two documents are before-and-after snapshots of a real API response.",
    },
    {
      question: "What does an empty patch mean?",
      answer:
        "The two documents are already equivalent. Key order does not count as a difference, because JSON objects are unordered, so reordering keys produces no operations.",
    },
  ],
}

export default meta
