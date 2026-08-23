import { useMemo, useState } from "react"
import { Info } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { CopyButton } from "@/components/tool/CopyButton"
import { DownloadButton } from "@/components/tool/DownloadButton"

/**
 * The 27 code points Windows-1252 puts in the 0x80 to 0x9F range that
 * Latin-1 leaves as control characters. Keyed by code point rather than by
 * literal character so the table stays readable in a diff.
 */
const CP1252_TO_BYTE: Record<number, number> = {
  0x20ac: 0x80,
  0x201a: 0x82,
  0x0192: 0x83,
  0x201e: 0x84,
  0x2026: 0x85,
  0x2020: 0x86,
  0x2021: 0x87,
  0x02c6: 0x88,
  0x2030: 0x89,
  0x0160: 0x8a,
  0x2039: 0x8b,
  0x0152: 0x8c,
  0x017d: 0x8e,
  0x2018: 0x91,
  0x2019: 0x92,
  0x201c: 0x93,
  0x201d: 0x94,
  0x2022: 0x95,
  0x2013: 0x96,
  0x2014: 0x97,
  0x02dc: 0x98,
  0x2122: 0x99,
  0x0161: 0x9a,
  0x203a: 0x9b,
  0x0153: 0x9c,
  0x017e: 0x9e,
  0x0178: 0x9f,
}

const MAX_PASSES = 5

/**
 * Turns each character back into the single byte it was misread from, or
 * gives up if any character could not have come from a one-byte encoding.
 */
function toMisreadBytes(text: string): Uint8Array | null {
  const bytes = new Uint8Array(text.length)
  let length = 0
  for (const character of text) {
    const code = character.codePointAt(0) ?? 0
    if (code <= 0xff) {
      bytes[length++] = code
      continue
    }
    const mapped = CP1252_TO_BYTE[code]
    if (mapped === undefined) return null
    bytes[length++] = mapped
  }
  return bytes.subarray(0, length)
}

interface Repair {
  text: string
  passes: number
  charactersRemoved: number
}

function repair(input: string): Repair {
  const decoder = new TextDecoder("utf-8", { fatal: true })
  let current = input
  let passes = 0

  while (passes < MAX_PASSES) {
    const bytes = toMisreadBytes(current)
    if (!bytes) break
    let decoded: string
    try {
      decoded = decoder.decode(bytes)
    } catch {
      break
    }
    if (decoded === current) break
    current = decoded
    passes++
  }

  return {
    text: current,
    passes,
    charactersRemoved: input.length - current.length,
  }
}

/** Lead bytes of the UTF-8 sequences that produce almost all real mojibake. */
const LEAD_BYTES = new Set([0xc2, 0xc3, 0xc5, 0xe2, 0xef])

/**
 * True when the text contains a lead byte followed by something that could
 * be a misread continuation byte, which is how damaged text looks even when
 * no safe repair exists.
 */
function looksLikeMojibake(text: string): boolean {
  for (let index = 0; index < text.length - 1; index++) {
    if (!LEAD_BYTES.has(text.charCodeAt(index))) continue
    const next = text.codePointAt(index + 1) ?? 0
    if ((next >= 0x80 && next <= 0xbf) || CP1252_TO_BYTE[next] !== undefined) return true
  }
  return false
}

export default function TextEncodingRepair() {
  const [input, setInput] = useState("")

  const result = useMemo(() => (input ? repair(input) : null), [input])
  const looksDamaged = looksLikeMojibake(input)

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <Label htmlFor="encoding-repair-input">Garbled text</Label>
          <Textarea
            id="encoding-repair-input"
            name="input"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Paste the text with the strange characters in it."
            className="mt-1.5 min-h-56 resize-y font-mono text-sm"
            spellCheck={false}
          />
        </div>
        <div>
          <Label htmlFor="encoding-repair-output">Repaired text</Label>
          <Textarea
            id="encoding-repair-output"
            name="output"
            value={result?.text ?? ""}
            readOnly
            placeholder="The repaired text appears here."
            className="bg-muted/40 mt-1.5 min-h-56 resize-y font-mono text-sm"
            spellCheck={false}
          />
        </div>
      </div>

      {result && (
        <div className="border-border/60 flex items-start gap-2 rounded-lg border p-3 text-sm">
          <Info className="text-muted-foreground mt-0.5 size-4 shrink-0" aria-hidden />
          <span>
            {result.passes === 0
              ? looksDamaged
                ? "This text contains sequences that usually mean misread UTF-8, but reversing them would not produce valid UTF-8, so it was left unchanged. It may have been damaged in a way that loses information."
                : "No misread encoding was found, so the text was left unchanged."
              : `Repaired over ${result.passes} ${result.passes === 1 ? "pass" : "passes"}, replacing ${result.charactersRemoved} extra ${result.charactersRemoved === 1 ? "character" : "characters"}.`}
          </span>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <CopyButton value={result?.text ?? ""} label="Copy repaired text" />
        <DownloadButton
          getBlob={() =>
            new Blob([result?.text ?? ""], { type: "text/plain;charset=utf-8" })
          }
          filename="repaired.txt"
          disabled={!result}
        />
        <Button
          variant="outline"
          size="sm"
          onClick={() => setInput("")}
          disabled={!input}
        >
          Clear
        </Button>
      </div>
    </div>
  )
}
