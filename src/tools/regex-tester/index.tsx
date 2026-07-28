import { useMemo, useState } from "react"
import { AlertCircle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { CopyButton } from "@/components/tool/CopyButton"

const FLAGS = [
  { flag: "g", label: "global" },
  { flag: "i", label: "ignore case" },
  { flag: "m", label: "multiline" },
  { flag: "s", label: "dotall" },
  { flag: "u", label: "unicode" },
  { flag: "y", label: "sticky" },
]

const MATCH_LIMIT = 1000

interface MatchResult {
  text: string
  index: number
  groups: string[]
  namedGroups: Record<string, string | undefined>
}

interface Analysis {
  matches: MatchResult[]
  total: number
  error: string | null
}

function analyse(pattern: string, flags: string, input: string): Analysis {
  if (!pattern) return { matches: [], total: 0, error: null }

  let regex: RegExp
  try {
    regex = new RegExp(pattern, flags)
  } catch (error) {
    return {
      matches: [],
      total: 0,
      error: error instanceof Error ? error.message : "Invalid regular expression.",
    }
  }

  if (!input) return { matches: [], total: 0, error: null }

  const matches: MatchResult[] = []
  let total = 0

  if (!flags.includes("g")) {
    const found = regex.exec(input)
    if (found) {
      total = 1
      matches.push({
        text: found[0],
        index: found.index,
        groups: found.slice(1).map((group) => group ?? ""),
        namedGroups: found.groups ?? {},
      })
    }
    return { matches, total, error: null }
  }

  let found = regex.exec(input)
  while (found) {
    total += 1
    if (matches.length < MATCH_LIMIT) {
      matches.push({
        text: found[0],
        index: found.index,
        groups: found.slice(1).map((group) => group ?? ""),
        namedGroups: found.groups ?? {},
      })
    }
    // A zero-length match never advances lastIndex on its own, which would
    // loop forever on patterns like /a*/g.
    if (found[0] === "") regex.lastIndex += 1
    if (regex.lastIndex > input.length) break
    found = regex.exec(input)
  }

  return { matches, total, error: null }
}

function Highlighted({ input, matches }: { input: string; matches: MatchResult[] }) {
  const pieces: React.ReactNode[] = []
  let cursor = 0

  matches.forEach((match, index) => {
    if (match.index < cursor) return
    if (match.index > cursor) pieces.push(input.slice(cursor, match.index))
    pieces.push(
      <mark
        key={`${match.index}-${index}`}
        className="bg-primary/25 text-foreground rounded-sm"
      >
        {match.text === "" ? "​" : match.text}
      </mark>,
    )
    cursor = match.index + match.text.length
  })
  pieces.push(input.slice(cursor))

  return (
    <div className="border-border/60 bg-muted/30 max-h-64 overflow-auto rounded-lg border p-3 font-mono text-sm break-words whitespace-pre-wrap">
      {pieces}
    </div>
  )
}

export default function RegexTester() {
  const [pattern, setPattern] = useState("\\b(\\w+)@(\\w+)\\.com\\b")
  const [flags, setFlags] = useState("g")
  const [input, setInput] = useState(
    "Contact ada@example.com or grace@example.com for access.",
  )
  const [replacement, setReplacement] = useState("")

  const { matches, total, error } = useMemo(
    () => analyse(pattern, flags, input),
    [pattern, flags, input],
  )

  const replaced = useMemo(() => {
    if (!pattern || error || !replacement) return null
    try {
      return input.replace(new RegExp(pattern, flags), replacement)
    } catch {
      return null
    }
  }, [pattern, flags, input, replacement, error])

  function toggleFlag(flag: string, checked: boolean) {
    setFlags((current) =>
      checked
        ? [...current.split(""), flag].join("")
        : current
            .split("")
            .filter((f) => f !== flag)
            .join(""),
    )
  }

  return (
    <div className="space-y-5">
      <div>
        <Label htmlFor="regex-pattern">Pattern</Label>
        <div className="mt-1.5 flex items-center gap-2">
          <span className="text-muted-foreground font-mono text-sm">/</span>
          <Input
            id="regex-pattern"
            name="pattern"
            value={pattern}
            onChange={(event) => setPattern(event.target.value)}
            className="font-mono text-sm"
            placeholder="\\d{3}-\\d{4}"
            aria-label="Regular expression pattern"
          />
          <span className="text-muted-foreground font-mono text-sm">/{flags}</span>
        </div>
      </div>

      <fieldset>
        <legend className="text-sm font-medium">Flags</legend>
        <div className="mt-2 flex flex-wrap gap-x-5 gap-y-2">
          {FLAGS.map(({ flag, label }) => (
            <div key={flag} className="flex items-center gap-2">
              <Checkbox
                id={`regex-flag-${flag}`}
                name={`flag-${flag}`}
                checked={flags.includes(flag)}
                onCheckedChange={(checked) => toggleFlag(flag, checked === true)}
              />
              <Label htmlFor={`regex-flag-${flag}`} className="font-normal">
                <span className="font-mono">{flag}</span>
                <span className="text-muted-foreground ml-1 text-xs">{label}</span>
              </Label>
            </div>
          ))}
        </div>
      </fieldset>

      {error && (
        <div className="border-destructive/30 bg-destructive/10 text-destructive flex items-start gap-2 rounded-lg border p-3 text-sm">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div>
        <Label htmlFor="regex-input">Test string</Label>
        <Textarea
          id="regex-input"
          name="input"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          rows={6}
          className="mt-1.5 font-mono text-sm"
          placeholder="Paste the text you want to match against"
        />
      </div>

      {!error && pattern && input && (
        <>
          <div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {total} {total === 1 ? "match" : "matches"}
              </span>
              {total > matches.length && (
                <span className="text-muted-foreground text-xs">
                  showing the first {matches.length}
                </span>
              )}
            </div>
            <div className="mt-2">
              <Highlighted input={input} matches={matches} />
            </div>
          </div>

          {matches.length > 0 && (
            <ul className="border-border/60 max-h-64 space-y-2 overflow-auto rounded-lg border p-3">
              {matches.map((match, index) => (
                <li key={`${match.index}-${index}`} className="text-sm">
                  <span className="text-muted-foreground mr-2 text-xs tabular-nums">
                    at {match.index}
                  </span>
                  <span className="font-mono">{match.text || "(empty match)"}</span>
                  {match.groups.length > 0 && (
                    <ul className="text-muted-foreground mt-1 ml-6 space-y-0.5 text-xs">
                      {match.groups.map((group, groupIndex) => (
                        <li key={groupIndex}>
                          <span className="font-mono">${groupIndex + 1}</span>{" "}
                          {group || "(empty)"}
                        </li>
                      ))}
                      {Object.entries(match.namedGroups).map(([name, value]) => (
                        <li key={name}>
                          <span className="font-mono">$&lt;{name}&gt;</span>{" "}
                          {value || "(empty)"}
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      <div>
        <Label htmlFor="regex-replacement">Replacement (optional)</Label>
        <Input
          id="regex-replacement"
          name="replacement"
          value={replacement}
          onChange={(event) => setReplacement(event.target.value)}
          className="mt-1.5 font-mono text-sm"
          placeholder="$1 at $2"
        />
      </div>

      {replaced !== null && (
        <div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Replacement result</span>
            <CopyButton value={replaced} label="Copy result" />
          </div>
          <Textarea
            id="regex-replaced"
            name="replaced"
            value={replaced}
            readOnly
            rows={4}
            className="mt-2 font-mono text-sm"
            aria-label="Replacement result"
          />
        </div>
      )}

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => {
          setPattern("")
          setFlags("g")
          setInput("")
          setReplacement("")
        }}
      >
        Reset
      </Button>
    </div>
  )
}
