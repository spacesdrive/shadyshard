/**
 * SRT and WebVTT parsing and serialisation, shared by Subtitle Converter and
 * Subtitle Timing Shifter. Both formats are line-based text, so the browser
 * needs no dependency to read or write them.
 *
 * The two formats differ in three places: VTT starts with a "WEBVTT" header,
 * VTT separates seconds from milliseconds with a dot where SRT uses a comma,
 * and SRT numbers every cue where VTT treats the number as an optional label.
 * Parsing normalises all of that into a single cue shape.
 */

export interface SubtitleCue {
  /** Start time in milliseconds from the beginning of the media. */
  start: number
  /** End time in milliseconds from the beginning of the media. */
  end: number
  /** Cue text, newlines preserved for multi-line cues. */
  text: string
}

export type SubtitleFormat = "srt" | "vtt"

const TIMESTAMP_LINE =
  /(\d{1,4}:)?\d{1,2}:\d{2}[.,]\d{1,3}\s*-->\s*(\d{1,4}:)?\d{1,2}:\d{2}[.,]\d{1,3}/

export class SubtitleParseError extends Error {}

function parseTimestamp(raw: string): number {
  const match = raw.trim().match(/^(?:(\d{1,4}):)?(\d{1,2}):(\d{2})[.,](\d{1,3})$/)
  if (!match) throw new SubtitleParseError(`"${raw.trim()}" is not a valid timestamp.`)

  const hours = match[1] ? Number(match[1]) : 0
  const minutes = Number(match[2])
  const seconds = Number(match[3])
  const milliseconds = Number(match[4].padEnd(3, "0"))

  if (minutes > 59 || seconds > 59) {
    throw new SubtitleParseError(
      `"${raw.trim()}" has more than 59 minutes or seconds in a single field.`,
    )
  }

  return ((hours * 60 + minutes) * 60 + seconds) * 1000 + milliseconds
}

export function formatTimestamp(totalMs: number, format: SubtitleFormat): string {
  const clamped = Math.max(0, Math.round(totalMs))
  const milliseconds = clamped % 1000
  const totalSeconds = Math.floor(clamped / 1000)
  const seconds = totalSeconds % 60
  const minutes = Math.floor(totalSeconds / 60) % 60
  const hours = Math.floor(totalSeconds / 3600)

  const pad = (value: number, length = 2) => String(value).padStart(length, "0")
  const separator = format === "srt" ? "," : "."

  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}${separator}${pad(milliseconds, 3)}`
}

export function detectFormat(input: string): SubtitleFormat {
  return /^﻿?WEBVTT/.test(input.trimStart()) ? "vtt" : "srt"
}

/**
 * Parses SRT or WebVTT text into cues. Both formats are accepted regardless of
 * which one the caller expected, since the only structural difference that
 * matters for reading is the optional WEBVTT header.
 */
export function parseSubtitles(input: string): SubtitleCue[] {
  const normalised = input.replace(/^﻿/, "").replace(/\r\n?/g, "\n")
  const withoutHeader = normalised.replace(/^WEBVTT[^\n]*\n?/, "")

  const cues: SubtitleCue[] = []
  const blocks = withoutHeader.split(/\n{2,}/)

  for (const block of blocks) {
    const lines = block.split("\n").filter((line) => line.trim() !== "")
    if (lines.length === 0) continue

    const timestampIndex = lines.findIndex((line) => TIMESTAMP_LINE.test(line))
    if (timestampIndex === -1) {
      // NOTE and STYLE blocks are legal VTT metadata with no timestamp; skip
      // them rather than failing the whole file.
      if (/^(NOTE|STYLE|REGION)\b/.test(lines[0])) continue
      continue
    }

    const [startRaw, endRaw] = lines[timestampIndex].split("-->")
    const start = parseTimestamp(startRaw)
    // A VTT cue may carry positioning settings after the end timestamp.
    const end = parseTimestamp(endRaw.trim().split(/\s+/)[0])

    if (end < start) {
      throw new SubtitleParseError(
        `A cue starting at ${formatTimestamp(start, "srt")} ends before it starts.`,
      )
    }

    cues.push({
      start,
      end,
      text: lines.slice(timestampIndex + 1).join("\n"),
    })
  }

  if (cues.length === 0) {
    throw new SubtitleParseError(
      "No subtitle cues were found. Check that the file contains timestamp lines like 00:00:01,000 --> 00:00:04,000.",
    )
  }

  return cues
}

export function toSrt(cues: SubtitleCue[]): string {
  return (
    cues
      .map(
        (cue, index) =>
          `${index + 1}\n${formatTimestamp(cue.start, "srt")} --> ${formatTimestamp(cue.end, "srt")}\n${cue.text}`,
      )
      .join("\n\n") + "\n"
  )
}

export function toVtt(cues: SubtitleCue[]): string {
  const body = cues
    .map(
      (cue) =>
        `${formatTimestamp(cue.start, "vtt")} --> ${formatTimestamp(cue.end, "vtt")}\n${cue.text}`,
    )
    .join("\n\n")
  return `WEBVTT\n\n${body}\n`
}

/** Strips timings and cue numbers, leaving a readable transcript. */
export function toPlainText(cues: SubtitleCue[]): string {
  return cues.map((cue) => cue.text.replace(/\n/g, " ")).join("\n") + "\n"
}

export function shiftCues(cues: SubtitleCue[], offsetMs: number): SubtitleCue[] {
  return cues.map((cue) => ({
    ...cue,
    start: Math.max(0, cue.start + offsetMs),
    end: Math.max(0, cue.end + offsetMs),
  }))
}
