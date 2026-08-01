import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CopyButton } from "@/components/tool/CopyButton"

const UPPER_A = 65
const LOWER_A = 97

function shiftLetters(text: string, shift: number): string {
  const offset = ((shift % 26) + 26) % 26
  let out = ""

  for (const char of text) {
    const code = char.charCodeAt(0)
    if (code >= UPPER_A && code <= UPPER_A + 25) {
      out += String.fromCharCode(((code - UPPER_A + offset) % 26) + UPPER_A)
    } else if (code >= LOWER_A && code <= LOWER_A + 25) {
      out += String.fromCharCode(((code - LOWER_A + offset) % 26) + LOWER_A)
    } else {
      out += char
    }
  }

  return out
}

/** ROT47 rotates the 94 printable ASCII characters from '!' to '~'. */
function rot47(text: string): string {
  let out = ""
  for (const char of text) {
    const code = char.charCodeAt(0)
    out +=
      code >= 33 && code <= 126 ? String.fromCharCode(((code - 33 + 47) % 94) + 33) : char
  }
  return out
}

/**
 * Scores a candidate plaintext by how closely its letter frequencies match
 * English, so the brute-force list can surface the readable shift first.
 */
const ENGLISH_FREQUENCY = [
  8.17, 1.49, 2.78, 4.25, 12.7, 2.23, 2.02, 6.09, 6.97, 0.15, 0.77, 4.03, 2.41, 6.75,
  7.51, 1.93, 0.1, 5.99, 6.33, 9.06, 2.76, 0.98, 2.36, 0.15, 1.97, 0.07,
]

function englishScore(text: string): number {
  const counts = new Array(26).fill(0)
  let total = 0

  for (const char of text.toLowerCase()) {
    const index = char.charCodeAt(0) - LOWER_A
    if (index >= 0 && index < 26) {
      counts[index]++
      total++
    }
  }

  if (total === 0) return 0

  let score = 0
  for (let i = 0; i < 26; i++) {
    score += ((counts[i] / total) * 100 * ENGLISH_FREQUENCY[i]) / 100
  }
  return score
}

const SAMPLE = "The quick brown fox jumps over the lazy dog."

function ShiftMode() {
  const [input, setInput] = useState(SAMPLE)
  const [shift, setShift] = useState(13)
  const [decode, setDecode] = useState(false)
  const [useRot47, setUseRot47] = useState(false)

  const output = useMemo(() => {
    if (useRot47) return rot47(input)
    return shiftLetters(input, decode ? -shift : shift)
  }, [input, shift, decode, useRot47])

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-x-6 gap-y-3">
        <div className="flex items-center gap-2">
          <Switch
            id="caesar-decode"
            name="decode"
            checked={decode}
            onCheckedChange={setDecode}
            disabled={useRot47}
          />
          <Label htmlFor="caesar-decode" className="font-normal">
            Decode instead of encode
          </Label>
        </div>
        <div className="flex items-center gap-2">
          <Switch
            id="caesar-rot47"
            name="rot47"
            checked={useRot47}
            onCheckedChange={setUseRot47}
          />
          <Label htmlFor="caesar-rot47" className="font-normal">
            Use ROT47 instead
          </Label>
        </div>
      </div>

      {!useRot47 && (
        <div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Shift</span>
            <span className="text-muted-foreground font-mono text-sm tabular-nums">
              {shift}
              {shift === 13 ? " (ROT13)" : ""}
            </span>
          </div>
          <Slider
            aria-label="Cipher shift"
            value={[shift]}
            min={0}
            max={25}
            step={1}
            onValueChange={(value) => setShift(Array.isArray(value) ? value[0] : value)}
            className="mt-3"
          />
          <div className="mt-3 flex flex-wrap gap-2">
            {[1, 3, 13].map((preset) => (
              <Button
                key={preset}
                variant={shift === preset ? "default" : "outline"}
                size="sm"
                onClick={() => setShift(preset)}
              >
                {preset === 13 ? "ROT13" : `Shift ${preset}`}
              </Button>
            ))}
          </div>
        </div>
      )}

      {useRot47 && (
        <p className="text-muted-foreground text-sm">
          ROT47 rotates every printable ASCII character by 47 places, so digits and
          punctuation change too. It is its own inverse, exactly like ROT13.
        </p>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <Label htmlFor="caesar-input">Input</Label>
          <Textarea
            id="caesar-input"
            name="text"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Type or paste the text to transform."
            className="mt-1.5 min-h-48 resize-y font-mono text-sm"
            spellCheck={false}
          />
        </div>
        <div>
          <Label htmlFor="caesar-output">Output</Label>
          <Textarea
            id="caesar-output"
            name="result"
            value={output}
            readOnly
            placeholder="The transformed text appears here."
            className="bg-muted/40 mt-1.5 min-h-48 resize-y font-mono text-sm"
            spellCheck={false}
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <CopyButton value={output} label="Copy output" />
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

function BruteForceMode() {
  const [input, setInput] = useState("Gur dhvpx oebja sbk whzcf bire gur ynml qbt.")

  const rows = useMemo(() => {
    if (!input.trim()) return []
    const candidates = Array.from({ length: 26 }, (_, shift) => ({
      shift,
      text: shiftLetters(input, -shift),
    }))
    const best = candidates.reduce((winner, candidate) =>
      englishScore(candidate.text) > englishScore(winner.text) ? candidate : winner,
    )
    return candidates.map((candidate) => ({
      ...candidate,
      likely: candidate.shift === best.shift,
    }))
  }, [input])

  return (
    <div className="space-y-5">
      <div>
        <Label htmlFor="caesar-brute-input">Ciphertext</Label>
        <Textarea
          id="caesar-brute-input"
          name="ciphertext"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Paste the encoded text when you do not know the shift."
          className="mt-1.5 min-h-28 resize-y font-mono text-sm"
          spellCheck={false}
        />
        <p className="text-muted-foreground mt-1 text-xs">
          Every shift from 0 to 25 is shown. The row marked as the likely answer is the
          one whose letter frequencies best match English.
        </p>
      </div>

      {rows.length > 0 && (
        <div className="border-border/60 overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <caption className="sr-only">Every Caesar shift applied to the input</caption>
            <thead className="bg-muted/50">
              <tr>
                <th scope="col" className="px-3 py-2 text-left font-medium">
                  Shift
                </th>
                <th scope="col" className="px-3 py-2 text-left font-medium">
                  Decoded text
                </th>
                <th scope="col" className="px-3 py-2 text-right font-medium">
                  Copy
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr
                  key={row.shift}
                  className={`border-border/60 border-t ${row.likely ? "bg-emerald-500/10" : ""}`}
                >
                  <td className="px-3 py-2 font-mono text-xs tabular-nums">
                    {row.shift}
                    {row.likely && (
                      <span className="ml-2 text-xs text-emerald-600 dark:text-emerald-400">
                        likely
                      </span>
                    )}
                  </td>
                  <td className="min-w-0 px-3 py-2 font-mono text-xs break-all">
                    {row.text}
                  </td>
                  <td className="px-3 py-2 text-right">
                    <CopyButton
                      value={row.text}
                      label={`Copy shift ${row.shift}`}
                      variant="ghost"
                      size="icon-sm"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default function CaesarCipher() {
  const [mode, setMode] = useState("shift")

  return (
    <div className="space-y-5">
      <Tabs value={mode} onValueChange={(value) => setMode(value as string)}>
        <TabsList>
          <TabsTrigger value="shift">Encode and decode</TabsTrigger>
          <TabsTrigger value="brute">Try every shift</TabsTrigger>
        </TabsList>
      </Tabs>

      {mode === "shift" ? <ShiftMode /> : <BruteForceMode />}
    </div>
  )
}
