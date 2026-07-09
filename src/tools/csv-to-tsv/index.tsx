import { useMemo, useState } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { CopyButton } from "@/components/tool/CopyButton"
import { DownloadButton } from "@/components/tool/DownloadButton"
import { parseDelimited, toDelimited } from "@/lib/csv"

const EXAMPLE = 'name,age,city\nAlice,30,New York\nBob,25,"San Francisco, CA"'

export default function CsvToTsv() {
  const [csv, setCsv] = useState(EXAMPLE)

  const tsv = useMemo(() => toDelimited(parseDelimited(csv, ","), "\t"), [csv])

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="csv-to-tsv-input">CSV</Label>
          <Textarea
            id="csv-to-tsv-input"
            name="csv"
            value={csv}
            onChange={(e) => setCsv(e.target.value)}
            className="mt-1.5 min-h-64 resize-y font-mono text-sm"
            spellCheck={false}
          />
        </div>
        <div>
          <Label htmlFor="csv-to-tsv-output">TSV</Label>
          <Textarea
            id="csv-to-tsv-output"
            name="tsv"
            value={tsv}
            readOnly
            className="mt-1.5 min-h-64 resize-y font-mono text-sm"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <CopyButton value={tsv} label="Copy TSV" />
        <DownloadButton
          getBlob={() => new Blob([tsv], { type: "text/tab-separated-values" })}
          filename="converted.tsv"
          label="Download .tsv"
          disabled={!tsv}
        />
      </div>
    </div>
  )
}
