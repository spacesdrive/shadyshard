import { useMemo, useState } from "react"
import { dump } from "js-yaml"
import { AlertCircle } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { CopyButton } from "@/components/tool/CopyButton"
import { DownloadButton } from "@/components/tool/DownloadButton"

const EXAMPLE = JSON.stringify(
  { name: "Alice", role: "Admin", permissions: ["read", "write"], active: true },
  null,
  2,
)

export default function JsonToYaml() {
  const [json, setJson] = useState(EXAMPLE)

  const { yaml, error } = useMemo(() => {
    try {
      const parsed: unknown = JSON.parse(json)
      return { yaml: dump(parsed), error: null }
    } catch (e) {
      return {
        yaml: "",
        error: e instanceof Error ? `Invalid JSON: ${e.message}` : "Invalid JSON.",
      }
    }
  }, [json])

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="json-to-yaml-input">JSON</Label>
          <Textarea
            id="json-to-yaml-input"
            name="json"
            value={json}
            onChange={(e) => setJson(e.target.value)}
            className="mt-1.5 min-h-72 resize-y font-mono text-sm"
            spellCheck={false}
          />
        </div>
        <div>
          <Label htmlFor="json-to-yaml-output">YAML</Label>
          <Textarea
            id="json-to-yaml-output"
            name="yaml"
            value={yaml}
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
        <CopyButton value={yaml} label="Copy YAML" />
        <DownloadButton
          getBlob={() => new Blob([yaml], { type: "application/x-yaml" })}
          filename="converted.yaml"
          label="Download .yaml"
          disabled={!yaml}
        />
      </div>
    </div>
  )
}
