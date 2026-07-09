import { useMemo, useState } from "react"
import { AlertCircle } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { CopyButton } from "@/components/tool/CopyButton"
import { DownloadButton } from "@/components/tool/DownloadButton"
import { objectsToDelimited } from "@/lib/csv"

const EXAMPLE = JSON.stringify(
  [
    { name: "Alice", age: 30, city: "New York" },
    { name: "Bob", age: 25, city: "San Francisco, CA" },
  ],
  null,
  2,
)

export default function JsonToCsv() {
  const [json, setJson] = useState(EXAMPLE)

  const { csv, error } = useMemo(() => {
    try {
      const parsed: unknown = JSON.parse(json)
      const records = Array.isArray(parsed) ? parsed : [parsed]
      if (
        !records.every((r) => typeof r === "object" && r !== null && !Array.isArray(r))
      ) {
        return { csv: "", error: "JSON must be an object or an array of objects." }
      }
      return {
        csv: objectsToDelimited(records as Record<string, unknown>[], ","),
        error: null,
      }
    } catch (e) {
      return {
        csv: "",
        error: e instanceof Error ? `Invalid JSON: ${e.message}` : "Invalid JSON.",
      }
    }
  }, [json])

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="json-to-csv-input">JSON</Label>
          <Textarea
            id="json-to-csv-input"
            name="json"
            value={json}
            onChange={(e) => setJson(e.target.value)}
            className="mt-1.5 min-h-72 resize-y font-mono text-sm"
            spellCheck={false}
          />
        </div>
        <div>
          <Label htmlFor="json-to-csv-output">CSV</Label>
          <Textarea
            id="json-to-csv-output"
            name="csv"
            value={csv}
            readOnly
            className="mt-1.5 min-h-72 resize-y font-mono text-sm"
          />
        </div>
      </div>

      {error && (
        <div className="border-destructive/30 bg-destructive/10 text-destructive flex items-start gap-2 rounded-lg border p-3 text-sm">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <CopyButton value={csv} label="Copy CSV" />
        <DownloadButton
          getBlob={() => new Blob([csv], { type: "text/csv" })}
          filename="converted.csv"
          label="Download .csv"
          disabled={!csv}
        />
      </div>
    </div>
  )
}
