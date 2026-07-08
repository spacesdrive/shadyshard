import { useMemo, useState } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { CopyButton } from "@/components/tool/CopyButton"

export default function RemoveDuplicateLines() {
  const [text, setText] = useState("")
  const [ignoreCase, setIgnoreCase] = useState(false)
  const [trimLines, setTrimLines] = useState(true)

  const { result, removedCount } = useMemo(() => {
    const lines = text.split("\n")
    const seen = new Set<string>()
    const output: string[] = []
    let removed = 0

    for (const line of lines) {
      let compareKey = trimLines ? line.trim() : line
      if (ignoreCase) compareKey = compareKey.toLowerCase()
      if (seen.has(compareKey)) {
        removed++
        continue
      }
      seen.add(compareKey)
      output.push(line)
    }

    return { result: output.join("\n"), removedCount: removed }
  }, [text, ignoreCase, trimLines])

  return (
    <div className="space-y-4">
      <Textarea
        id="remove-duplicate-lines-input"
        name="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={"Paste a list of lines here...\napple\nbanana\napple\ncherry"}
        className="min-h-48 resize-y font-mono text-sm"
        aria-label="Lines to de-duplicate"
      />

      <div className="flex flex-wrap gap-6">
        <div className="flex items-center gap-2">
          <Switch
            id="remove-duplicate-lines-case"
            name="ignoreCase"
            checked={ignoreCase}
            onCheckedChange={setIgnoreCase}
          />
          <Label htmlFor="remove-duplicate-lines-case" className="font-normal">
            Ignore case
          </Label>
        </div>
        <div className="flex items-center gap-2">
          <Switch
            id="remove-duplicate-lines-trim"
            name="trimLines"
            checked={trimLines}
            onCheckedChange={setTrimLines}
          />
          <Label htmlFor="remove-duplicate-lines-trim" className="font-normal">
            Trim whitespace before comparing
          </Label>
        </div>
      </div>

      {text && (
        <p className="text-muted-foreground text-sm">
          Removed {removedCount} duplicate line{removedCount === 1 ? "" : "s"}.
        </p>
      )}

      <div className="flex items-center gap-2">
        <CopyButton value={result} label="Copy result" />
      </div>

      <Textarea
        id="remove-duplicate-lines-output"
        name="result"
        value={result}
        readOnly
        className="min-h-48 resize-y font-mono text-sm"
        aria-label="De-duplicated output"
      />
    </div>
  )
}
