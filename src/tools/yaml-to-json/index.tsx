import { useMemo, useState } from "react"
import { load } from "js-yaml"
import { AlertCircle } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { CopyButton } from "@/components/tool/CopyButton"
import { DownloadButton } from "@/components/tool/DownloadButton"

const EXAMPLE = `name: Alice
role: Admin
permissions:
  - read
  - write
active: true`

export default function YamlToJson() {
  const [yaml, setYaml] = useState(EXAMPLE)

  const { json, error } = useMemo(() => {
    try {
      const parsed = load(yaml)
      return { json: JSON.stringify(parsed, null, 2), error: null }
    } catch (e) {
      return {
        json: "",
        error: e instanceof Error ? e.message : "Could not parse this YAML.",
      }
    }
  }, [yaml])

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="yaml-to-json-input">YAML</Label>
          <Textarea
            id="yaml-to-json-input"
            name="yaml"
            value={yaml}
            onChange={(e) => setYaml(e.target.value)}
            className="mt-1.5 min-h-72 resize-y font-mono text-sm"
            spellCheck={false}
          />
        </div>
        <div>
          <Label htmlFor="yaml-to-json-output">JSON</Label>
          <Textarea
            id="yaml-to-json-output"
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
