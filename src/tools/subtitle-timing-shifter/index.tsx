import { useMemo, useState } from "react"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { CopyButton } from "@/components/tool/CopyButton"
import { DownloadButton } from "@/components/tool/DownloadButton"
import { FileDropZone } from "@/components/tool/FileDropZone"
import {
  detectFormat,
  formatTimestamp,
  parseSubtitles,
  shiftCues,
  toSrt,
  toVtt,
} from "@/lib/subtitle"

const PREVIEW_LIMIT = 5

export default function SubtitleTimingShifter() {
  const [input, setInput] = useState("")
  const [seconds, setSeconds] = useState("0")
  const [milliseconds, setMilliseconds] = useState("0")
  const [sourceName, setSourceName] = useState("subtitles")

  const secondsValue = Number(seconds)
  const millisecondsValue = Number(milliseconds)

  const offsetError =
    !Number.isFinite(secondsValue) || !Number.isInteger(millisecondsValue)
      ? "Enter the offset as numbers, for example 2 seconds and 500 milliseconds."
      : Math.abs(millisecondsValue) > 999
        ? "Milliseconds must be between -999 and 999. Use the seconds field for anything larger."
        : null

  // A negative shift is expressed as negative seconds, so the milliseconds part
  // has to follow the sign of the seconds part rather than being added blindly.
  const offsetMs = offsetError
    ? 0
    : secondsValue < 0 || (secondsValue === 0 && millisecondsValue < 0)
      ? -(Math.abs(secondsValue) * 1000 + Math.abs(millisecondsValue))
      : Math.abs(secondsValue) * 1000 + Math.abs(millisecondsValue)

  const result = useMemo(() => {
    if (!input.trim()) return { cues: null, shifted: null, output: "", error: null }
    try {
      const cues = parseSubtitles(input)
      const shifted = shiftCues(cues, offsetMs)
      const format = detectFormat(input)
      return {
        cues,
        shifted,
        output: format === "vtt" ? toVtt(shifted) : toSrt(shifted),
        error: null,
      }
    } catch (error) {
      return {
        cues: null,
        shifted: null,
        output: "",
        error:
          error instanceof Error ? error.message : "Could not read this subtitle file.",
      }
    }
  }, [input, offsetMs])

  const outputFormat = input.trim() ? detectFormat(input) : "srt"

  async function handleFile(files: File[]) {
    const file = files[0]
    setSourceName(file.name.replace(/\.[^.]+$/, "") || "subtitles")
    setInput(await file.text())
  }

  return (
    <div className="space-y-5">
      <FileDropZone
        accept=".srt,.vtt,text/vtt,text/plain"
        onFiles={handleFile}
        hint="SRT or WebVTT, or paste the contents below"
      />

      <div>
        <Label htmlFor="shift-input">Subtitle text</Label>
        <Textarea
          id="shift-input"
          name="subtitleInput"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder={"1\n00:00:01,000 --> 00:00:04,000\nThe first line of dialogue."}
          className="mt-1.5 min-h-40 resize-y font-mono text-sm"
          spellCheck={false}
          aria-invalid={result.error ? true : undefined}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="shift-seconds">Offset in seconds</Label>
          <Input
            id="shift-seconds"
            name="seconds"
            type="number"
            step="1"
            value={seconds}
            onChange={(event) => setSeconds(event.target.value)}
            className="mt-1.5"
            aria-invalid={offsetError ? true : undefined}
          />
        </div>
        <div>
          <Label htmlFor="shift-milliseconds">Extra milliseconds</Label>
          <Input
            id="shift-milliseconds"
            name="milliseconds"
            type="number"
            step="1"
            value={milliseconds}
            onChange={(event) => setMilliseconds(event.target.value)}
            className="mt-1.5"
            aria-invalid={offsetError ? true : undefined}
          />
        </div>
      </div>

      <p className="text-muted-foreground text-sm">
        {offsetError
          ? "Positive values push subtitles later, negative values pull them earlier."
          : offsetMs === 0
            ? "No shift applied yet. Positive values push subtitles later, negative values pull them earlier."
            : `Every cue moves ${Math.abs(offsetMs) / 1000} seconds ${offsetMs > 0 ? "later" : "earlier"}.`}
      </p>

      {offsetError && <p className="text-destructive text-sm">{offsetError}</p>}
      {result.error && <p className="text-destructive text-sm">{result.error}</p>}

      {result.cues && result.shifted && (
        <div className="border-border/60 overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <caption className="sr-only">
              Original and shifted timings for the first cues
            </caption>
            <thead className="bg-muted/50">
              <tr>
                <th scope="col" className="px-3 py-2 text-left font-medium">
                  Original
                </th>
                <th scope="col" className="px-3 py-2 text-left font-medium">
                  Shifted
                </th>
              </tr>
            </thead>
            <tbody>
              {result.cues.slice(0, PREVIEW_LIMIT).map((cue, index) => (
                <tr key={index} className="border-border/60 border-t">
                  <td className="text-muted-foreground px-3 py-2 font-mono text-xs">
                    {formatTimestamp(cue.start, "srt")}
                  </td>
                  <td className="px-3 py-2 font-mono text-xs">
                    <span className="flex items-center gap-2">
                      <ArrowRight className="text-muted-foreground size-3" aria-hidden />
                      {formatTimestamp(result.shifted[index].start, "srt")}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {result.cues.length > PREVIEW_LIMIT && (
            <p className="text-muted-foreground border-border/60 border-t px-3 py-2 text-xs">
              Showing the first {PREVIEW_LIMIT} of {result.cues.length} cues. All of them
              are shifted.
            </p>
          )}
        </div>
      )}

      <div>
        <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
          <Label htmlFor="shift-output">Shifted subtitles</Label>
          <div className="flex flex-wrap gap-2">
            <CopyButton value={result.output} label="Copy result" />
            <DownloadButton
              getBlob={() =>
                new Blob([result.output], {
                  type: outputFormat === "vtt" ? "text/vtt" : "text/plain",
                })
              }
              filename={`${sourceName}-shifted.${outputFormat}`}
              disabled={!result.output}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setInput("")
                setSeconds("0")
                setMilliseconds("0")
                setSourceName("subtitles")
              }}
              disabled={!input}
            >
              Reset
            </Button>
          </div>
        </div>
        <Textarea
          id="shift-output"
          name="subtitleOutput"
          value={result.output}
          readOnly
          placeholder="The resynced subtitles appear here."
          className="min-h-40 resize-y font-mono text-sm"
          spellCheck={false}
        />
      </div>
    </div>
  )
}
