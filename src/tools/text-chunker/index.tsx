import { useMemo, useState } from "react"
import { RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CopyButton } from "@/components/tool/CopyButton"
import { DownloadButton } from "@/components/tool/DownloadButton"

type Boundary = "character" | "word" | "sentence" | "paragraph"

const BOUNDARIES: { value: Boundary; label: string }[] = [
  { value: "paragraph", label: "Paragraph end" },
  { value: "sentence", label: "Sentence end" },
  { value: "word", label: "Word end" },
  { value: "character", label: "Exact character count" },
]

/** Roughly four characters per token for English in byte pair encoding tokenizers. */
const CHARACTERS_PER_TOKEN = 4

interface Chunk {
  index: number
  text: string
  characters: number
  words: number
  tokens: number
}

/**
 * Finds where to end a chunk that starts at `start`. Searches backwards from
 * the maximum size for the requested boundary, falling back to the hard limit
 * when no boundary exists inside the window.
 */
function findBreak(
  text: string,
  start: number,
  size: number,
  boundary: Boundary,
): number {
  const hardEnd = Math.min(text.length, start + size)
  if (hardEnd >= text.length || boundary === "character") return hardEnd

  const window = text.slice(start, hardEnd)
  /** Never cut off more than a third of the chunk looking for a nicer break. */
  const floor = Math.floor(size * 0.34)

  if (boundary === "paragraph") {
    const at = window.lastIndexOf("\n\n")
    if (at > floor) return start + at + 2
  }

  if (boundary === "paragraph" || boundary === "sentence") {
    let best = -1
    const sentenceEnd = /[.!?]["')\]]?\s/g
    let match: RegExpExecArray | null
    while ((match = sentenceEnd.exec(window)) !== null) {
      if (match.index > floor) best = match.index + match[0].length
    }
    if (best > floor) return start + best
  }

  const space = window.lastIndexOf(" ")
  if (space > floor) return start + space + 1

  return hardEnd
}

function countWords(text: string): number {
  const trimmed = text.trim()
  return trimmed ? trimmed.split(/\s+/).length : 0
}

function chunkText(
  text: string,
  size: number,
  overlap: number,
  boundary: Boundary,
): Chunk[] {
  if (!text.trim() || size <= 0) return []

  const chunks: Chunk[] = []
  const safeOverlap = Math.min(Math.max(0, overlap), size - 1)
  let start = 0

  while (start < text.length) {
    const end = findBreak(text, start, size, boundary)
    const slice = text.slice(start, end)
    if (slice.trim()) {
      chunks.push({
        index: chunks.length + 1,
        text: slice.trim(),
        characters: slice.trim().length,
        words: countWords(slice),
        tokens: Math.ceil(slice.trim().length / CHARACTERS_PER_TOKEN),
      })
    }
    if (end >= text.length) break
    const next = end - safeOverlap
    start = next > start ? next : end
  }

  return chunks
}

export default function TextChunker() {
  const [input, setInput] = useState("")
  const [size, setSize] = useState("1000")
  const [overlap, setOverlap] = useState("100")
  const [boundary, setBoundary] = useState<Boundary>("sentence")

  const sizeValue = Number(size)
  const overlapValue = Number(overlap)
  const sizeValid = Number.isFinite(sizeValue) && sizeValue >= 50
  const overlapValid =
    Number.isFinite(overlapValue) && overlapValue >= 0 && overlapValue < sizeValue

  const chunks = useMemo(
    () =>
      sizeValid && overlapValid
        ? chunkText(input, sizeValue, overlapValue, boundary)
        : [],
    [input, sizeValue, overlapValue, boundary, sizeValid, overlapValid],
  )

  const totalTokens = chunks.reduce((total, chunk) => total + chunk.tokens, 0)

  const asJson = useMemo(
    () =>
      JSON.stringify(
        chunks.map((chunk) => chunk.text),
        null,
        2,
      ),
    [chunks],
  )

  const asText = useMemo(
    () =>
      chunks.map((chunk) => `--- Chunk ${chunk.index} ---\n${chunk.text}`).join("\n\n"),
    [chunks],
  )

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="chunker-input">Text to split</Label>
        <Textarea
          id="chunker-input"
          name="text"
          className="mt-1.5 min-h-48 resize-y font-mono text-sm"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Paste the document you want to break into chunks"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <Label htmlFor="chunker-size">Chunk size (characters)</Label>
          <Input
            id="chunker-size"
            name="size"
            type="number"
            min={50}
            step={50}
            className="mt-1.5"
            value={size}
            onChange={(event) => setSize(event.target.value)}
          />
          {!sizeValid && (
            <p className="text-destructive mt-1.5 text-sm">
              Use a chunk size of at least 50 characters.
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="chunker-overlap">Overlap (characters)</Label>
          <Input
            id="chunker-overlap"
            name="overlap"
            type="number"
            min={0}
            step={10}
            className="mt-1.5"
            value={overlap}
            onChange={(event) => setOverlap(event.target.value)}
          />
          {!overlapValid && (
            <p className="text-destructive mt-1.5 text-sm">
              Overlap must be zero or more and smaller than the chunk size.
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="chunker-boundary">Break at</Label>
          <Select
            value={boundary}
            onValueChange={(value) => value && setBoundary(value as Boundary)}
          >
            <SelectTrigger id="chunker-boundary" className="mt-1.5 w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {BOUNDARIES.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <CopyButton value={asJson} label="Copy as JSON" />
        <DownloadButton
          getBlob={() => new Blob([asJson], { type: "application/json" })}
          filename="chunks.json"
          disabled={chunks.length === 0}
        />
        <DownloadButton
          getBlob={() => new Blob([asText], { type: "text/plain" })}
          filename="chunks.txt"
          label="Download text"
          disabled={chunks.length === 0}
        />
        <Button
          variant="outline"
          size="sm"
          onClick={() => setInput("")}
          disabled={!input}
        >
          <RotateCcw className="size-4" />
          Reset
        </Button>
      </div>

      {chunks.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="border-border/60 rounded-lg border p-3 text-center">
            <p className="text-2xl font-semibold tabular-nums">{chunks.length}</p>
            <p className="text-muted-foreground mt-1 text-xs">Chunks</p>
          </div>
          <div className="border-border/60 rounded-lg border p-3 text-center">
            <p className="text-2xl font-semibold tabular-nums">
              {input.length.toLocaleString("en-US")}
            </p>
            <p className="text-muted-foreground mt-1 text-xs">Source characters</p>
          </div>
          <div className="border-border/60 rounded-lg border p-3 text-center">
            <p className="text-2xl font-semibold tabular-nums">
              {totalTokens.toLocaleString("en-US")}
            </p>
            <p className="text-muted-foreground mt-1 text-xs">Estimated tokens</p>
          </div>
          <div className="border-border/60 rounded-lg border p-3 text-center">
            <p className="text-2xl font-semibold tabular-nums">
              {Math.round(
                chunks.reduce((total, chunk) => total + chunk.characters, 0) /
                  chunks.length,
              ).toLocaleString("en-US")}
            </p>
            <p className="text-muted-foreground mt-1 text-xs">Average chunk size</p>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {chunks.map((chunk) => (
          <div key={chunk.index} className="border-border/60 rounded-lg border">
            <div className="border-border/60 flex flex-wrap items-center justify-between gap-2 border-b px-3 py-2">
              <h2 className="text-sm font-medium">Chunk {chunk.index}</h2>
              <div className="flex items-center gap-3">
                <span className="text-muted-foreground text-xs tabular-nums">
                  {chunk.characters.toLocaleString("en-US")} characters,{" "}
                  {chunk.words.toLocaleString("en-US")} words, about{" "}
                  {chunk.tokens.toLocaleString("en-US")} tokens
                </span>
                <CopyButton
                  value={chunk.text}
                  label={`Copy chunk ${chunk.index}`}
                  size="icon-sm"
                  variant="ghost"
                />
              </div>
            </div>
            <p className="px-3 py-2 text-sm whitespace-pre-wrap">{chunk.text}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
