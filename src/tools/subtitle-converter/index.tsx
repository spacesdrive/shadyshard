import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
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
import { FileDropZone } from "@/components/tool/FileDropZone"
import {
  detectFormat,
  formatTimestamp,
  parseSubtitles,
  toPlainText,
  toSrt,
  toVtt,
  type SubtitleCue,
} from "@/lib/subtitle"

const OUTPUT_FORMATS = [
  { value: "vtt", label: "WebVTT (.vtt)", extension: "vtt", mimeType: "text/vtt" },
  { value: "srt", label: "SubRip (.srt)", extension: "srt", mimeType: "text/plain" },
  {
    value: "text",
    label: "Plain text transcript",
    extension: "txt",
    mimeType: "text/plain",
  },
]

function serialise(cues: SubtitleCue[], format: string): string {
  if (format === "srt") return toSrt(cues)
  if (format === "text") return toPlainText(cues)
  return toVtt(cues)
}

export default function SubtitleConverter() {
  const [input, setInput] = useState("")
  const [outputFormat, setOutputFormat] = useState("vtt")
  const [sourceName, setSourceName] = useState("subtitles")

  const result = useMemo(() => {
    if (!input.trim()) return { cues: null, output: "", error: null }
    try {
      const cues = parseSubtitles(input)
      return { cues, output: serialise(cues, outputFormat), error: null }
    } catch (error) {
      return {
        cues: null,
        output: "",
        error:
          error instanceof Error ? error.message : "Could not read this subtitle file.",
      }
    }
  }, [input, outputFormat])

  const selectedFormat =
    OUTPUT_FORMATS.find((format) => format.value === outputFormat) ?? OUTPUT_FORMATS[0]

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
        <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
          <Label htmlFor="subtitle-input">Subtitle text</Label>
          {input.trim() && !result.error && (
            <span className="text-muted-foreground text-xs">
              Detected {detectFormat(input) === "vtt" ? "WebVTT" : "SubRip"}
            </span>
          )}
        </div>
        <Textarea
          id="subtitle-input"
          name="subtitleInput"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder={"1\n00:00:01,000 --> 00:00:04,000\nThe first line of dialogue."}
          className="min-h-44 resize-y font-mono text-sm"
          spellCheck={false}
          aria-invalid={result.error ? true : undefined}
        />
      </div>

      <div className="max-w-sm">
        <Label htmlFor="subtitle-output-format">Convert to</Label>
        <Select
          value={outputFormat}
          onValueChange={(next) => next && setOutputFormat(next as string)}
        >
          <SelectTrigger id="subtitle-output-format" className="mt-1.5 w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {OUTPUT_FORMATS.map((format) => (
              <SelectItem key={format.value} value={format.value}>
                {format.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {result.error && <p className="text-destructive text-sm">{result.error}</p>}

      {result.cues && (
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="border-border/60 rounded-lg border p-3 text-center">
            <p className="text-lg font-semibold tabular-nums">{result.cues.length}</p>
            <p className="text-muted-foreground mt-1 text-xs">
              {result.cues.length === 1 ? "Cue" : "Cues"}
            </p>
          </div>
          <div className="border-border/60 rounded-lg border p-3 text-center">
            <p className="text-lg font-semibold tabular-nums">
              {formatTimestamp(result.cues[result.cues.length - 1].end, "srt").slice(
                0,
                8,
              )}
            </p>
            <p className="text-muted-foreground mt-1 text-xs">Last cue ends at</p>
          </div>
        </div>
      )}

      <div>
        <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
          <Label htmlFor="subtitle-output">Result</Label>
          <div className="flex flex-wrap gap-2">
            <CopyButton value={result.output} label="Copy result" />
            <DownloadButton
              getBlob={() => new Blob([result.output], { type: selectedFormat.mimeType })}
              filename={`${sourceName}.${selectedFormat.extension}`}
              disabled={!result.output}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setInput("")
                setOutputFormat("vtt")
                setSourceName("subtitles")
              }}
              disabled={!input}
            >
              Reset
            </Button>
          </div>
        </div>
        <Textarea
          id="subtitle-output"
          name="subtitleOutput"
          value={result.output}
          readOnly
          placeholder="The converted subtitles appear here."
          className="min-h-44 resize-y font-mono text-sm"
          spellCheck={false}
        />
      </div>
    </div>
  )
}
