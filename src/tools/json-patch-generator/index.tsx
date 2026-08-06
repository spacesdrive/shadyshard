import { useMemo, useState } from "react"
import { AlertCircle, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { CopyButton } from "@/components/tool/CopyButton"
import { DownloadButton } from "@/components/tool/DownloadButton"

type Json = unknown

interface PatchOperation {
  op: "add" | "remove" | "replace"
  path: string
  value?: Json
}

/** RFC 6901: ~ becomes ~0 and / becomes ~1, in that order. */
function escapeToken(token: string): string {
  return token.replace(/~/g, "~0").replace(/\//g, "~1")
}

function pointer(path: string[]): string {
  return path.length === 0 ? "" : `/${path.map(escapeToken).join("/")}`
}

function isPlainObject(value: Json): value is Record<string, Json> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function deepEqual(a: Json, b: Json): boolean {
  if (a === b) return true
  if (Array.isArray(a) && Array.isArray(b)) {
    return a.length === b.length && a.every((item, index) => deepEqual(item, b[index]))
  }
  if (isPlainObject(a) && isPlainObject(b)) {
    const aKeys = Object.keys(a)
    const bKeys = Object.keys(b)
    return (
      aKeys.length === bKeys.length &&
      aKeys.every((key) => key in b && deepEqual(a[key], b[key]))
    )
  }
  return false
}

function diff(source: Json, target: Json, path: string[], into: PatchOperation[]): void {
  if (deepEqual(source, target)) return

  if (Array.isArray(source) && Array.isArray(target)) {
    const shared = Math.min(source.length, target.length)
    for (let index = 0; index < shared; index += 1) {
      diff(source[index], target[index], [...path, String(index)], into)
    }
    // Removals run from the end backwards so every index is still valid at
    // the moment its own operation is applied.
    for (let index = source.length - 1; index >= target.length; index -= 1) {
      into.push({ op: "remove", path: pointer([...path, String(index)]) })
    }
    for (let index = source.length; index < target.length; index += 1) {
      into.push({
        op: "add",
        path: pointer([...path, String(index)]),
        value: target[index],
      })
    }
    return
  }

  if (isPlainObject(source) && isPlainObject(target)) {
    for (const key of Object.keys(source)) {
      if (key in target) {
        diff(source[key], target[key], [...path, key], into)
      } else {
        into.push({ op: "remove", path: pointer([...path, key]) })
      }
    }
    for (const key of Object.keys(target)) {
      if (!(key in source)) {
        into.push({ op: "add", path: pointer([...path, key]), value: target[key] })
      }
    }
    return
  }

  into.push({ op: "replace", path: pointer(path), value: target })
}

interface Outcome {
  patch: PatchOperation[] | null
  error: string | null
}

function buildPatch(sourceText: string, targetText: string): Outcome {
  if (!sourceText.trim() || !targetText.trim()) return { patch: null, error: null }

  let source: Json
  try {
    source = JSON.parse(sourceText)
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error)
    return { patch: null, error: `Source document is not valid JSON. ${detail}` }
  }

  let target: Json
  try {
    target = JSON.parse(targetText)
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error)
    return { patch: null, error: `Target document is not valid JSON. ${detail}` }
  }

  const operations: PatchOperation[] = []
  diff(source, target, [], operations)
  return { patch: operations, error: null }
}

export default function JsonPatchGenerator() {
  const [sourceText, setSourceText] = useState("")
  const [targetText, setTargetText] = useState("")
  const [pretty, setPretty] = useState(true)

  const outcome = useMemo(
    () => buildPatch(sourceText, targetText),
    [sourceText, targetText],
  )

  const output = useMemo(() => {
    if (!outcome.patch) return ""
    return pretty ? JSON.stringify(outcome.patch, null, 2) : JSON.stringify(outcome.patch)
  }, [outcome.patch, pretty])

  function reset() {
    setSourceText("")
    setTargetText("")
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="json-patch-source">Source document</Label>
          <Textarea
            id="json-patch-source"
            name="source"
            value={sourceText}
            onChange={(event) => setSourceText(event.target.value)}
            placeholder='{"name":"Ada","tags":["math"]}'
            className="min-h-56 resize-y font-mono text-sm"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="json-patch-target">Target document</Label>
          <Textarea
            id="json-patch-target"
            name="target"
            value={targetText}
            onChange={(event) => setTargetText(event.target.value)}
            placeholder='{"name":"Ada Lovelace","tags":["math","computing"]}'
            className="min-h-56 resize-y font-mono text-sm"
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <Switch
            id="json-patch-pretty"
            name="pretty"
            checked={pretty}
            onCheckedChange={setPretty}
          />
          <Label htmlFor="json-patch-pretty">Pretty print</Label>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={reset}
          disabled={!sourceText && !targetText}
        >
          <RotateCcw className="size-4" />
          Reset
        </Button>
      </div>

      {outcome.error && (
        <p
          role="alert"
          className="text-destructive flex items-start gap-2 text-sm break-words"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
          {outcome.error}
        </p>
      )}

      {outcome.patch && (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-muted-foreground text-sm">
              {outcome.patch.length === 0
                ? "The two documents are already equivalent."
                : `${outcome.patch.length} ${outcome.patch.length === 1 ? "operation" : "operations"}`}
            </p>
            <div className="flex gap-2">
              <CopyButton value={output} label="Copy patch" />
              <DownloadButton
                getBlob={() => new Blob([output], { type: "application/json" })}
                filename="patch.json"
                disabled={outcome.patch.length === 0}
              />
            </div>
          </div>
          <Textarea
            id="json-patch-output"
            name="patch"
            value={output}
            readOnly
            className="min-h-56 resize-y font-mono text-sm"
            aria-label="Generated JSON Patch"
          />
        </div>
      )}
    </div>
  )
}
