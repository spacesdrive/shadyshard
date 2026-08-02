import { useMemo, useState } from "react"
import { AlertCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { CopyButton } from "@/components/tool/CopyButton"
import { DownloadButton } from "@/components/tool/DownloadButton"
import { CROCKFORD_ALPHABET, normalizeCrockford } from "@/lib/base32"

const TIMESTAMP_LENGTH = 10
const RANDOM_LENGTH = 16
const MAX_COUNT = 500

function encodeTime(milliseconds: number): string {
  let remaining = milliseconds
  let output = ""
  for (let index = 0; index < TIMESTAMP_LENGTH; index++) {
    output = CROCKFORD_ALPHABET[remaining % 32] + output
    remaining = Math.floor(remaining / 32)
  }
  return output
}

/**
 * The 80 random bits, as 16 Crockford characters of 5 bits each. 256 is an
 * exact multiple of 32, so taking a byte modulo 32 is uniform here and needs
 * no rejection sampling.
 */
function randomCharacterValues(): number[] {
  const bytes = new Uint8Array(RANDOM_LENGTH)
  crypto.getRandomValues(bytes)
  return Array.from(bytes, (byte) => byte % 32)
}

/** Adds one to the random part, carrying between characters, for monotonic mode. */
function incrementValues(values: number[]): number[] {
  const next = [...values]
  for (let index = next.length - 1; index >= 0; index--) {
    if (next[index] < 31) {
      next[index] += 1
      return next
    }
    next[index] = 0
  }
  return randomCharacterValues()
}

function generateUlids(count: number, monotonic: boolean): string[] {
  const results: string[] = []
  let lastTime = -1
  let lastValues: number[] = []

  for (let index = 0; index < count; index++) {
    const now = Date.now()
    let values: number[]
    if (monotonic && now === lastTime) {
      values = incrementValues(lastValues)
    } else {
      values = randomCharacterValues()
      lastTime = now
    }
    lastValues = values
    results.push(
      encodeTime(now) + values.map((value) => CROCKFORD_ALPHABET[value]).join(""),
    )
  }

  return results
}

interface DecodedUlid {
  timestamp: number
  isoTime: string
  localTime: string
  randomPart: string
}

function decodeUlid(input: string): DecodedUlid {
  const normalized = normalizeCrockford(input)
  if (normalized.length !== TIMESTAMP_LENGTH + RANDOM_LENGTH) {
    throw new Error(`A ULID is 26 characters long; this one is ${normalized.length}.`)
  }
  for (const character of normalized) {
    if (!CROCKFORD_ALPHABET.includes(character)) {
      throw new Error(`"${character}" is not a valid Crockford base32 character.`)
    }
  }

  let timestamp = 0
  for (const character of normalized.slice(0, TIMESTAMP_LENGTH)) {
    timestamp = timestamp * 32 + CROCKFORD_ALPHABET.indexOf(character)
  }
  if (!Number.isSafeInteger(timestamp)) {
    throw new Error("The timestamp in this ULID is out of range.")
  }

  const date = new Date(timestamp)
  return {
    timestamp,
    isoTime: date.toISOString(),
    localTime: date.toLocaleString(),
    randomPart: normalized.slice(TIMESTAMP_LENGTH),
  }
}

export default function UlidGenerator() {
  const [count, setCount] = useState("10")
  const [monotonic, setMonotonic] = useState(true)
  const [lowercase, setLowercase] = useState(false)
  const [ulids, setUlids] = useState<string[]>(() => generateUlids(10, true))
  const [decodeInput, setDecodeInput] = useState("")

  const countValue = Number(count)
  const countValid =
    Number.isInteger(countValue) && countValue >= 1 && countValue <= MAX_COUNT

  const output = useMemo(
    () => (lowercase ? ulids.map((ulid) => ulid.toLowerCase()) : ulids).join("\n"),
    [ulids, lowercase],
  )

  const decoded = useMemo(() => {
    if (!decodeInput.trim()) return { value: null, error: null as string | null }
    try {
      return { value: decodeUlid(decodeInput.trim()), error: null }
    } catch (error) {
      return {
        value: null,
        error: error instanceof Error ? error.message : "That is not a valid ULID.",
      }
    }
  }, [decodeInput])

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="ulid-count">How many</Label>
          <Input
            id="ulid-count"
            name="count"
            type="number"
            min={1}
            max={MAX_COUNT}
            className="mt-1.5"
            value={count}
            onChange={(event) => setCount(event.target.value)}
          />
          {!countValid && (
            <p className="text-destructive mt-1.5 text-sm">
              Enter a whole number between 1 and {MAX_COUNT}.
            </p>
          )}
        </div>

        <div className="space-y-3 sm:pt-6">
          <div className="flex items-center gap-2">
            <Switch
              id="ulid-monotonic"
              name="monotonic"
              checked={monotonic}
              onCheckedChange={setMonotonic}
            />
            <Label htmlFor="ulid-monotonic" className="font-normal">
              Monotonic within the same millisecond
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              id="ulid-lowercase"
              name="lowercase"
              checked={lowercase}
              onCheckedChange={setLowercase}
            />
            <Label htmlFor="ulid-lowercase" className="font-normal">
              Lower case
            </Label>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          disabled={!countValid}
          onClick={() => setUlids(generateUlids(countValue, monotonic))}
        >
          <RefreshCw className="size-4" />
          Generate
        </Button>
        <CopyButton value={output} label="Copy all" />
        <DownloadButton
          getBlob={() => new Blob([output], { type: "text/plain" })}
          filename="ulids.txt"
          disabled={!output}
        />
      </div>

      <div>
        <Label htmlFor="ulid-output">Generated ULIDs</Label>
        <Textarea
          id="ulid-output"
          name="ulids"
          readOnly
          className="mt-1.5 min-h-56 resize-y font-mono text-sm"
          value={output}
        />
      </div>

      <div className="border-border/60 space-y-3 rounded-lg border p-4">
        <h2 className="text-sm font-medium">Decode a ULID</h2>
        <div>
          <Label htmlFor="ulid-decode">ULID</Label>
          <Input
            id="ulid-decode"
            name="decode"
            className="mt-1.5 font-mono"
            value={decodeInput}
            onChange={(event) => setDecodeInput(event.target.value)}
            placeholder="01ARZ3NDEKTSV4RRFFQ69G5FAV"
          />
        </div>

        {decoded.error && (
          <div className="border-destructive/30 bg-destructive/10 text-destructive flex items-start gap-2 rounded-lg border p-3 text-sm">
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            <span>{decoded.error}</span>
          </div>
        )}

        {decoded.value && (
          <dl className="grid gap-3 sm:grid-cols-2">
            <div className="border-border/60 rounded-lg border p-3">
              <dt className="text-muted-foreground text-xs">Created (UTC)</dt>
              <dd className="mt-1 font-mono text-sm break-all">
                {decoded.value.isoTime}
              </dd>
            </div>
            <div className="border-border/60 rounded-lg border p-3">
              <dt className="text-muted-foreground text-xs">Created (local time)</dt>
              <dd className="mt-1 font-mono text-sm break-all">
                {decoded.value.localTime}
              </dd>
            </div>
            <div className="border-border/60 rounded-lg border p-3">
              <dt className="text-muted-foreground text-xs">Unix milliseconds</dt>
              <dd className="mt-1 font-mono text-sm tabular-nums">
                {decoded.value.timestamp}
              </dd>
            </div>
            <div className="border-border/60 rounded-lg border p-3">
              <dt className="text-muted-foreground text-xs">Random part</dt>
              <dd className="mt-1 font-mono text-sm break-all">
                {decoded.value.randomPart}
              </dd>
            </div>
          </dl>
        )}
      </div>
    </div>
  )
}
