import { useMemo, useState } from "react"
import { AlertCircle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { CopyButton } from "@/components/tool/CopyButton"

interface ParsedAddress {
  groups: number[]
  prefixLength: number | null
  zone: string | null
}

function parseIpv4Tail(text: string): number[] | null {
  const octets = text.split(".")
  if (octets.length !== 4) return null
  const values = octets.map((octet) => {
    if (!/^\d{1,3}$/.test(octet)) return -1
    const value = Number(octet)
    return value > 255 ? -1 : value
  })
  if (values.some((value) => value < 0)) return null
  return [(values[0] << 8) | values[1], (values[2] << 8) | values[3]]
}

function parseGroups(text: string): number[] {
  const halves = text.split("::")
  if (halves.length > 2) {
    throw new Error("An address can contain :: at most once.")
  }

  const readSide = (side: string): number[] => {
    if (side === "") return []
    const parts = side.split(":")
    const groups: number[] = []
    for (let index = 0; index < parts.length; index++) {
      const part = parts[index]
      if (part.includes(".")) {
        if (index !== parts.length - 1) {
          throw new Error("Embedded IPv4 notation is only allowed at the end.")
        }
        const tail = parseIpv4Tail(part)
        if (!tail) throw new Error(`"${part}" is not a valid IPv4 address.`)
        groups.push(...tail)
        continue
      }
      if (!/^[0-9a-fA-F]{1,4}$/.test(part)) {
        throw new Error(`"${part}" is not a group of one to four hexadecimal digits.`)
      }
      groups.push(parseInt(part, 16))
    }
    return groups
  }

  if (halves.length === 1) {
    const groups = readSide(halves[0])
    if (groups.length !== 8) {
      throw new Error(
        `An address without :: needs exactly 8 groups, but this one has ${groups.length}.`,
      )
    }
    return groups
  }

  const head = readSide(halves[0])
  const tail = readSide(halves[1])
  const missing = 8 - head.length - tail.length
  if (missing < 1) {
    throw new Error(":: must stand in for at least one group of zeros.")
  }
  return [...head, ...Array<number>(missing).fill(0), ...tail]
}

function parseAddress(input: string): ParsedAddress {
  let text = input.trim()
  if (text === "") throw new Error("Enter an IPv6 address.")

  if (text.startsWith("[")) {
    const closing = text.indexOf("]")
    if (closing === -1) throw new Error("A bracketed address is missing its closing ].")
    text = text.slice(1, closing) + text.slice(closing + 1).replace(/^:\d+$/, "")
  }

  let prefixLength: number | null = null
  const slash = text.indexOf("/")
  if (slash !== -1) {
    const suffix = text.slice(slash + 1)
    if (!/^\d{1,3}$/.test(suffix) || Number(suffix) > 128) {
      throw new Error("A prefix length must be a number between 0 and 128.")
    }
    prefixLength = Number(suffix)
    text = text.slice(0, slash)
  }

  let zone: string | null = null
  const percent = text.indexOf("%")
  if (percent !== -1) {
    zone = text.slice(percent + 1) || null
    text = text.slice(0, percent)
  }

  return { groups: parseGroups(text), prefixLength, zone }
}

function expand(groups: number[]): string {
  return groups.map((group) => group.toString(16).padStart(4, "0")).join(":")
}

/** Longest run of zero groups, leftmost on a tie, as RFC 5952 requires. */
function longestZeroRun(groups: number[]): { start: number; length: number } {
  let best = { start: -1, length: 0 }
  let index = 0
  while (index < groups.length) {
    if (groups[index] !== 0) {
      index++
      continue
    }
    let end = index
    while (end < groups.length && groups[end] === 0) end++
    if (end - index > best.length) best = { start: index, length: end - index }
    index = end
  }
  return best
}

/**
 * Only the ::ffff:0:0/96 range keeps dotted-quad notation. The deprecated
 * IPv4-compatible ::/96 range deliberately does not, since ::1 lives there
 * and is a loopback address rather than an embedded IPv4 one.
 */
function isIpv4Mapped(groups: number[]): boolean {
  return groups.slice(0, 5).every((group) => group === 0) && groups[5] === 0xffff
}

function compress(groups: number[]): string {
  const ipv4Tail = isIpv4Mapped(groups)
  const significant = ipv4Tail ? groups.slice(0, 6) : groups
  const parts = significant.map((group) => group.toString(16))
  const run = longestZeroRun(significant)

  let text: string
  if (run.length > 1) {
    const head = parts.slice(0, run.start).join(":")
    const tail = parts.slice(run.start + run.length).join(":")
    text = `${head}::${tail}`
  } else {
    text = parts.join(":")
  }

  if (!ipv4Tail) return text
  const dotted = [
    groups[6] >> 8,
    groups[6] & 0xff,
    groups[7] >> 8,
    groups[7] & 0xff,
  ].join(".")
  return `${text.endsWith(":") ? text : `${text}:`}${dotted}`
}

function reversePointer(groups: number[]): string {
  const nibbles = expand(groups).replace(/:/g, "").split("").reverse()
  return `${nibbles.join(".")}.ip6.arpa`
}

function networkAddress(groups: number[], prefixLength: number): number[] {
  return groups.map((group, index) => {
    const bitsBefore = index * 16
    const remaining = prefixLength - bitsBefore
    if (remaining >= 16) return group
    if (remaining <= 0) return 0
    const mask = (0xffff << (16 - remaining)) & 0xffff
    return group & mask
  })
}

function describe(groups: number[]): string {
  const first = groups[0]
  if (groups.every((group) => group === 0)) return "Unspecified address (::)"
  if (groups.slice(0, 7).every((group) => group === 0) && groups[7] === 1) {
    return "Loopback address (::1)"
  }
  if (groups.slice(0, 5).every((group) => group === 0) && groups[5] === 0xffff) {
    return "IPv4-mapped IPv6 address"
  }
  if ((first & 0xffc0) === 0xfe80) return "Link-local unicast (fe80::/10)"
  if ((first & 0xfe00) === 0xfc00) return "Unique local address (fc00::/7)"
  if ((first & 0xff00) === 0xff00) return "Multicast (ff00::/8)"
  if ((first & 0xe000) === 0x2000) return "Global unicast (2000::/3)"
  return "Reserved or unassigned range"
}

interface ResultRow {
  label: string
  value: string
}

export default function Ipv6AddressExpander() {
  const [input, setInput] = useState("2001:db8::ff:0:1")

  const { rows, error } = useMemo(() => {
    if (!input.trim()) return { rows: [] as ResultRow[], error: null }
    try {
      const { groups, prefixLength, zone } = parseAddress(input)
      const rows: ResultRow[] = [
        { label: "Expanded", value: expand(groups) },
        { label: "Compressed", value: compress(groups) },
        { label: "Reverse DNS pointer", value: reversePointer(groups) },
        { label: "Address type", value: describe(groups) },
      ]
      if (prefixLength !== null) {
        const network = networkAddress(groups, prefixLength)
        rows.push({
          label: `Network (/${prefixLength})`,
          value: `${compress(network)}/${prefixLength}`,
        })
      }
      if (zone) rows.push({ label: "Zone index", value: zone })
      return { rows, error: null }
    } catch (cause) {
      return {
        rows: [] as ResultRow[],
        error: cause instanceof Error ? cause.message : "This address could not be read.",
      }
    }
  }, [input])

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="ipv6-input">IPv6 address</Label>
        <Input
          id="ipv6-input"
          name="address"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="2001:db8::1 or fe80::1%eth0 or 2001:db8::/48"
          className="mt-1.5 font-mono"
          spellCheck={false}
          autoComplete="off"
          aria-invalid={error ? true : undefined}
        />
      </div>

      {error && (
        <div className="border-destructive/30 bg-destructive/10 text-destructive flex items-start gap-2 rounded-lg border p-3 text-sm">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {rows.length > 0 && (
        <dl className="border-border/60 divide-border/60 divide-y rounded-xl border">
          {rows.map((row) => (
            <div
              key={row.label}
              className="flex flex-col gap-2 p-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <dt className="text-muted-foreground text-xs">{row.label}</dt>
                <dd className="mt-0.5 font-mono text-sm break-all">{row.value}</dd>
              </div>
              <div className="shrink-0">
                <CopyButton
                  value={row.value}
                  label={`Copy ${row.label}`}
                  size="icon-sm"
                />
              </div>
            </div>
          ))}
        </dl>
      )}

      <Button variant="outline" size="sm" onClick={() => setInput("")} disabled={!input}>
        Clear
      </Button>
    </div>
  )
}
