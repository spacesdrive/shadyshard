import { useMemo, useState } from "react"
import { RotateCcw, CheckCircle2 } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CopyButton } from "@/components/tool/CopyButton"
import { DownloadButton } from "@/components/tool/DownloadButton"

type CharGroup = "zeroWidth" | "space" | "control" | "lookalike"

interface CharInfo {
  name: string
  group: CharGroup
  replacement: string
  short: string
}

const GROUP_LABELS: Record<CharGroup, string> = {
  zeroWidth: "Zero-width and invisible",
  space: "Unusual spaces",
  control: "Control and direction marks",
  lookalike: "Typographic lookalikes",
}

const GROUP_HINTS: Record<CharGroup, string> = {
  zeroWidth: "Removed entirely. These take up no width but break exact comparisons.",
  space:
    "Replaced with a normal space. These look like a space but are a different character.",
  control:
    "Removed entirely. These reorder or hide text without being visible themselves.",
  lookalike:
    "Converted to the plain ASCII equivalent. Off by default, since prose often wants these.",
}

const GROUP_STYLES: Record<CharGroup, string> = {
  zeroWidth: "border-sky-500/30 bg-sky-500/10 text-sky-600 dark:text-sky-400",
  space: "border-violet-500/30 bg-violet-500/10 text-violet-600 dark:text-violet-400",
  control: "border-destructive/30 bg-destructive/10 text-destructive",
  lookalike: "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400",
}

const CHARACTERS: Record<number, CharInfo> = {
  0x00ad: { name: "Soft Hyphen", group: "zeroWidth", replacement: "", short: "SHY" },
  0x061c: {
    name: "Arabic Letter Mark",
    group: "zeroWidth",
    replacement: "",
    short: "ALM",
  },
  0x115f: {
    name: "Hangul Choseong Filler",
    group: "zeroWidth",
    replacement: "",
    short: "HCF",
  },
  0x1160: {
    name: "Hangul Jungseong Filler",
    group: "zeroWidth",
    replacement: "",
    short: "HJF",
  },
  0x180e: {
    name: "Mongolian Vowel Separator",
    group: "zeroWidth",
    replacement: "",
    short: "MVS",
  },
  0x200b: {
    name: "Zero Width Space",
    group: "zeroWidth",
    replacement: "",
    short: "ZWSP",
  },
  0x200c: {
    name: "Zero Width Non-Joiner",
    group: "zeroWidth",
    replacement: "",
    short: "ZWNJ",
  },
  0x200d: {
    name: "Zero Width Joiner",
    group: "zeroWidth",
    replacement: "",
    short: "ZWJ",
  },
  0x2060: { name: "Word Joiner", group: "zeroWidth", replacement: "", short: "WJ" },
  0x2061: {
    name: "Function Application",
    group: "zeroWidth",
    replacement: "",
    short: "FA",
  },
  0x2062: {
    name: "Invisible Times",
    group: "zeroWidth",
    replacement: "",
    short: "ITIMES",
  },
  0x2063: {
    name: "Invisible Separator",
    group: "zeroWidth",
    replacement: "",
    short: "ISEP",
  },
  0x2064: { name: "Invisible Plus", group: "zeroWidth", replacement: "", short: "IPLUS" },
  0x3164: { name: "Hangul Filler", group: "zeroWidth", replacement: "", short: "HF" },
  0xfeff: {
    name: "Zero Width No-Break Space (byte order mark)",
    group: "zeroWidth",
    replacement: "",
    short: "BOM",
  },
  0xffa0: {
    name: "Halfwidth Hangul Filler",
    group: "zeroWidth",
    replacement: "",
    short: "HHF",
  },

  0x00a0: { name: "No-Break Space", group: "space", replacement: " ", short: "NBSP" },
  0x1680: { name: "Ogham Space Mark", group: "space", replacement: " ", short: "OGSP" },
  0x2000: { name: "En Quad", group: "space", replacement: " ", short: "NQSP" },
  0x2001: { name: "Em Quad", group: "space", replacement: " ", short: "MQSP" },
  0x2002: { name: "En Space", group: "space", replacement: " ", short: "ENSP" },
  0x2003: { name: "Em Space", group: "space", replacement: " ", short: "EMSP" },
  0x2004: {
    name: "Three-Per-Em Space",
    group: "space",
    replacement: " ",
    short: "3/MSP",
  },
  0x2005: { name: "Four-Per-Em Space", group: "space", replacement: " ", short: "4/MSP" },
  0x2006: { name: "Six-Per-Em Space", group: "space", replacement: " ", short: "6/MSP" },
  0x2007: { name: "Figure Space", group: "space", replacement: " ", short: "FSP" },
  0x2008: { name: "Punctuation Space", group: "space", replacement: " ", short: "PSP" },
  0x2009: { name: "Thin Space", group: "space", replacement: " ", short: "THSP" },
  0x200a: { name: "Hair Space", group: "space", replacement: " ", short: "HSP" },
  0x202f: {
    name: "Narrow No-Break Space",
    group: "space",
    replacement: " ",
    short: "NNBSP",
  },
  0x205f: {
    name: "Medium Mathematical Space",
    group: "space",
    replacement: " ",
    short: "MMSP",
  },
  0x3000: { name: "Ideographic Space", group: "space", replacement: " ", short: "IDSP" },

  0x200e: { name: "Left-To-Right Mark", group: "control", replacement: "", short: "LRM" },
  0x200f: { name: "Right-To-Left Mark", group: "control", replacement: "", short: "RLM" },
  0x202a: {
    name: "Left-To-Right Embedding",
    group: "control",
    replacement: "",
    short: "LRE",
  },
  0x202b: {
    name: "Right-To-Left Embedding",
    group: "control",
    replacement: "",
    short: "RLE",
  },
  0x202c: {
    name: "Pop Directional Formatting",
    group: "control",
    replacement: "",
    short: "PDF",
  },
  0x202d: {
    name: "Left-To-Right Override",
    group: "control",
    replacement: "",
    short: "LRO",
  },
  0x202e: {
    name: "Right-To-Left Override",
    group: "control",
    replacement: "",
    short: "RLO",
  },
  0x2066: {
    name: "Left-To-Right Isolate",
    group: "control",
    replacement: "",
    short: "LRI",
  },
  0x2067: {
    name: "Right-To-Left Isolate",
    group: "control",
    replacement: "",
    short: "RLI",
  },
  0x2068: {
    name: "First Strong Isolate",
    group: "control",
    replacement: "",
    short: "FSI",
  },
  0x2069: {
    name: "Pop Directional Isolate",
    group: "control",
    replacement: "",
    short: "PDI",
  },

  0x2018: {
    name: "Left Single Quotation Mark",
    group: "lookalike",
    replacement: "'",
    short: "'",
  },
  0x2019: {
    name: "Right Single Quotation Mark",
    group: "lookalike",
    replacement: "'",
    short: "'",
  },
  0x201a: {
    name: "Single Low-9 Quotation Mark",
    group: "lookalike",
    replacement: "'",
    short: "'",
  },
  0x201c: {
    name: "Left Double Quotation Mark",
    group: "lookalike",
    replacement: '"',
    short: '"',
  },
  0x201d: {
    name: "Right Double Quotation Mark",
    group: "lookalike",
    replacement: '"',
    short: '"',
  },
  0x201e: {
    name: "Double Low-9 Quotation Mark",
    group: "lookalike",
    replacement: '"',
    short: '"',
  },
  0x2010: { name: "Hyphen", group: "lookalike", replacement: "-", short: "-" },
  0x2011: {
    name: "Non-Breaking Hyphen",
    group: "lookalike",
    replacement: "-",
    short: "-",
  },
  0x2012: { name: "Figure Dash", group: "lookalike", replacement: "-", short: "-" },
  0x2013: { name: "En Dash", group: "lookalike", replacement: "-", short: "-" },
  0x2014: { name: "Em Dash", group: "lookalike", replacement: "-", short: "-" },
  0x2015: { name: "Horizontal Bar", group: "lookalike", replacement: "-", short: "-" },
  0x2212: { name: "Minus Sign", group: "lookalike", replacement: "-", short: "-" },
  0x2026: {
    name: "Horizontal Ellipsis",
    group: "lookalike",
    replacement: "...",
    short: "...",
  },
  0x00b4: { name: "Acute Accent", group: "lookalike", replacement: "'", short: "'" },
  0x2032: { name: "Prime", group: "lookalike", replacement: "'", short: "'" },
  0x2033: { name: "Double Prime", group: "lookalike", replacement: '"', short: '"' },
}

function describe(codePoint: number): CharInfo | null {
  const known = CHARACTERS[codePoint]
  if (known) return known

  const isC0 =
    codePoint < 0x20 && codePoint !== 0x09 && codePoint !== 0x0a && codePoint !== 0x0d
  const isC1 = codePoint >= 0x7f && codePoint <= 0x9f
  if (isC0 || isC1) {
    return {
      name: "Control character",
      group: "control",
      replacement: "",
      short: "CTRL",
    }
  }
  return null
}

function formatCodePoint(codePoint: number): string {
  return `U+${codePoint.toString(16).toUpperCase().padStart(4, "0")}`
}

interface Finding {
  codePoint: number
  info: CharInfo
  count: number
  firstLine: number
  firstColumn: number
}

interface Segment {
  text: string
  info: CharInfo | null
  codePoint: number
}

function analyze(text: string): { findings: Finding[]; segments: Segment[] } {
  const byCodePoint = new Map<number, Finding>()
  const segments: Segment[] = []
  let plain = ""
  let line = 1
  let column = 1

  for (const character of text) {
    const codePoint = character.codePointAt(0) as number
    const info = describe(codePoint)

    if (info) {
      if (plain) {
        segments.push({ text: plain, info: null, codePoint: -1 })
        plain = ""
      }
      segments.push({ text: character, info, codePoint })

      const existing = byCodePoint.get(codePoint)
      if (existing) {
        existing.count++
      } else {
        byCodePoint.set(codePoint, {
          codePoint,
          info,
          count: 1,
          firstLine: line,
          firstColumn: column,
        })
      }
    } else {
      plain += character
    }

    if (character === "\n") {
      line++
      column = 1
    } else {
      column++
    }
  }

  if (plain) segments.push({ text: plain, info: null, codePoint: -1 })

  const findings = [...byCodePoint.values()].sort(
    (a, b) => b.count - a.count || a.codePoint - b.codePoint,
  )
  return { findings, segments }
}

const MAX_PREVIEW_CHARS = 20000

export default function InvisibleCharacterRemover() {
  const [text, setText] = useState("")
  const [enabled, setEnabled] = useState<Record<CharGroup, boolean>>({
    zeroWidth: true,
    space: true,
    control: true,
    lookalike: false,
  })

  const { findings, segments } = useMemo(() => analyze(text), [text])

  const cleaned = useMemo(
    () =>
      segments
        .map((segment) =>
          segment.info && enabled[segment.info.group]
            ? segment.info.replacement
            : segment.text,
        )
        .join(""),
    [segments, enabled],
  )

  const totalFound = findings.reduce((sum, finding) => sum + finding.count, 0)
  const removedCount = findings
    .filter((finding) => enabled[finding.info.group])
    .reduce((sum, finding) => sum + finding.count, 0)

  function toggle(group: CharGroup, value: boolean) {
    setEnabled((previous) => ({ ...previous, [group]: value }))
  }

  return (
    <div className="space-y-5">
      <div>
        <Label htmlFor="invisible-characters-input">Text to check</Label>
        <Textarea
          id="invisible-characters-input"
          name="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste text copied from a document, a web page, a PDF, or a chat assistant..."
          className="mt-1.5 min-h-44 resize-y font-mono text-sm"
          spellCheck={false}
        />
      </div>

      <fieldset className="border-border/60 rounded-lg border p-4">
        <legend className="px-1 text-sm font-medium">What to clean</legend>
        <div className="grid gap-3 sm:grid-cols-2">
          {(Object.keys(GROUP_LABELS) as CharGroup[]).map((group) => (
            <div key={group} className="flex items-start gap-2">
              <Switch
                id={`invisible-characters-${group}`}
                name={group}
                checked={enabled[group]}
                onCheckedChange={(value) => toggle(group, value)}
                className="mt-0.5"
              />
              <div>
                <Label htmlFor={`invisible-characters-${group}`} className="font-normal">
                  {GROUP_LABELS[group]}
                </Label>
                <p className="text-muted-foreground mt-0.5 text-xs">
                  {GROUP_HINTS[group]}
                </p>
              </div>
            </div>
          ))}
        </div>
      </fieldset>

      {text && findings.length === 0 && (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="size-4 shrink-0" />
          <span>No hidden or lookalike characters found in this text.</span>
        </div>
      )}

      {findings.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm">
            Found {totalFound} character{totalFound === 1 ? "" : "s"} across{" "}
            {findings.length} kind{findings.length === 1 ? "" : "s"}. Cleaning{" "}
            {removedCount} of them with the current selection.
          </p>

          <ul className="space-y-2">
            {findings.map((finding) => (
              <li
                key={finding.codePoint}
                className="border-border/60 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg border p-3 text-sm"
              >
                <Badge variant="outline" className={GROUP_STYLES[finding.info.group]}>
                  {formatCodePoint(finding.codePoint)}
                </Badge>
                <span className="min-w-0 flex-1">{finding.info.name}</span>
                <span className="text-muted-foreground text-xs">
                  {finding.count} occurrence{finding.count === 1 ? "" : "s"}, first at
                  line {finding.firstLine} column {finding.firstColumn}
                </span>
              </li>
            ))}
          </ul>

          <div>
            <span className="text-sm font-medium">Where they are</span>
            {text.length > MAX_PREVIEW_CHARS ? (
              <p className="text-muted-foreground mt-1.5 text-sm">
                The marked preview is skipped for text longer than{" "}
                {MAX_PREVIEW_CHARS.toLocaleString()} characters. The findings above and
                the cleaned output below still cover the whole text.
              </p>
            ) : (
              <p className="border-border/60 mt-1.5 max-h-64 overflow-auto rounded-lg border p-3 font-mono text-sm break-words whitespace-pre-wrap">
                {segments.map((segment, index) =>
                  segment.info ? (
                    <span
                      key={index}
                      className={`mx-px rounded border px-1 text-xs ${GROUP_STYLES[segment.info.group]}`}
                      title={`${formatCodePoint(segment.codePoint)} ${segment.info.name}`}
                    >
                      {segment.info.short}
                    </span>
                  ) : (
                    <span key={index}>{segment.text}</span>
                  ),
                )}
              </p>
            )}
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <CopyButton value={cleaned} label="Copy cleaned text" />
        <DownloadButton
          getBlob={() =>
            cleaned ? new Blob([cleaned], { type: "text/plain;charset=utf-8" }) : null
          }
          filename="cleaned-text.txt"
          disabled={!cleaned}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setText("")}
          disabled={!text}
        >
          <RotateCcw className="size-4" />
          Clear
        </Button>
      </div>

      <div>
        <Label htmlFor="invisible-characters-output">Cleaned text</Label>
        <Textarea
          id="invisible-characters-output"
          name="cleaned"
          value={cleaned}
          readOnly
          className="mt-1.5 min-h-44 resize-y font-mono text-sm"
          placeholder="The cleaned text appears here."
        />
      </div>
    </div>
  )
}
