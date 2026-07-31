import { describe, it, expect } from "vitest"
import {
  detectFormat,
  formatTimestamp,
  parseSubtitles,
  shiftCues,
  toPlainText,
  toSrt,
  toVtt,
  SubtitleParseError,
} from "./subtitle"

const SRT = `1
00:00:01,000 --> 00:00:04,000
The first line.
Still the first cue.

2
00:01:02,500 --> 00:01:05,250
The second line.
`

const VTT = `WEBVTT

00:00:01.000 --> 00:00:04.000 line:90%
The first line.

00:01:02.500 --> 00:01:05.250
The second line.
`

describe("parseSubtitles", () => {
  it("parses SRT cues with comma milliseconds and multi-line text", () => {
    const cues = parseSubtitles(SRT)
    expect(cues).toHaveLength(2)
    expect(cues[0]).toEqual({
      start: 1000,
      end: 4000,
      text: "The first line.\nStill the first cue.",
    })
    expect(cues[1].start).toBe(62500)
    expect(cues[1].end).toBe(65250)
  })

  it("parses WebVTT, skipping the header and cue positioning settings", () => {
    const cues = parseSubtitles(VTT)
    expect(cues).toHaveLength(2)
    expect(cues[0]).toEqual({ start: 1000, end: 4000, text: "The first line." })
  })

  it("handles CRLF line endings and a byte order mark", () => {
    const cues = parseSubtitles(`﻿1\r\n00:00:02,000 --> 00:00:03,000\r\nHello\r\n`)
    expect(cues).toEqual([{ start: 2000, end: 3000, text: "Hello" }])
  })

  it("skips WebVTT NOTE blocks", () => {
    const cues = parseSubtitles(
      `WEBVTT\n\nNOTE this is a comment\n\n00:00:01.000 --> 00:00:02.000\nHi\n`,
    )
    expect(cues).toEqual([{ start: 1000, end: 2000, text: "Hi" }])
  })

  it("rejects text with no cues", () => {
    expect(() => parseSubtitles("just some prose")).toThrow(SubtitleParseError)
  })

  it("rejects a cue that ends before it starts", () => {
    expect(() => parseSubtitles(`1\n00:00:05,000 --> 00:00:02,000\nBackwards\n`)).toThrow(
      SubtitleParseError,
    )
  })
})

describe("formatTimestamp", () => {
  it("uses a comma for SRT and a dot for WebVTT", () => {
    expect(formatTimestamp(3661234, "srt")).toBe("01:01:01,234")
    expect(formatTimestamp(3661234, "vtt")).toBe("01:01:01.234")
  })

  it("clamps negative input to zero", () => {
    expect(formatTimestamp(-500, "srt")).toBe("00:00:00,000")
  })
})

describe("serialisation", () => {
  it("round-trips SRT through parse and serialise", () => {
    expect(parseSubtitles(toSrt(parseSubtitles(SRT)))).toEqual(parseSubtitles(SRT))
  })

  it("numbers SRT cues from one and writes the WebVTT header", () => {
    const cues = parseSubtitles(SRT)
    expect(toSrt(cues).startsWith("1\n00:00:01,000 --> 00:00:04,000")).toBe(true)
    expect(toVtt(cues).startsWith("WEBVTT\n\n")).toBe(true)
  })

  it("strips timings for a plain transcript", () => {
    expect(toPlainText(parseSubtitles(SRT))).toBe(
      "The first line. Still the first cue.\nThe second line.\n",
    )
  })
})

describe("shiftCues", () => {
  it("moves every cue by the offset", () => {
    const shifted = shiftCues(parseSubtitles(SRT), 1500)
    expect(shifted[0]).toEqual({
      start: 2500,
      end: 5500,
      text: "The first line.\nStill the first cue.",
    })
  })

  it("never moves a cue below zero", () => {
    const shifted = shiftCues(parseSubtitles(SRT), -10_000)
    expect(shifted[0].start).toBe(0)
    expect(shifted[0].end).toBe(0)
  })
})

describe("detectFormat", () => {
  it("recognises WebVTT by its header and defaults to SRT otherwise", () => {
    expect(detectFormat(VTT)).toBe("vtt")
    expect(detectFormat(SRT)).toBe("srt")
  })
})
