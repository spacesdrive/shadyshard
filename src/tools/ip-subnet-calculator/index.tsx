import { useMemo, useState } from "react"
import { AlertCircle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CopyButton } from "@/components/tool/CopyButton"

function parseAddress(text: string): number {
  const octets = text.split(".")
  if (octets.length !== 4) {
    throw new Error(
      `"${text}" is not an IPv4 address. Expected four dot-separated octets.`,
    )
  }
  let value = 0
  for (const octet of octets) {
    if (!/^\d{1,3}$/.test(octet)) {
      throw new Error(`Octet "${octet}" is not a number between 0 and 255.`)
    }
    const parsed = Number(octet)
    if (parsed > 255) {
      throw new Error(`Octet "${octet}" is greater than 255.`)
    }
    value = value * 256 + parsed
  }
  return value >>> 0
}

function formatAddress(value: number): string {
  return [24, 16, 8, 0].map((shift) => (value >>> shift) & 255).join(".")
}

function toBinary(value: number): string {
  return [24, 16, 8, 0]
    .map((shift) => ((value >>> shift) & 255).toString(2).padStart(8, "0"))
    .join(".")
}

function classify(network: number, prefix: number): string {
  const first = (network >>> 24) & 255
  const second = (network >>> 16) & 255

  if (first === 127) return "Loopback (RFC 1122)"
  if (first === 10) return "Private (RFC 1918)"
  if (first === 172 && second >= 16 && second <= 31) return "Private (RFC 1918)"
  if (first === 192 && second === 168) return "Private (RFC 1918)"
  if (first === 169 && second === 254) return "Link-local (RFC 3927)"
  if (first === 100 && second >= 64 && second <= 127)
    return "Carrier-grade NAT (RFC 6598)"
  if (first >= 224 && first <= 239) return "Multicast (RFC 5771)"
  if (prefix === 0) return "Default route"
  return "Public"
}

const PREFIXES = Array.from({ length: 33 }, (_, index) => index)

export default function IpSubnetCalculator() {
  const [address, setAddress] = useState("192.168.10.37")
  const [prefix, setPrefix] = useState("24")

  const { result, error } = useMemo(() => {
    const trimmed = address.trim()
    if (!trimmed) return { result: null, error: null }

    const [addressPart, cidrPart] = trimmed.split("/")
    const rawPrefix = cidrPart === undefined ? prefix : cidrPart.trim()
    const effectivePrefix = /^\d{1,2}$/.test(rawPrefix) ? Number(rawPrefix) : NaN

    if (!Number.isInteger(effectivePrefix) || effectivePrefix > 32) {
      return {
        result: null,
        error: `Prefix length "${rawPrefix}" must be a whole number between 0 and 32.`,
      }
    }

    try {
      const value = parseAddress(addressPart)
      const mask =
        effectivePrefix === 0 ? 0 : (0xffffffff << (32 - effectivePrefix)) >>> 0
      const network = (value & mask) >>> 0
      const broadcast = (network | (~mask >>> 0)) >>> 0
      const total = 2 ** (32 - effectivePrefix)
      const usable = total > 2 ? total - 2 : 0

      return {
        error: null,
        result: {
          prefix: effectivePrefix,
          rows: [
            ["Network address", `${formatAddress(network)}/${effectivePrefix}`],
            ["Broadcast address", formatAddress(broadcast)],
            [
              "Usable host range",
              usable === 0
                ? "None"
                : `${formatAddress(network + 1)} to ${formatAddress(broadcast - 1)}`,
            ],
            ["Usable hosts", usable.toLocaleString()],
            ["Total addresses", total.toLocaleString()],
            ["Subnet mask", formatAddress(mask)],
            ["Wildcard mask", formatAddress(~mask >>> 0)],
            ["Mask in binary", toBinary(mask)],
            ["Address type", classify(network, effectivePrefix)],
          ] as [string, string][],
        },
      }
    } catch (e) {
      return {
        result: null,
        error: e instanceof Error ? e.message : "This address could not be parsed.",
      }
    }
  }, [address, prefix])

  const summary = result
    ? result.rows.map(([label, value]) => `${label}: ${value}`).join("\n")
    : ""

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-[1fr_10rem]">
        <div>
          <Label htmlFor="subnet-address">IPv4 address</Label>
          <Input
            id="subnet-address"
            name="address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="192.168.10.37 or 192.168.10.37/24"
            className="mt-1.5 font-mono text-sm"
            spellCheck={false}
          />
        </div>
        <div>
          <Label htmlFor="subnet-prefix">Prefix length</Label>
          <Select value={prefix} onValueChange={(value) => value && setPrefix(value)}>
            <SelectTrigger id="subnet-prefix" className="mt-1.5 w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PREFIXES.map((value) => (
                <SelectItem key={value} value={String(value)}>
                  /{value}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {error && (
        <div className="border-destructive/30 bg-destructive/10 text-destructive flex items-start gap-2 rounded-lg border p-3 text-sm">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {result && (
        <>
          <dl className="border-border/60 divide-border/60 divide-y rounded-lg border">
            {result.rows.map(([label, value]) => (
              <div
                key={label}
                className="flex flex-col gap-1 p-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <dt className="text-muted-foreground text-sm">{label}</dt>
                <dd className="font-mono text-sm break-all">{value}</dd>
              </div>
            ))}
          </dl>
          <CopyButton value={summary} label="Copy results" />
        </>
      )}
    </div>
  )
}
