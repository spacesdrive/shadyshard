import { useMemo, useState } from "react"
import { AlertCircle, Check, Trash2 } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CopyButton } from "@/components/tool/CopyButton"
import { DownloadButton } from "@/components/tool/DownloadButton"

const REPLACEMENT_CHARACTER = "�"

/**
 * The 0x80 to 0x9F range is the only place Windows-1252 differs from
 * Latin-1: Latin-1 leaves it as control characters, Windows-1252 fills it
 * with punctuation. Reversing a misread means mapping each of these
 * characters back to the byte it was displayed for.
 */
const CP1252_HIGH = [
  "€",
  "",
  "‚",
  "ƒ",
  "„",
  "…",
  "†",
  "‡",
  "ˆ",
  "‰",
  "Š",
  "‹",
  "Œ",
  "",
  "Ž",
  "",
  "",
  "‘",
  "’",
  "“",
  "”",
  "•",
  "–",
  "—",
  "˜",
  "™",
  "š",
  "›",
  "œ",
  "",
  "ž",
  "Ÿ",
]

const CP1252_TO_BYTE = new Map<string, number>(
  CP1252_HIGH.flatMap((character, index) =>
    character ? [[character, 0x80 + index] as [string, number]] : [],
  ),
)

/** Characters that only appear in text as a result of a misread encoding. */
const SUSPICIOUS = /[ÂÃÄÅ‘’‚“”€™�](?=[-¿†‡…ˆ‰Š‹ŒŽ‘’‚“”•˜™š›œžŸ€])|�/g

function countSuspicious(value: string): number {
  return (value.match(SUSPICIOUS) ?? []).length
}

/**
 * Turns each character back into the single byte it was displayed for.
 * Returns null when a character has no single-byte representation, which
 * means the text was not produced by this kind of misread.
 */
function toBytes(value: string, encoding: "windows-1252" | "latin1"): Uint8Array | null {
  const bytes = new Uint8Array(value.length)
  for (let i = 0; i < value.length; i++) {
    const code = value.codePointAt(i) ?? 0
    if (code > 0xffff) return null
    if (code <= 0xff) {
      bytes[i] = code
      continue
    }
    if (encoding === "latin1") return null
    const mapped = CP1252_TO_BYTE.get(value[i])
    if (mapped === undefined) return null
    bytes[i] = mapped
  }
  return bytes
}

function decodeStrictUtf8(bytes: Uint8Array): string | null {
  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(bytes)
  } catch {
    return null
  }
}

interface Candidate {
  label: string
  output: string
  suspicious: number
  changed: number
}

function countChanged(before: string, after: string): number {
  const beforeChars = Array.from(before)
  const afterChars = Array.from(after)
  return Math.abs(beforeChars.length - afterChars.length) || afterChars.length
}

function repair(input: string): Candidate[] {
  if (!input) return []

  const attempts: {
    label: string
    passes: number
    encoding: "windows-1252" | "latin1"
  }[] = [
    { label: "Read as Windows-1252", passes: 1, encoding: "windows-1252" },
    { label: "Read as Latin-1", passes: 1, encoding: "latin1" },
    { label: "Mangled twice as Windows-1252", passes: 2, encoding: "windows-1252" },
    { label: "Mangled twice as Latin-1", passes: 2, encoding: "latin1" },
  ]

  const candidates: Candidate[] = []

  for (const attempt of attempts) {
    let current = input
    let ok = true
    for (let pass = 0; pass < attempt.passes; pass++) {
      const bytes = toBytes(current, attempt.encoding)
      const decoded = bytes ? decodeStrictUtf8(bytes) : null
      if (decoded === null) {
        ok = false
        break
      }
      current = decoded
    }
    if (!ok || current === input) continue
    if (candidates.some((entry) => entry.output === current)) continue

    candidates.push({
      label: attempt.label,
      output: current,
      suspicious: countSuspicious(current),
      changed: countChanged(input, current),
    })
  }

  return candidates.sort((a, b) => a.suspicious - b.suspicious || a.changed - b.changed)
}

export default function EncodingFixer() {
  const [input, setInput] = useState("")

  const candidates = useMemo(() => repair(input), [input])
  const inputSuspicious = countSuspicious(input)
  const hasReplacementCharacters = input.includes(REPLACEMENT_CHARACTER)

  return (
    <div className="space-y-5">
      <div>
        <Label htmlFor="encoding-input">Garbled text</Label>
        <Textarea
          id="encoding-input"
          name="input"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Paste text where accented characters came out wrong"
          className="mt-1.5 min-h-36 resize-y font-mono text-sm"
          spellCheck={false}
        />
        {input && (
          <p className="text-muted-foreground mt-1.5 text-xs tabular-nums">
            {inputSuspicious} suspicious{" "}
            {inputSuspicious === 1 ? "sequence" : "sequences"} in the input
          </p>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setInput("")}
          disabled={!input}
        >
          <Trash2 className="size-4" />
          Reset
        </Button>
      </div>

      {hasReplacementCharacters && (
        <div className="border-destructive/30 bg-destructive/10 text-destructive flex items-start gap-2 rounded-lg border p-3 text-sm">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <span>
            This text contains replacement characters, which means some bytes were
            discarded when it was decoded. Those characters cannot be recovered by any
            tool, so the source file needs exporting again as UTF-8.
          </span>
        </div>
      )}

      {input && candidates.length === 0 && (
        <p className="text-muted-foreground text-sm">
          No reversible misread was found. Either this text is already correct, or the
          damage was not caused by UTF-8 being read as a single-byte encoding.
        </p>
      )}

      {candidates.map((candidate, index) => (
        <div
          key={candidate.label}
          className="border-border/60 bg-card space-y-3 rounded-lg border p-4"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium">{candidate.label}</span>
              {index === 0 && (
                <Badge variant="secondary">
                  <Check className="size-3" aria-hidden />
                  Most likely
                </Badge>
              )}
              {candidate.suspicious > 0 && (
                <span className="text-muted-foreground text-xs tabular-nums">
                  {candidate.suspicious} suspicious remaining
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <CopyButton value={candidate.output} label="Copy" />
              <DownloadButton
                getBlob={() =>
                  new Blob([candidate.output], { type: "text/plain;charset=utf-8" })
                }
                filename="repaired.txt"
              />
            </div>
          </div>
          <Textarea
            id={`encoding-output-${index}`}
            name={`output-${index}`}
            value={candidate.output}
            readOnly
            className="min-h-28 resize-y font-mono text-sm"
            aria-label={`Repaired text, ${candidate.label}`}
          />
        </div>
      ))}
    </div>
  )
}
