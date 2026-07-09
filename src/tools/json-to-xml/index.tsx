import { useMemo, useState } from "react"
import { AlertCircle } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CopyButton } from "@/components/tool/CopyButton"
import { DownloadButton } from "@/components/tool/DownloadButton"
import { jsonToXml } from "@/lib/xml"

const EXAMPLE = JSON.stringify(
  {
    "@attributes": { id: "1" },
    name: "Alice",
    email: "alice@example.com",
    role: ["Admin", "Editor"],
  },
  null,
  2,
)

export default function JsonToXml() {
  const [json, setJson] = useState(EXAMPLE)
  const [rootTag, setRootTag] = useState("person")

  const { xml, error } = useMemo(() => {
    try {
      const parsed: unknown = JSON.parse(json)
      return { xml: jsonToXml(rootTag || "root", parsed), error: null }
    } catch (e) {
      return {
        xml: "",
        error: e instanceof Error ? `Invalid JSON: ${e.message}` : "Invalid JSON.",
      }
    }
  }, [json, rootTag])

  return (
    <div className="space-y-4">
      <div className="w-48">
        <Label htmlFor="json-to-xml-root">Root element name</Label>
        <Input
          id="json-to-xml-root"
          name="rootTag"
          value={rootTag}
          onChange={(e) => setRootTag(e.target.value)}
          className="mt-1.5"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="json-to-xml-input">JSON</Label>
          <Textarea
            id="json-to-xml-input"
            name="json"
            value={json}
            onChange={(e) => setJson(e.target.value)}
            className="mt-1.5 min-h-72 resize-y font-mono text-sm"
            spellCheck={false}
          />
        </div>
        <div>
          <Label htmlFor="json-to-xml-output">XML</Label>
          <Textarea
            id="json-to-xml-output"
            name="xml"
            value={xml}
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
        <CopyButton value={xml} label="Copy XML" />
        <DownloadButton
          getBlob={() => new Blob([xml], { type: "application/xml" })}
          filename="converted.xml"
          label="Download .xml"
          disabled={!xml}
        />
      </div>
    </div>
  )
}
