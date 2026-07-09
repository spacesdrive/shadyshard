import { useMemo, useState } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { CopyButton } from "@/components/tool/CopyButton"
import { DownloadButton } from "@/components/tool/DownloadButton"
import { parseDelimited, toDelimited } from "@/lib/csv"

const EXAMPLE = "name\tage\tcity\nAlice\t30\tNew York\nBob\t25\tSan Francisco, CA"

export default function TsvToCsv() {
  const [tsv, setTsv] = useState(EXAMPLE)

  const csv = useMemo(() => toDelimited(parseDelimited(tsv, "\t"), ","), [tsv])

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="tsv-to-csv-input">TSV</Label>
          <Textarea
            id="tsv-to-csv-input"
            name="tsv"
            value={tsv}
            onChange={(e) => setTsv(e.target.value)}
            className="mt-1.5 min-h-64 resize-y font-mono text-sm"
            spellCheck={false}
          />
        </div>
        <div>
          <Label htmlFor="tsv-to-csv-output">CSV</Label>
          <Textarea
            id="tsv-to-csv-output"
            name="csv"
            value={csv}
            readOnly
            className="mt-1.5 min-h-64 resize-y font-mono text-sm"
          />
        </div>
      </div>

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
