import { Database } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "mock-data-generator",
  title: "Mock Data Generator",
  description:
    "Define your own fields and generate realistic sample rows as JSON, CSV, or SQL insert statements.",
  longDescription:
    "Build a schema field by field, choose how many rows you need, and export the result as JSON, CSV, or a set of SQL INSERT statements you can paste straight into a seed script. Names, emails, addresses, dates, numbers, and identifiers are drawn from built-in sample data, so the output looks plausible in a demo without containing anyone's real details. Generation happens in your browser, so there is no row cap, no account, and no schema of yours leaving the page.",
  category: "generators",
  keywords: [
    "mock data generator",
    "test data generator",
    "fake data json csv",
    "sample sql insert generator",
    "dummy data for testing",
  ],
  tags: ["mock", "test data", "generator", "json", "csv", "sql"],
  icon: Database,
  features: [
    "Custom field names with 16 built-in data types",
    "Export as JSON, CSV, or SQL INSERT statements",
    "Any row count, with no sign-up or daily limit",
    "Copy or download the generated data",
    "Runs entirely in your browser",
  ],
  faqs: [
    {
      question: "Is there a limit on how many rows I can generate?",
      answer:
        "There is no account-based cap. Generation happens in your browser, so the practical limit is your own machine. Tens of thousands of rows are fine; very large exports will simply take a moment.",
    },
    {
      question: "Is the generated data based on real people?",
      answer:
        "No. Values are assembled from generic sample word lists, so any resemblance to a real person, address, or company is coincidental. It is meant for demos, seeding, and testing, not for anything that needs statistically representative data.",
    },
    {
      question: "Can I use the output as a database seed?",
      answer:
        "Yes. The SQL export produces one INSERT statement per row using your field names as column names, so it can be piped into a seed script directly. Quote characters in generated values are escaped.",
    },
    {
      question: "Are the values random enough for security testing?",
      answer:
        "They are generated with the Web Crypto random number generator, but the underlying word lists are small and public, so treat the output as sample data rather than as secrets.",
    },
  ],
}

export default meta
