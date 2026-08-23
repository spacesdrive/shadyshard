import { GitCommitHorizontal } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "conventional-commit-builder",
  title: "Conventional Commit Builder",
  description:
    "Build a valid Conventional Commits message from a form, with live checks on subject length and format.",
  longDescription:
    "Fill in the type, optional scope, and subject, and this assembles a commit message that follows the Conventional Commits specification, including the exact footer format a breaking change needs. The parts that commit linters reject are checked as you type: an empty subject, a subject that ends in a period, a subject over the 72-character limit most tooling and Git itself expect, and a scope containing characters that are not allowed. The result is plain text you copy into your editor or pass to git commit, assembled entirely in your browser.",
  category: "developer",
  keywords: [
    "conventional commits generator",
    "commit message format",
    "breaking change footer",
    "semantic commit message builder",
    "commitlint format helper",
  ],
  tags: ["git", "commit", "conventional-commits", "changelog", "semver", "developer"],
  icon: GitCommitHorizontal,
  features: [
    "Every Conventional Commits type, with a plain description of when each applies",
    "Breaking changes written as both the ! marker and the BREAKING CHANGE footer",
    "Live warnings for subject length, trailing periods, and invalid scopes",
    "Issue references appended as a properly separated footer",
    "One-click copy of the finished multi-line message",
  ],
  faqs: [
    {
      question: "Why is the subject limited to 72 characters?",
      answer:
        "Git itself wraps commit bodies at 72 columns in several commands, and most hosting interfaces truncate a subject beyond roughly that length. The builder warns past 72 rather than blocking, since the specification sets no hard limit.",
    },
    {
      question: "Should I use the exclamation mark or the BREAKING CHANGE footer?",
      answer:
        "The specification accepts either, and tools that read your history accept both. This builder emits both when you mark a change as breaking, because the marker makes it visible in a one-line log and the footer carries the explanation a changelog needs.",
    },
    {
      question: "How do the types map to version bumps?",
      answer:
        "Under semantic-release and similar tools, fix maps to a patch release, feat maps to a minor release, and any commit marked as breaking maps to a major release regardless of its type. The remaining types usually produce no release on their own.",
    },
    {
      question: "Does this send my commit message anywhere?",
      answer:
        "No. The message is assembled in your browser and nothing is transmitted, so an unreleased feature name in a subject line stays local.",
    },
  ],
}

export default meta
