import { useMemo, useState } from "react"
import { AlertCircle, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CopyButton } from "@/components/tool/CopyButton"

type Width = 32 | 64

const LAYOUT: Record<
  Width,
  { exponentBits: number; mantissaBits: number; bias: number }
> = {
  32: { exponentBits: 8, mantissaBits: 23, bias: 127 },
  64: { exponentBits: 11, mantissaBits: 52, bias: 1023 },
}

function encode(value: number, width: Width): bigint {
  const view = new DataView(new ArrayBuffer(8))
  if (width === 32) {
    view.setFloat32(0, value)
    return BigInt(view.getUint32(0))
  }
  view.setFloat64(0, value)
  return view.getBigUint64(0)
}

function decode(bits: bigint, width: Width): number {
  const view = new DataView(new ArrayBuffer(8))
  if (width === 32) {
    view.setUint32(0, Number(bits & 0xffffffffn))
    return view.getFloat32(0)
  }
  view.setBigUint64(0, bits & 0xffffffffffffffffn)
  return view.getFloat64(0)
}

/**
 * Renders the value the bits represent as an exact decimal string. A float is
 * significand * 2^exponent, and dividing by 2^k is the same as multiplying by
 * 5^k and shifting the point k places, so integer arithmetic alone gives the
 * full expansion that toString() would round away.
 */
function exactDecimal(significand: bigint, exponent: number, negative: boolean): string {
  const sign = negative ? "-" : ""
  if (significand === 0n) return `${sign}0`

  if (exponent >= 0) return `${sign}${significand << BigInt(exponent)}`

  const places = -exponent
  const scaled = (significand * 5n ** BigInt(places)).toString().padStart(places + 1, "0")
  const whole = scaled.slice(0, scaled.length - places)
  const fraction = scaled.slice(scaled.length - places).replace(/0+$/, "")
  return fraction ? `${sign}${whole}.${fraction}` : `${sign}${whole}`
}

interface Decoded {
  signBit: string
  exponentBits: string
  mantissaBits: string
  hex: string
  classification: string
  unbiasedExponent: string
  exact: string
  stored: number
}

function describe(bits: bigint, width: Width): Decoded {
  const { exponentBits, mantissaBits, bias } = LAYOUT[width]
  const mantissaMask = (1n << BigInt(mantissaBits)) - 1n
  const exponentMask = (1n << BigInt(exponentBits)) - 1n

  const rawMantissa = bits & mantissaMask
  const rawExponent = (bits >> BigInt(mantissaBits)) & exponentMask
  const negative = (bits >> BigInt(width - 1)) & 1n ? true : false

  let classification = "normal"
  let unbiasedExponent = String(Number(rawExponent) - bias)
  let exact: string

  if (rawExponent === exponentMask) {
    classification = rawMantissa === 0n ? "infinity" : "not a number"
    unbiasedExponent = "reserved"
    exact = rawMantissa === 0n ? (negative ? "-Infinity" : "Infinity") : "NaN"
  } else if (rawExponent === 0n) {
    classification = rawMantissa === 0n ? "zero" : "subnormal"
    unbiasedExponent = String(1 - bias)
    exact = exactDecimal(rawMantissa, 1 - bias - mantissaBits, negative)
  } else {
    const significand = rawMantissa + (1n << BigInt(mantissaBits))
    exact = exactDecimal(significand, Number(rawExponent) - bias - mantissaBits, negative)
  }

  return {
    signBit: negative ? "1" : "0",
    exponentBits: rawExponent.toString(2).padStart(exponentBits, "0"),
    mantissaBits: rawMantissa.toString(2).padStart(mantissaBits, "0"),
    hex: bits
      .toString(16)
      .padStart(width / 4, "0")
      .toUpperCase(),
    classification,
    unbiasedExponent,
    exact,
    stored: decode(bits, width),
  }
}

function parseDecimal(text: string): number | null {
  const trimmed = text.trim()
  if (!trimmed) return null
  if (/^[+-]?infinity$/i.test(trimmed))
    return trimmed.startsWith("-") ? -Infinity : Infinity
  if (/^nan$/i.test(trimmed)) return NaN
  if (!/^[+-]?(\d+\.?\d*|\.\d+)(e[+-]?\d+)?$/i.test(trimmed)) return null
  return Number(trimmed)
}

function parseBits(text: string, width: Width): bigint | null {
  const cleaned = text.trim().replace(/[\s_]/g, "")
  if (!cleaned) return null

  const hexMatch = /^(?:0x)?([0-9a-f]+)$/i.exec(cleaned)
  const binaryMatch = /^(?:0b)?([01]+)$/i.exec(cleaned)

  // A run of only 0s and 1s that is exactly as long as the word is read as
  // binary; anything else that looks hexadecimal is read as hexadecimal.
  if (binaryMatch && (cleaned.startsWith("0b") || binaryMatch[1].length === width)) {
    return BigInt(`0b${binaryMatch[1]}`)
  }
  if (hexMatch) {
    if (hexMatch[1].length > width / 4) return null
    return BigInt(`0x${hexMatch[1]}`)
  }
  return null
}

export default function Ieee754Converter() {
  const [width, setWidth] = useState<Width>(64)
  const [decimalText, setDecimalText] = useState("")
  const [bitsText, setBitsText] = useState("")
  const [source, setSource] = useState<"decimal" | "bits">("decimal")

  const state = useMemo(() => {
    if (source === "decimal") {
      const value = parseDecimal(decimalText)
      if (value === null) {
        return {
          decoded: null,
          error: decimalText.trim() ? "Enter a number, Infinity, or NaN." : null,
          typed: null,
        }
      }
      return { decoded: describe(encode(value, width), width), error: null, typed: value }
    }

    const bits = parseBits(bitsText, width)
    if (bits === null) {
      return {
        decoded: null,
        error: bitsText.trim()
          ? `Enter up to ${width / 4} hexadecimal digits or exactly ${width} binary digits.`
          : null,
        typed: null,
      }
    }
    return { decoded: describe(bits, width), error: null, typed: null }
  }, [source, decimalText, bitsText, width])

  const roundingError = useMemo(() => {
    if (state.typed === null || !state.decoded) return null
    if (!Number.isFinite(state.typed) || !Number.isFinite(state.decoded.stored))
      return null
    const difference = state.decoded.stored - state.typed
    return difference === 0 ? "0 (exactly representable)" : difference.toExponential(6)
  }, [state])

  function reset() {
    setDecimalText("")
    setBitsText("")
    setSource("decimal")
  }

  const decoded = state.decoded
  const fullBits = decoded
    ? `${decoded.signBit}${decoded.exponentBits}${decoded.mantissaBits}`
    : ""

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Tabs
          value={String(width)}
          onValueChange={(value) => setWidth(Number(value) as Width)}
        >
          <TabsList>
            <TabsTrigger value="32">32-bit single</TabsTrigger>
            <TabsTrigger value="64">64-bit double</TabsTrigger>
          </TabsList>
        </Tabs>
        <Button
          variant="outline"
          size="sm"
          onClick={reset}
          disabled={!decimalText && !bitsText}
        >
          <RotateCcw className="size-4" />
          Reset
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="ieee-754-decimal">Decimal value</Label>
          <Input
            id="ieee-754-decimal"
            name="decimal"
            value={source === "decimal" ? decimalText : (decoded?.exact ?? "")}
            onChange={(event) => {
              setSource("decimal")
              setDecimalText(event.target.value)
            }}
            placeholder="0.1"
            className="font-mono text-sm"
            spellCheck={false}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="ieee-754-bits">Hexadecimal or binary word</Label>
          <Input
            id="ieee-754-bits"
            name="bits"
            value={source === "bits" ? bitsText : (decoded?.hex ?? "")}
            onChange={(event) => {
              setSource("bits")
              setBitsText(event.target.value)
            }}
            placeholder="3FB999999999999A"
            className="font-mono text-sm"
            spellCheck={false}
          />
        </div>
      </div>

      {state.error && (
        <p role="alert" className="text-destructive flex items-start gap-2 text-sm">
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
          {state.error}
        </p>
      )}

      {decoded && (
        <div className="space-y-4">
          <div className="border-border/60 space-y-3 rounded-lg border p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-sm font-medium">Bit layout</span>
              <CopyButton value={fullBits} label="Copy bits" />
            </div>
            <p className="font-mono text-xs leading-relaxed break-all sm:text-sm">
              {decoded.signBit} {decoded.exponentBits} {decoded.mantissaBits}
            </p>
            <dl className="grid gap-2 sm:grid-cols-3">
              {[
                { term: `Sign (1 bit)`, value: decoded.signBit },
                {
                  term: `Exponent (${LAYOUT[width].exponentBits} bits)`,
                  value: decoded.exponentBits,
                },
                {
                  term: `Mantissa (${LAYOUT[width].mantissaBits} bits)`,
                  value: decoded.mantissaBits,
                },
              ].map(({ term, value }) => (
                <div key={term}>
                  <dt className="text-muted-foreground text-xs">{term}</dt>
                  <dd className="font-mono text-xs break-all">{value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <dl className="grid gap-3 sm:grid-cols-2">
            {[
              { term: "Hexadecimal", value: `0x${decoded.hex}` },
              { term: "Classification", value: decoded.classification },
              { term: "Unbiased exponent", value: decoded.unbiasedExponent },
              {
                term: "Rounding error",
                value: roundingError ?? "not applicable",
              },
            ].map(({ term, value }) => (
              <div key={term} className="border-border/60 rounded-lg border p-3">
                <dt className="text-muted-foreground text-xs">{term}</dt>
                <dd className="mt-1 font-mono text-sm break-all">{value}</dd>
              </div>
            ))}
          </dl>

          <div className="border-border/60 rounded-lg border p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-muted-foreground text-xs">Exact stored value</span>
              <CopyButton value={decoded.exact} label="Copy value" />
            </div>
            <p className="mt-1 font-mono text-sm break-all">{decoded.exact}</p>
          </div>
        </div>
      )}
    </div>
  )
}
