import { useMemo, useState } from "react"
import { Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CopyButton } from "@/components/tool/CopyButton"
import { DownloadButton } from "@/components/tool/DownloadButton"

/** Mathematical Bold code points, the only "bold plain text" Unicode offers. */
const BOLD_UPPER = 0x1d400
const BOLD_LOWER = 0x1d41a
const BOLD_DIGIT = 0x1d7ce

function toUnicodeBold(text: string): string {
  let out = ""
  for (const char of text) {
    const code = char.codePointAt(0) ?? 0
    if (code >= 65 && code <= 90) {
      out += String.fromCodePoint(BOLD_UPPER + (code - 65))
    } else if (code >= 97 && code <= 122) {
      out += String.fromCodePoint(BOLD_LOWER + (code - 97))
    } else if (code >= 48 && code <= 57) {
      out += String.fromCodePoint(BOLD_DIGIT + (code - 48))
    } else {
      out += char
    }
  }
  return out
}

/** How many leading characters of a word to emphasise. */
function fixationLength(
  word: string,
  percent: number,
  minimumWordLength: number,
): number {
  if (word.length < minimumWordLength) return 0
  return Math.max(1, Math.min(word.length - 1, Math.round((word.length * percent) / 100)))
}

interface Segment {
  bold: string
  rest: string
}

/** Splits on whitespace but keeps it, so line breaks and spacing survive. */
function convert(
  text: string,
  percent: number,
  minimumWordLength: number,
): (Segment | string)[] {
  return text.split(/(\s+)/).map((chunk) => {
    if (chunk === "" || /^\s+$/.test(chunk)) return chunk

    const leading = chunk.match(/^[^A-Za-z0-9]*/)?.[0] ?? ""
    const core = chunk.slice(leading.length)
    const wordMatch = core.match(/^[A-Za-z0-9'-]*/)?.[0] ?? ""
    const trailing = core.slice(wordMatch.length)

    const boldCount = fixationLength(wordMatch, percent, minimumWordLength)
    if (boldCount === 0) return chunk

    return {
      bold: leading + wordMatch.slice(0, boldCount),
      rest: wordMatch.slice(boldCount) + trailing,
    }
  })
}

function toHtml(segments: (Segment | string)[]): string {
  return segments
    .map((segment) =>
      typeof segment === "string"
        ? segment
        : `<strong>${segment.bold}</strong>${segment.rest}`,
    )
    .join("")
}

function toPlainBold(segments: (Segment | string)[]): string {
  return segments
    .map((segment) =>
      typeof segment === "string" ? segment : toUnicodeBold(segment.bold) + segment.rest,
    )
    .join("")
}

const SAMPLE =
  "Reading long blocks of text can be hard to stay with when your attention keeps slipping. Emphasising the first part of each word gives your eyes a fixation point to land on, so they move forward through the sentence instead of drifting back."

export default function BionicReadingConverter() {
  const [input, setInput] = useState(SAMPLE)
  const [percent, setPercent] = useState(50)
  const [minimumWordLength, setMinimumWordLength] = useState(3)
  const [skipShortWords, setSkipShortWords] = useState(true)
  const [output, setOutput] = useState("preview")

  const segments = useMemo(
    () => convert(input, percent, skipShortWords ? minimumWordLength : 1),
    [input, percent, minimumWordLength, skipShortWords],
  )

  const html = useMemo(() => toHtml(segments), [segments])
  const plainBold = useMemo(() => toPlainBold(segments), [segments])

  return (
    <div className="space-y-5">
      <div>
        <Label htmlFor="bionic-input">Text</Label>
        <Textarea
          id="bionic-input"
          name="text"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Paste an article, a chapter, or your own notes."
          className="mt-1.5 min-h-40 resize-y text-sm"
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Fixation strength</span>
            <span className="text-muted-foreground font-mono text-sm tabular-nums">
              {percent}%
            </span>
          </div>
          <Slider
            aria-label="Fixation strength as a percentage of each word"
            value={[percent]}
            min={20}
            max={80}
            step={5}
            onValueChange={(value) => setPercent(Array.isArray(value) ? value[0] : value)}
            className="mt-3"
          />
        </div>

        <div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Skip words shorter than</span>
            <span className="text-muted-foreground font-mono text-sm tabular-nums">
              {minimumWordLength} letters
            </span>
          </div>
          <Slider
            aria-label="Minimum word length to emphasise"
            value={[minimumWordLength]}
            min={2}
            max={6}
            step={1}
            disabled={!skipShortWords}
            onValueChange={(value) =>
              setMinimumWordLength(Array.isArray(value) ? value[0] : value)
            }
            className="mt-3"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Switch
          id="bionic-skip-short"
          name="skipShortWords"
          checked={skipShortWords}
          onCheckedChange={setSkipShortWords}
        />
        <Label htmlFor="bionic-skip-short" className="font-normal">
          Leave short words unemphasised
        </Label>
      </div>

      <Tabs value={output} onValueChange={(value) => setOutput(value as string)}>
        <TabsList>
          <TabsTrigger value="preview">Preview</TabsTrigger>
          <TabsTrigger value="html">HTML</TabsTrigger>
          <TabsTrigger value="plain">Plain text</TabsTrigger>
        </TabsList>
      </Tabs>

      {output === "preview" && (
        <div className="border-border/60 rounded-lg border p-4 text-base leading-relaxed whitespace-pre-wrap">
          {segments.length === 0 || !input.trim() ? (
            <span className="text-muted-foreground text-sm">
              The converted text appears here.
            </span>
          ) : (
            segments.map((segment, index) =>
              typeof segment === "string" ? (
                <span key={index}>{segment}</span>
              ) : (
                <span key={index}>
                  <strong>{segment.bold}</strong>
                  {segment.rest}
                </span>
              ),
            )
          )}
        </div>
      )}

      {output === "html" && (
        <div>
          <Label htmlFor="bionic-html">HTML source</Label>
          <Textarea
            id="bionic-html"
            name="html"
            value={html}
            readOnly
            className="bg-muted/40 mt-1.5 min-h-40 resize-y font-mono text-sm"
            spellCheck={false}
          />
        </div>
      )}

      {output === "plain" && (
        <div>
          <Label htmlFor="bionic-plain">Plain text with Unicode bold</Label>
          <Textarea
            id="bionic-plain"
            name="plain"
            value={plainBold}
            readOnly
            className="bg-muted/40 mt-1.5 min-h-40 resize-y text-sm"
            spellCheck={false}
          />
          <div className="border-border/60 text-muted-foreground mt-3 flex items-start gap-2 rounded-lg border p-3 text-sm">
            <Info className="mt-0.5 size-4 shrink-0" />
            <span>
              This version pastes into apps that do not accept formatting, but it uses
              mathematical symbol characters rather than real letters. Screen readers and
              search often handle it poorly, so prefer the HTML output for anything
              published on the web.
            </span>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <CopyButton
          value={output === "plain" ? plainBold : html}
          label={output === "plain" ? "Copy plain text" : "Copy HTML"}
        />
        <DownloadButton
          getBlob={() =>
            output === "plain"
              ? new Blob([plainBold], { type: "text/plain" })
              : new Blob([html], { type: "text/html" })
          }
          filename={output === "plain" ? "bionic-text.txt" : "bionic-text.html"}
          disabled={!input.trim()}
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
