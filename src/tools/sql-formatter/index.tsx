import { useMemo, useState } from "react"
import { AlertCircle, Trash2 } from "lucide-react"
import { format, type KeywordCase, type SqlLanguage } from "sql-formatter"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CopyButton } from "@/components/tool/CopyButton"
import { DownloadButton } from "@/components/tool/DownloadButton"

const DIALECTS: { value: SqlLanguage; label: string }[] = [
  { value: "sql", label: "Standard SQL" },
  { value: "bigquery", label: "BigQuery" },
  { value: "clickhouse", label: "ClickHouse" },
  { value: "db2", label: "IBM DB2" },
  { value: "duckdb", label: "DuckDB" },
  { value: "hive", label: "Apache Hive" },
  { value: "mariadb", label: "MariaDB" },
  { value: "mysql", label: "MySQL" },
  { value: "n1ql", label: "Couchbase N1QL" },
  { value: "plsql", label: "Oracle PL/SQL" },
  { value: "postgresql", label: "PostgreSQL" },
  { value: "redshift", label: "Amazon Redshift" },
  { value: "singlestoredb", label: "SingleStoreDB" },
  { value: "snowflake", label: "Snowflake" },
  { value: "spark", label: "Apache Spark" },
  { value: "sqlite", label: "SQLite" },
  { value: "tidb", label: "TiDB" },
  { value: "transactsql", label: "SQL Server (T-SQL)" },
  { value: "trino", label: "Trino and Presto" },
]

const KEYWORD_CASES: { value: KeywordCase; label: string }[] = [
  { value: "upper", label: "UPPERCASE" },
  { value: "lower", label: "lowercase" },
  { value: "preserve", label: "Leave as written" },
]

const INDENTS: { value: string; label: string; tabWidth: number; useTabs: boolean }[] = [
  { value: "2", label: "2 spaces", tabWidth: 2, useTabs: false },
  { value: "4", label: "4 spaces", tabWidth: 4, useTabs: false },
  { value: "tab", label: "Tabs", tabWidth: 1, useTabs: true },
]

export default function SqlFormatter() {
  const [query, setQuery] = useState("")
  const [language, setLanguage] = useState<SqlLanguage>("sql")
  const [keywordCase, setKeywordCase] = useState<KeywordCase>("upper")
  const [indent, setIndent] = useState("2")

  const result = useMemo(() => {
    if (!query.trim()) return { formatted: "", error: null as string | null }
    const indentOption = INDENTS.find((entry) => entry.value === indent) ?? INDENTS[0]
    try {
      return {
        formatted: format(query, {
          language,
          keywordCase,
          tabWidth: indentOption.tabWidth,
          useTabs: indentOption.useTabs,
        }),
        error: null,
      }
    } catch (thrown) {
      return {
        formatted: "",
        error:
          thrown instanceof Error
            ? thrown.message
            : "This query could not be parsed with the selected dialect.",
      }
    }
  }, [query, language, keywordCase, indent])

  return (
    <div className="space-y-5">
      <div>
        <Label htmlFor="sql-input">SQL query</Label>
        <Textarea
          id="sql-input"
          name="query"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="select id, email from users u join orders o on o.user_id = u.id where o.total > 100 order by o.created_at desc"
          className="mt-1.5 min-h-40 resize-y font-mono text-sm"
          spellCheck={false}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <Label htmlFor="sql-dialect">Dialect</Label>
          <Select
            value={language}
            onValueChange={(next) => next && setLanguage(next as SqlLanguage)}
          >
            <SelectTrigger id="sql-dialect" className="mt-1.5 w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DIALECTS.map((dialect) => (
                <SelectItem key={dialect.value} value={dialect.value}>
                  {dialect.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="sql-keyword-case">Keyword case</Label>
          <Select
            value={keywordCase}
            onValueChange={(next) => next && setKeywordCase(next as KeywordCase)}
          >
            <SelectTrigger id="sql-keyword-case" className="mt-1.5 w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {KEYWORD_CASES.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="sql-indent">Indentation</Label>
          <Select
            value={indent}
            onValueChange={(next) => next && setIndent(next as string)}
          >
            <SelectTrigger id="sql-indent" className="mt-1.5 w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {INDENTS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {result.error && (
        <div className="border-destructive/30 bg-destructive/10 text-destructive flex items-start gap-2 rounded-lg border p-3 text-sm">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <span>{result.error}</span>
        </div>
      )}

      <div>
        <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
          <Label htmlFor="sql-output">Formatted query</Label>
          <div className="flex flex-wrap gap-2">
            <CopyButton value={result.formatted} label="Copy SQL" />
            <DownloadButton
              getBlob={() => new Blob([result.formatted], { type: "application/sql" })}
              filename="query.sql"
              disabled={!result.formatted}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => setQuery("")}
              disabled={!query}
            >
              <Trash2 className="size-4" />
              Clear
            </Button>
          </div>
        </div>
        <Textarea
          id="sql-output"
          name="formatted"
          value={result.formatted}
          readOnly
          className="min-h-56 resize-y font-mono text-sm"
          placeholder="The formatted query appears here"
        />
      </div>
    </div>
  )
}
