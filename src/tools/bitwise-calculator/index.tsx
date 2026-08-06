import { useMemo, useState } from "react"
import { AlertCircle, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
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

const OPERATORS = [
  { value: "and", label: "AND (a & b)", unary: false },
  { value: "or", label: "OR (a | b)", unary: false },
  { value: "xor", label: "XOR (a ^ b)", unary: false },
  { value: "not", label: "NOT (~a)", unary: true },
  { value: "shl", label: "Left shift (a << b)", unary: false },
  { value: "shr", label: "Arithmetic right shift (a >> b)", unary: false },
  { value: "ushr", label: "Logical right shift (a >>> b)", unary: false },
] as const

type Operator = (typeof OPERATORS)[number]["value"]

const WIDTHS = [8, 16, 32, 64] as const
type Width = (typeof WIDTHS)[number]

function parseOperand(text: string): bigint | null {
  const cleaned = text.trim().replace(/[\s_]/g, "")
  if (!cleaned) return null
  const negative = cleaned.startsWith("-")
  const body = negative ? cleaned.slice(1) : cleaned
  if (!/^(0x[0-9a-f]+|0b[01]+|0o[0-7]+|\d+)$/i.test(body)) return null
  try {
    const magnitude = BigInt(body.toLowerCase())
    return negative ? -magnitude : magnitude
  } catch {
    return null
  }
}

function mask(width: Width): bigint {
  return (1n << BigInt(width)) - 1n
}

/** Wraps a value into the given width, the way a fixed-size register would. */
function toUnsigned(value: bigint, width: Width): bigint {
  return ((value % (1n << BigInt(width))) + (1n << BigInt(width))) % (1n << BigInt(width))
}

function toSigned(unsigned: bigint, width: Width): bigint {
  const limit = 1n << BigInt(width - 1)
  return unsigned >= limit ? unsigned - (1n << BigInt(width)) : unsigned
}

function apply(operator: Operator, a: bigint, b: bigint, width: Width): bigint {
  const left = toUnsigned(a, width)
  const right = toUnsigned(b, width)

  switch (operator) {
    case "and":
      return left & right
    case "or":
      return left | right
    case "xor":
      return left ^ right
    case "not":
      return ~left & mask(width)
    case "shl":
      return (left << (right % BigInt(width))) & mask(width)
    case "ushr":
      return left >> (right % BigInt(width))
    case "shr":
      return toUnsigned(toSigned(left, width) >> (right % BigInt(width)), width)
  }
}

function bits(value: bigint, width: Width): string {
  return value.toString(2).padStart(width, "0")
}

function groupBits(binary: string): string {
  return (binary.match(/.{1,8}/g) ?? []).join(" ")
}

export default function BitwiseCalculator() {
  const [operandA, setOperandA] = useState("")
  const [operandB, setOperandB] = useState("")
  const [operator, setOperator] = useState<Operator>("and")
  const [width, setWidth] = useState<Width>(32)

  const isUnary = OPERATORS.find((entry) => entry.value === operator)?.unary ?? false

  const outcome = useMemo(() => {
    const a = parseOperand(operandA)
    if (a === null) {
      return {
        rows: null,
        error: operandA.trim() ? "Operand A is not a valid number." : null,
      }
    }

    const b = isUnary ? 0n : parseOperand(operandB)
    if (b === null) {
      return {
        rows: null,
        error: operandB.trim() ? "Operand B is not a valid number." : null,
      }
    }

    const result = apply(operator, a, b, width)
    return {
      error: null,
      rows: {
        a: toUnsigned(a, width),
        b: toUnsigned(b, width),
        result,
      },
    }
  }, [operandA, operandB, operator, width, isUnary])

  function reset() {
    setOperandA("")
    setOperandB("")
    setOperator("and")
    setWidth(32)
  }

  const rows = outcome.rows

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="bitwise-operand-a">Operand A</Label>
          <Input
            id="bitwise-operand-a"
            name="operandA"
            value={operandA}
            onChange={(event) => setOperandA(event.target.value)}
            placeholder="0xF0 or 240 or 0b11110000"
            className="font-mono text-sm"
            spellCheck={false}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="bitwise-operand-b">
            {isUnary ? "Operand B (not used by NOT)" : "Operand B"}
          </Label>
          <Input
            id="bitwise-operand-b"
            name="operandB"
            value={operandB}
            onChange={(event) => setOperandB(event.target.value)}
            placeholder="0x0F"
            className="font-mono text-sm"
            disabled={isUnary}
            spellCheck={false}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="bitwise-operator">Operator</Label>
          <Select
            value={operator}
            onValueChange={(value) => setOperator(value as Operator)}
          >
            <SelectTrigger id="bitwise-operator" name="operator" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {OPERATORS.map((entry) => (
                <SelectItem key={entry.value} value={entry.value}>
                  {entry.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="bitwise-width">Width</Label>
          <Select
            value={String(width)}
            onValueChange={(value) => setWidth(Number(value) as Width)}
          >
            <SelectTrigger id="bitwise-width" name="width" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {WIDTHS.map((entry) => (
                <SelectItem key={entry} value={String(entry)}>
                  {entry}-bit
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={reset}
          disabled={!operandA && !operandB}
        >
          <RotateCcw className="size-4" />
          Reset
        </Button>
      </div>

      {outcome.error && (
        <p role="alert" className="text-destructive flex items-start gap-2 text-sm">
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
          {outcome.error}
        </p>
      )}

      {rows && (
        <div className="space-y-3">
          <div className="border-border/60 space-y-3 rounded-lg border p-3">
            {[
              { label: "A", value: rows.a, show: true },
              { label: "B", value: rows.b, show: !isUnary },
              { label: "Result", value: rows.result, show: true },
            ]
              .filter((row) => row.show)
              .map((row) => (
                <div key={row.label}>
                  <p className="text-muted-foreground text-xs">{row.label}</p>
                  <p className="font-mono text-xs break-all sm:text-sm">
                    {groupBits(bits(row.value, width))}
                  </p>
                </div>
              ))}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-sm font-medium">Result</span>
            <CopyButton value={rows.result.toString()} label="Copy decimal" />
          </div>

          <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { term: "Unsigned", value: rows.result.toString() },
              { term: "Signed", value: toSigned(rows.result, width).toString() },
              {
                term: "Hexadecimal",
                value: `0x${rows.result.toString(16).toUpperCase()}`,
              },
              { term: "Octal", value: `0o${rows.result.toString(8)}` },
            ].map(({ term, value }) => (
              <div key={term} className="border-border/60 rounded-lg border p-3">
                <dt className="text-muted-foreground text-xs">{term}</dt>
                <dd className="mt-1 font-mono text-sm break-all">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}
    </div>
  )
}
