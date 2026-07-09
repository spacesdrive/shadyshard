import { useMemo, useState } from "react"
import { AlertCircle } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { CopyButton } from "@/components/tool/CopyButton"
import { DownloadButton } from "@/components/tool/DownloadButton"
import { delimitedToObjects } from "@/lib/csv"

const EXAMPLE = `name,age,city
Alice,30,New York
Bob,25,"San Francisco, CA"`

export default function CsvToJson() {
  const [csv, setCsv] = useState(EXAMPLE)

  const { json, error } = useMemo(() => {
    try {
      const records = delimitedToObjects(csv, ",")
      return { json: JSON.stringify(records, null, 2), error: null }
    } catch (e) {
      return {
        json: "",
        error: e instanceof Error ? e.message : "Could not parse this CSV.",
      }
    }
  }, [csv])

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="csv-to-json-input">CSV</Label>
          <Textarea
            id="csv-to-json-input"
            name="csv"
            value={csv}
            onChange={(e) => setCsv(e.target.value)}
            className="mt-1.5 min-h-72 resize-y font-mono text-sm"
            spellCheck={false}
          />
        </div>
        <div>
          <Label htmlFor="csv-to-json-output">JSON</Label>
          <Textarea
            id="csv-to-json-output"
            name="json"
            value={json}
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
        <CopyButton value={json} label="Copy JSON" />
        <DownloadButton
          getBlob={() => new Blob([json], { type: "application/json" })}
          filename="converted.json"
          label="Download .json"
          disabled={!json}
        />
      </div>
    </div>
  )
}
