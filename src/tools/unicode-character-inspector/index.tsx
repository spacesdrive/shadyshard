import { useMemo, useState } from "react"
import { AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { CopyButton } from "@/components/tool/CopyButton"

/**
 * Unicode character names are not exposed by any browser API and the full
 * database is far too large to ship for a single tool, so this covers the
 * characters people actually come here to identify: the invisible ones and the
 * substitutions word processors make silently.
 */
const NOTABLE: Record<number, { name: string; invisible: boolean }> = {
  0x0009: { name: "Tab", invisible: true },
  0x000a: { name: "Line feed", invisible: true },
  0x000d: { name: "Carriage return", invisible: true },
  0x00a0: { name: "No-break space", invisible: true },
  0x00ad: { name: "Soft hyphen", invisible: true },
  0x2000: { name: "En quad", invisible: true },
  0x2002: { name: "En space", invisible: true },
  0x2003: { name: "Em space", invisible: true },
  0x2007: { name: "Figure space", invisible: true },
  0x2009: { name: "Thin space", invisible: true },
  0x200a: { name: "Hair space", invisible: true },
  0x200b: { name: "Zero width space", invisible: true },
  0x200c: { name: "Zero width non-joiner", invisible: true },
  0x200d: { name: "Zero width joiner", invisible: true },
  0x200e: { name: "Left-to-right mark", invisible: true },
  0x200f: { name: "Right-to-left mark", invisible: true },
  0x2011: { name: "Non-breaking hyphen", invisible: false },
  0x2013: { name: "En dash", invisible: false },
  0x2014: { name: "Em dash", invisible: false },
  0x2018: { name: "Left single quotation mark", invisible: false },
  0x2019: { name: "Right single quotation mark", invisible: false },
  0x201c: { name: "Left double quotation mark", invisible: false },
  0x201d: { name: "Right double quotation mark", invisible: false },
  0x2026: { name: "Horizontal ellipsis", invisible: false },
  0x202f: { name: "Narrow no-break space", invisible: true },
  0x2060: { name: "Word joiner", invisible: true },
  0x3000: { name: "Ideographic space", invisible: true },
  0xfeff: { name: "Byte order mark", invisible: true },
  0xfffd: { name: "Replacement character", invisible: false },
}

interface CharacterInfo {
  display: string
  codePoint: number
  hex: string
  entity: string
  bytes: number
  name: string | null
  invisible: boolean
  ascii: boolean
}

const encoder = new TextEncoder()

function describe(codePoint: number): CharacterInfo {
  const character = String.fromCodePoint(codePoint)
  const notable = NOTABLE[codePoint]
  const isControl = codePoint < 0x20 || (codePoint >= 0x7f && codePoint <= 0x9f)
  const invisible = notable?.invisible ?? isControl

  return {
    display: invisible ? "" : character,
    codePoint,
    hex: `U+${codePoint.toString(16).toUpperCase().padStart(4, "0")}`,
    entity: `&#${codePoint};`,
    bytes: encoder.encode(character).length,
    name: notable?.name ?? (isControl ? "Control character" : null),
    invisible,
    ascii: codePoint < 128,
  }
}

function countGraphemes(text: string): number {
  if (typeof Intl.Segmenter === "function") {
    const segmenter = new Intl.Segmenter(undefined, { granularity: "grapheme" })
    return [...segmenter.segment(text)].length
  }
  return [...text].length
}

export default function UnicodeCharacterInspector() {
  const [input, setInput] = useState("")

  const analysis = useMemo(() => {
    if (!input) {
      return { characters: [], graphemes: 0, bytes: 0, invisibleCount: 0, nonAscii: 0 }
    }
    const characters = [...input].map((character) =>
      describe(character.codePointAt(0) ?? 0),
    )
    return {
      characters,
      graphemes: countGraphemes(input),
      bytes: encoder.encode(input).length,
      invisibleCount: characters.filter((entry) => entry.invisible).length,
      nonAscii: characters.filter((entry) => !entry.ascii).length,
    }
  }, [input])

  const invisibleNames = useMemo(
    () =>
      Array.from(
        new Set(
          analysis.characters
            .filter((entry) => entry.invisible && entry.codePoint !== 0x0a)
            .map((entry) => `${entry.name ?? "Unnamed"} (${entry.hex})`),
        ),
      ),
    [analysis.characters],
  )

  const codePointList = analysis.characters.map((entry) => entry.hex).join(" ")

  return (
    <div className="space-y-5">
      <div>
        <Label htmlFor="unicode-input">Text to inspect</Label>
        <Textarea
          id="unicode-input"
          name="text"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Paste the string that is not behaving as expected."
          className="mt-1.5 min-h-32 resize-y font-mono text-sm"
          spellCheck={false}
        />
      </div>

      {input && (
        <>
          <div className="grid gap-3 sm:grid-cols-4">
            <div className="border-border/60 rounded-lg border p-3 text-center">
              <p className="text-lg font-semibold tabular-nums">{analysis.graphemes}</p>
              <p className="text-muted-foreground mt-1 text-xs">Visible characters</p>
            </div>
            <div className="border-border/60 rounded-lg border p-3 text-center">
              <p className="text-lg font-semibold tabular-nums">
                {analysis.characters.length}
              </p>
              <p className="text-muted-foreground mt-1 text-xs">Code points</p>
            </div>
            <div className="border-border/60 rounded-lg border p-3 text-center">
              <p className="text-lg font-semibold tabular-nums">{analysis.bytes}</p>
              <p className="text-muted-foreground mt-1 text-xs">UTF-8 bytes</p>
            </div>
            <div className="border-border/60 rounded-lg border p-3 text-center">
              <p className="text-lg font-semibold tabular-nums">{analysis.nonAscii}</p>
              <p className="text-muted-foreground mt-1 text-xs">Non-ASCII</p>
            </div>
          </div>

          {invisibleNames.length > 0 && (
            <div className="border-border/60 bg-muted/30 flex gap-3 rounded-lg border p-3">
              <AlertTriangle
                className="mt-0.5 size-4 shrink-0 text-amber-500"
                aria-hidden
              />
              <div className="text-sm">
                <p className="font-medium">Invisible characters found</p>
                <p className="text-muted-foreground mt-1">{invisibleNames.join(", ")}</p>
              </div>
            </div>
          )}

          <div className="border-border/60 overflow-x-auto rounded-lg border">
            <table className="w-full text-sm">
              <caption className="sr-only">
                Every code point in the text with its encoding detail
              </caption>
              <thead className="bg-muted/50">
                <tr>
                  <th scope="col" className="px-3 py-2 text-left font-medium">
                    Char
                  </th>
                  <th scope="col" className="px-3 py-2 text-left font-medium">
                    Code point
                  </th>
                  <th scope="col" className="px-3 py-2 text-left font-medium">
                    Decimal
                  </th>
                  <th scope="col" className="px-3 py-2 text-left font-medium">
                    Entity
                  </th>
                  <th scope="col" className="px-3 py-2 text-right font-medium">
                    Bytes
                  </th>
                  <th scope="col" className="px-3 py-2 text-left font-medium">
                    Notes
                  </th>
                </tr>
              </thead>
              <tbody>
                {analysis.characters.map((entry, index) => (
                  <tr key={index} className="border-border/60 border-t">
                    <td className="px-3 py-2 font-mono">
                      {entry.invisible ? (
                        <span className="text-muted-foreground text-xs">hidden</span>
                      ) : (
                        entry.display
                      )}
                    </td>
                    <td className="px-3 py-2 font-mono text-xs">{entry.hex}</td>
                    <td className="px-3 py-2 font-mono text-xs tabular-nums">
                      {entry.codePoint}
                    </td>
                    <td className="px-3 py-2 font-mono text-xs">{entry.entity}</td>
                    <td className="px-3 py-2 text-right font-mono text-xs tabular-nums">
                      {entry.bytes}
                    </td>
                    <td className="px-3 py-2">
                      <span className="flex flex-wrap items-center gap-1.5">
                        {entry.name && (
                          <span className="text-muted-foreground text-xs">
                            {entry.name}
                          </span>
                        )}
                        {entry.invisible && (
                          <Badge variant="outline" className="text-xs">
                            Invisible
                          </Badge>
                        )}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap gap-2">
            <CopyButton value={codePointList} label="Copy code points" />
            <Button variant="outline" size="sm" onClick={() => setInput("")}>
              Reset
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
