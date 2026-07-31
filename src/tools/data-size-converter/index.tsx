import { useState } from "react"
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

interface Unit {
  value: string
  label: string
  /** How many bytes one of this unit is worth. */
  bytes: number
  group: "Bytes, decimal" | "Bytes, binary" | "Bits"
}

const UNITS: Unit[] = [
  { value: "b", label: "Bytes (B)", bytes: 1, group: "Bytes, decimal" },
  { value: "kb", label: "Kilobytes (KB)", bytes: 1e3, group: "Bytes, decimal" },
  { value: "mb", label: "Megabytes (MB)", bytes: 1e6, group: "Bytes, decimal" },
  { value: "gb", label: "Gigabytes (GB)", bytes: 1e9, group: "Bytes, decimal" },
  { value: "tb", label: "Terabytes (TB)", bytes: 1e12, group: "Bytes, decimal" },
  { value: "pb", label: "Petabytes (PB)", bytes: 1e15, group: "Bytes, decimal" },
  { value: "kib", label: "Kibibytes (KiB)", bytes: 1024, group: "Bytes, binary" },
  { value: "mib", label: "Mebibytes (MiB)", bytes: 1024 ** 2, group: "Bytes, binary" },
  { value: "gib", label: "Gibibytes (GiB)", bytes: 1024 ** 3, group: "Bytes, binary" },
  { value: "tib", label: "Tebibytes (TiB)", bytes: 1024 ** 4, group: "Bytes, binary" },
  { value: "pib", label: "Pebibytes (PiB)", bytes: 1024 ** 5, group: "Bytes, binary" },
  { value: "bit", label: "Bits (b)", bytes: 1 / 8, group: "Bits" },
  { value: "kbit", label: "Kilobits (kb)", bytes: 1e3 / 8, group: "Bits" },
  { value: "mbit", label: "Megabits (Mb)", bytes: 1e6 / 8, group: "Bits" },
  { value: "gbit", label: "Gigabits (Gb)", bytes: 1e9 / 8, group: "Bits" },
]

const GROUPS: Unit["group"][] = ["Bytes, decimal", "Bytes, binary", "Bits"]

function formatValue(value: number): string {
  if (!Number.isFinite(value)) return "-"
  if (value === 0) return "0"
  if (value !== 0 && (Math.abs(value) < 1e-4 || Math.abs(value) >= 1e15)) {
    return value.toExponential(4)
  }
  return value
    .toLocaleString("en-US", { maximumFractionDigits: 6, useGrouping: true })
    .toString()
}

export default function DataSizeConverter() {
  const [amount, setAmount] = useState("1")
  const [unit, setUnit] = useState("gb")

  const parsed = Number(amount)
  const selectedUnit = UNITS.find((entry) => entry.value === unit) ?? UNITS[0]

  const error =
    amount.trim() === ""
      ? null
      : !Number.isFinite(parsed)
        ? "Enter a number, for example 512 or 1.5."
        : parsed < 0
          ? "Enter a size of zero or more. Negative sizes are not meaningful."
          : null

  const totalBytes = error || amount.trim() === "" ? null : parsed * selectedUnit.bytes

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="size-amount">Size</Label>
          <Input
            id="size-amount"
            name="amount"
            type="number"
            min="0"
            step="any"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            className="mt-1.5"
            aria-invalid={error ? true : undefined}
          />
        </div>
        <div>
          <Label htmlFor="size-unit">Unit</Label>
          <Select value={unit} onValueChange={(next) => next && setUnit(next as string)}>
            <SelectTrigger id="size-unit" className="mt-1.5 w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {UNITS.map((entry) => (
                <SelectItem key={entry.value} value={entry.value}>
                  {entry.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {error && <p className="text-destructive text-sm">{error}</p>}

      {totalBytes !== null && (
        <>
          <div className="border-border/60 rounded-lg border p-4 text-center">
            <p className="text-2xl font-semibold tabular-nums">
              {formatValue(totalBytes)}
            </p>
            <p className="text-muted-foreground mt-1 text-xs">Bytes exactly</p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {GROUPS.map((group) => (
              <div key={group} className="border-border/60 rounded-lg border">
                <h2 className="border-border/60 border-b px-3 py-2 text-sm font-medium">
                  {group}
                </h2>
                <ul className="divide-border/60 divide-y">
                  {UNITS.filter((entry) => entry.group === group).map((entry) => (
                    <li
                      key={entry.value}
                      className="flex items-center justify-between gap-2 px-3 py-2"
                    >
                      <span className="text-muted-foreground min-w-0 truncate text-xs">
                        {entry.label}
                      </span>
                      <span className="flex shrink-0 items-center gap-1">
                        <span className="font-mono text-xs tabular-nums">
                          {formatValue(totalBytes / entry.bytes)}
                        </span>
                        <CopyButton
                          value={String(totalBytes / entry.bytes)}
                          label={`Copy value in ${entry.label}`}
                          variant="ghost"
                          size="icon-sm"
                        />
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </>
      )}

      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          setAmount("1")
          setUnit("gb")
        }}
      >
        Reset
      </Button>
    </div>
  )
}
