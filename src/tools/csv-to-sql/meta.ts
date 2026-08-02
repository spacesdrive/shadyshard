import { Database } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "csv-to-sql",
  title: "CSV to SQL Insert",
  description:
    "Turn CSV or spreadsheet rows into SQL INSERT statements, with an optional CREATE TABLE.",
  longDescription:
    "Paste rows copied out of a spreadsheet or exported as CSV and get the SQL to load them into a table. Column types are inferred from the data, so numeric columns are written unquoted and everything else is quoted with single quotes doubled for escaping. Identifiers are quoted using the convention of the dialect you pick, which is what keeps a column called order or a header with a space in it from breaking the statement. Most converters for this ask you to upload the file first. This one parses the text in your browser, so a customer export or a seed file for an internal system never leaves your machine.",
  category: "developer",
  keywords: [
    "csv to sql",
    "csv to insert statement",
    "generate sql insert from csv",
    "spreadsheet to sql",
    "csv to create table",
  ],
  tags: ["csv", "sql", "insert", "database", "convert", "seed"],
  icon: Database,
  features: [
    "Generates INSERT statements for MySQL, PostgreSQL, SQLite, or SQL Server",
    "Optional CREATE TABLE with column types inferred from the data",
    "Single multi-row insert or one statement per row",
    "Comma, semicolon, tab, and pipe delimited input",
    "Escapes quotes correctly and can write empty cells as NULL",
  ],
  faqs: [
    {
      question: "How are column types decided?",
      answer:
        "Each column is scanned across every data row. A column where every non-empty value is a whole number becomes an integer type, one where every value is numeric but some have decimals becomes a floating point type, and anything else becomes a text type. Dates and booleans are treated as text, since their correct type depends on the target schema rather than the sample.",
    },
    {
      question: "Are quotes and apostrophes in my data escaped safely?",
      answer:
        "Yes. Single quotes inside a value are doubled, which is the standard SQL escape, so a name like O'Neill produces 'O''Neill'. Table and column names are quoted using the selected dialect's convention: backticks for MySQL, double quotes for PostgreSQL and SQLite, and square brackets for SQL Server.",
    },
    {
      question: "Should I use one multi-row insert or one statement per row?",
      answer:
        "A single multi-row insert is faster to execute and is the better default for seed data. One statement per row is easier to run partially, easier to diff in version control, and is what you want if a single bad row should not abort the whole load.",
    },
    {
      question: "Is my CSV uploaded anywhere?",
      answer:
        "No. The rows are parsed and the SQL is built entirely in your browser with no network request. That is the practical difference from converters that require a file upload, since the data being turned into inserts is often a production export.",
    },
  ],
}

export default meta
