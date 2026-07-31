import { Database } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "sql-formatter",
  title: "SQL Formatter",
  description:
    "Format and indent SQL queries for 19 dialects, including PostgreSQL, MySQL, BigQuery, Snowflake, and T-SQL.",
  longDescription:
    "Paste a query that arrived as one unreadable line and get it back indented, with keywords cased consistently and clauses on their own lines. Nineteen dialects are supported, so BigQuery, Snowflake, and T-SQL syntax is parsed rather than mangled. The formatter runs entirely in your browser, which is the point: a production query usually carries table names, column names, and literal values that should not be pasted into someone else's server.",
  category: "developer",
  keywords: [
    "sql formatter",
    "sql beautifier",
    "format sql query online",
    "postgresql formatter",
    "sql pretty print",
  ],
  tags: ["sql", "formatter", "database", "developer", "query", "beautify"],
  icon: Database,
  features: [
    "19 dialects including PostgreSQL, MySQL, BigQuery, Snowflake, Trino, and T-SQL",
    "Keyword case set to upper, lower, or left as written",
    "Two space, four space, or tab indentation",
    "Specific parse errors instead of silently mangled output",
    "Copy or download the formatted query",
  ],
  faqs: [
    {
      question: "Is my query sent to a server?",
      answer:
        "No. Formatting happens in your browser, so the query text, table names, and any literal values in it never leave your machine. That is the main reason to use a client-side formatter for anything touching production.",
    },
    {
      question: "Which dialect should I choose?",
      answer:
        "Pick the database you are actually querying. Standard SQL works for ordinary queries, but dialect-specific syntax such as BigQuery's backtick-quoted table names or T-SQL's square brackets needs the matching dialect to parse correctly.",
    },
    {
      question: "Does the formatter change what my query does?",
      answer:
        "No. It only changes whitespace and keyword case. Identifiers, string literals, and comments are preserved as written.",
    },
    {
      question: "Why does it report an error on my query?",
      answer:
        "The formatter parses the query rather than applying regular expressions, so syntax it cannot parse is reported instead of guessed at. Switching to the correct dialect resolves most of these.",
    },
  ],
  relatedTools: ["json-formatter", "regex-tester", "json-to-csv"],
}

export default meta
