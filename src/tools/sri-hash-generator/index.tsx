import { useEffect, useState } from "react"
import { AlertCircle, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CopyButton } from "@/components/tool/CopyButton"
import { FileDropZone } from "@/components/tool/FileDropZone"
import { hashBytesBase64 } from "@/lib/hash"
import { formatBytes } from "@/lib/image"

const ALGORITHMS = [
  { id: "SHA-256", prefix: "sha256" },
  { id: "SHA-384", prefix: "sha384" },
  { id: "SHA-512", prefix: "sha512" },
] as const

type AlgorithmId = (typeof ALGORITHMS)[number]["id"]

type Source = "file" | "text"

export default function SriHashGenerator() {
  const [source, setSource] = useState<Source>("file")
  const [file, setFile] = useState<File | null>(null)
  const [text, setText] = useState("")
  const [url, setUrl] = useState("")
  const [selected, setSelected] = useState<AlgorithmId[]>(["SHA-384"])
  const [digests, setDigests] = useState<Record<string, string>>({})
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function run() {
      setError(null)

      const bytes =
        source === "file"
          ? file
            ? new Uint8Array(await file.arrayBuffer())
            : null
          : text
            ? new TextEncoder().encode(text)
            : null

      if (!bytes) {
        if (!cancelled) setDigests({})
        return
      }

      try {
        const entries = await Promise.all(
          ALGORITHMS.map(
            async ({ id }) => [id, await hashBytesBase64(bytes, id)] as const,
          ),
        )
        if (!cancelled) setDigests(Object.fromEntries(entries))
      } catch {
        if (!cancelled) {
          setDigests({})
          setError("This browser could not hash the input with the Web Crypto API.")
        }
      }
    }

    void run()
    return () => {
      cancelled = true
    }
  }, [source, file, text])

  const ordered = ALGORITHMS.filter((entry) => selected.includes(entry.id))
  const integrity = ordered
    .map((entry) => (digests[entry.id] ? `${entry.prefix}-${digests[entry.id]}` : ""))
    .filter(Boolean)
    .join(" ")

  const resourceUrl = url.trim() || (file ? file.name : "https://cdn.example.com/lib.js")
  const isStylesheet = /\.css($|\?)/i.test(resourceUrl)
  const tag = integrity
    ? isStylesheet
      ? `<link rel="stylesheet" href="${resourceUrl}" integrity="${integrity}" crossorigin="anonymous">`
      : `<script src="${resourceUrl}" integrity="${integrity}" crossorigin="anonymous"></script>`
    : ""

  function toggleAlgorithm(id: AlgorithmId, on: boolean) {
    setSelected((current) => {
      const next = on ? [...current, id] : current.filter((entry) => entry !== id)
      // At least one algorithm has to stay on, or there is nothing to emit.
      return next.length ? next : current
    })
  }

  function reset() {
    setFile(null)
    setText("")
    setUrl("")
    setSelected(["SHA-384"])
    setDigests({})
    setError(null)
  }

  return (
    <div className="space-y-4">
      <Tabs value={source} onValueChange={(value) => setSource(value as Source)}>
        <TabsList>
          <TabsTrigger value="file">From a file</TabsTrigger>
          <TabsTrigger value="text">From pasted text</TabsTrigger>
        </TabsList>
      </Tabs>

      {source === "file" ? (
        <div className="space-y-2">
          <FileDropZone
            accept=".js,.mjs,.css,.json,.wasm,text/*,application/javascript"
            onFiles={(files) => setFile(files[0])}
            hint="Any script, stylesheet, or other asset you are going to reference"
          />
          {file && (
            <p className="text-muted-foreground text-sm">
              {file.name} ({formatBytes(file.size)})
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          <Label htmlFor="sri-text">File contents</Label>
          <Textarea
            id="sri-text"
            name="text"
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder="Paste the exact contents of the file you will ship..."
            className="min-h-40 resize-y font-mono text-sm"
          />
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="sri-url">
          Resource URL (optional, used in the generated tag)
        </Label>
        <Input
          id="sri-url"
          name="url"
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          placeholder="https://cdn.example.com/lib@1.2.3/dist/lib.min.js"
          className="font-mono text-sm"
          spellCheck={false}
        />
      </div>

      <fieldset className="space-y-3">
        <legend className="text-sm font-medium">Algorithms</legend>
        <div className="grid gap-3 sm:grid-cols-3">
          {ALGORITHMS.map((entry) => (
            <div key={entry.id} className="flex items-center gap-2">
              <Switch
                id={`sri-${entry.prefix}`}
                name={entry.prefix}
                checked={selected.includes(entry.id)}
                onCheckedChange={(on) => toggleAlgorithm(entry.id, on)}
              />
              <Label htmlFor={`sri-${entry.prefix}`}>{entry.id}</Label>
            </div>
          ))}
        </div>
      </fieldset>

      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={reset}
          disabled={!file && !text && !url}
        >
          <RotateCcw className="size-4" />
          Reset
        </Button>
      </div>

      {error && (
        <p role="alert" className="text-destructive flex items-start gap-2 text-sm">
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
          {error}
        </p>
      )}

      {integrity && (
        <div className="space-y-4">
          <div className="border-border/60 space-y-2 rounded-lg border p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-sm font-medium">integrity attribute</span>
              <CopyButton value={integrity} label="Copy value" />
            </div>
            <p className="font-mono text-sm break-all">{integrity}</p>
          </div>

          <div className="border-border/60 space-y-2 rounded-lg border p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-sm font-medium">
                {isStylesheet ? "Stylesheet tag" : "Script tag"}
              </span>
              <CopyButton value={tag} label="Copy tag" />
            </div>
            <p className="font-mono text-sm break-all">{tag}</p>
          </div>
        </div>
      )}
    </div>
  )
}
