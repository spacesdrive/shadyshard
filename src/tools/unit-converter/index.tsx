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

interface Unit {
  id: string
  label: string
  /** Multiplier to the category's base unit. Unused by temperature. */
  factor: number
}

interface Category {
  id: string
  label: string
  baseLabel: string
  units: Unit[]
}

const CATEGORIES: Category[] = [
  {
    id: "length",
    label: "Length",
    baseLabel: "metre",
    units: [
      { id: "mm", label: "Millimetres (mm)", factor: 0.001 },
      { id: "cm", label: "Centimetres (cm)", factor: 0.01 },
      { id: "m", label: "Metres (m)", factor: 1 },
      { id: "km", label: "Kilometres (km)", factor: 1000 },
      { id: "in", label: "Inches (in)", factor: 0.0254 },
      { id: "ft", label: "Feet (ft)", factor: 0.3048 },
      { id: "yd", label: "Yards (yd)", factor: 0.9144 },
      { id: "mi", label: "Miles (mi)", factor: 1609.344 },
      { id: "nmi", label: "Nautical miles (nmi)", factor: 1852 },
    ],
  },
  {
    id: "mass",
    label: "Weight and mass",
    baseLabel: "kilogram",
    units: [
      { id: "mg", label: "Milligrams (mg)", factor: 0.000001 },
      { id: "g", label: "Grams (g)", factor: 0.001 },
      { id: "kg", label: "Kilograms (kg)", factor: 1 },
      { id: "t", label: "Tonnes (t)", factor: 1000 },
      { id: "oz", label: "Ounces (oz)", factor: 0.028349523125 },
      { id: "lb", label: "Pounds (lb)", factor: 0.45359237 },
      { id: "st", label: "Stone (st)", factor: 6.35029318 },
      { id: "ton_us", label: "Short tons (US)", factor: 907.18474 },
      { id: "ton_uk", label: "Long tons (UK)", factor: 1016.0469088 },
    ],
  },
  {
    id: "temperature",
    label: "Temperature",
    baseLabel: "degree Celsius",
    units: [
      { id: "c", label: "Celsius (C)", factor: 1 },
      { id: "f", label: "Fahrenheit (F)", factor: 1 },
      { id: "k", label: "Kelvin (K)", factor: 1 },
    ],
  },
  {
    id: "area",
    label: "Area",
    baseLabel: "square metre",
    units: [
      { id: "cm2", label: "Square centimetres", factor: 0.0001 },
      { id: "m2", label: "Square metres", factor: 1 },
      { id: "ha", label: "Hectares", factor: 10000 },
      { id: "km2", label: "Square kilometres", factor: 1000000 },
      { id: "in2", label: "Square inches", factor: 0.00064516 },
      { id: "ft2", label: "Square feet", factor: 0.09290304 },
      { id: "yd2", label: "Square yards", factor: 0.83612736 },
      { id: "acre", label: "Acres", factor: 4046.8564224 },
      { id: "mi2", label: "Square miles", factor: 2589988.110336 },
    ],
  },
  {
    id: "volume",
    label: "Volume",
    baseLabel: "litre",
    units: [
      { id: "ml", label: "Millilitres (ml)", factor: 0.001 },
      { id: "l", label: "Litres (l)", factor: 1 },
      { id: "m3", label: "Cubic metres", factor: 1000 },
      { id: "tsp_us", label: "Teaspoons (US)", factor: 0.00492892159375 },
      { id: "tbsp_us", label: "Tablespoons (US)", factor: 0.01478676478125 },
      { id: "cup_us", label: "Cups (US)", factor: 0.2365882365 },
      { id: "pt_us", label: "Pints (US)", factor: 0.473176473 },
      { id: "qt_us", label: "Quarts (US)", factor: 0.946352946 },
      { id: "gal_us", label: "Gallons (US)", factor: 3.785411784 },
      { id: "pt_uk", label: "Pints (imperial)", factor: 0.56826125 },
      { id: "gal_uk", label: "Gallons (imperial)", factor: 4.54609 },
    ],
  },
  {
    id: "speed",
    label: "Speed",
    baseLabel: "metre per second",
    units: [
      { id: "ms", label: "Metres per second", factor: 1 },
      { id: "kmh", label: "Kilometres per hour", factor: 0.2777777777777778 },
      { id: "mph", label: "Miles per hour", factor: 0.44704 },
      { id: "kn", label: "Knots", factor: 0.5144444444444445 },
      { id: "fts", label: "Feet per second", factor: 0.3048 },
    ],
  },
  {
    id: "pressure",
    label: "Pressure",
    baseLabel: "pascal",
    units: [
      { id: "pa", label: "Pascals (Pa)", factor: 1 },
      { id: "kpa", label: "Kilopascals (kPa)", factor: 1000 },
      { id: "bar", label: "Bar", factor: 100000 },
      { id: "psi", label: "Pounds per square inch (psi)", factor: 6894.757293168 },
      { id: "atm", label: "Atmospheres (atm)", factor: 101325 },
      { id: "mmhg", label: "Millimetres of mercury (mmHg)", factor: 133.322387415 },
    ],
  },
  {
    id: "energy",
    label: "Energy",
    baseLabel: "joule",
    units: [
      { id: "j", label: "Joules (J)", factor: 1 },
      { id: "kj", label: "Kilojoules (kJ)", factor: 1000 },
      { id: "cal", label: "Calories (cal)", factor: 4.184 },
      { id: "kcal", label: "Kilocalories (kcal)", factor: 4184 },
      { id: "wh", label: "Watt hours (Wh)", factor: 3600 },
      { id: "kwh", label: "Kilowatt hours (kWh)", factor: 3600000 },
      { id: "btu", label: "British thermal units (BTU)", factor: 1055.05585262 },
    ],
  },
]

function toCelsius(value: number, unit: string): number {
  if (unit === "f") return ((value - 32) * 5) / 9
  if (unit === "k") return value - 273.15
  return value
}

function fromCelsius(celsius: number, unit: string): number {
  if (unit === "f") return (celsius * 9) / 5 + 32
  if (unit === "k") return celsius + 273.15
  return celsius
}

function convert(value: number, category: Category, from: Unit, to: Unit): number {
  if (category.id === "temperature") {
    return fromCelsius(toCelsius(value, from.id), to.id)
  }
  return (value * from.factor) / to.factor
}

function formatValue(value: number): string {
  if (!Number.isFinite(value)) return "-"
  if (value === 0) return "0"

  const magnitude = Math.abs(value)
  if (magnitude < 1e-6 || magnitude >= 1e12) return value.toExponential(6)

  return value.toLocaleString("en-US", { maximumFractionDigits: 8 })
}

export default function UnitConverter() {
  const [categoryId, setCategoryId] = useState("length")
  const [amount, setAmount] = useState("1")
  const [fromId, setFromId] = useState("m")
  const [toId, setToId] = useState("ft")

  const category = CATEGORIES.find((entry) => entry.id === categoryId) ?? CATEGORIES[0]
  const fromUnit = category.units.find((unit) => unit.id === fromId) ?? category.units[0]
  const toUnit = category.units.find((unit) => unit.id === toId) ?? category.units[1]

  function changeCategory(nextId: string) {
    const next = CATEGORIES.find((entry) => entry.id === nextId)
    if (!next) return
    setCategoryId(nextId)
    setFromId(next.units[0].id)
    setToId(next.units[1].id)
  }

  const parsed = Number(amount)
  const error =
    amount.trim() === ""
      ? null
      : !Number.isFinite(parsed)
        ? "Enter a number, for example 12 or 3.5."
        : category.id !== "temperature" && parsed < 0
          ? "A negative value is not meaningful for this kind of measurement."
          : null

  const result = useMemo(() => {
    if (error || amount.trim() === "") return null
    return convert(parsed, category, fromUnit, toUnit)
  }, [error, amount, parsed, category, fromUnit, toUnit])

  const allResults = useMemo(() => {
    if (error || amount.trim() === "") return []
    return category.units.map((unit) => ({
      unit,
      value: convert(parsed, category, fromUnit, unit),
    }))
  }, [error, amount, parsed, category, fromUnit])

  return (
    <div className="space-y-5">
      <div>
        <Label htmlFor="unit-category">What are you converting</Label>
        <Select
          value={categoryId}
          onValueChange={(value) => value && changeCategory(value as string)}
        >
          <SelectTrigger id="unit-category" className="mt-1.5 w-full sm:w-72">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map((entry) => (
              <SelectItem key={entry.id} value={entry.id}>
                {entry.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <Label htmlFor="unit-amount">Amount</Label>
          <Input
            id="unit-amount"
            name="amount"
            type="number"
            step="any"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            className="mt-1.5"
            aria-invalid={error ? true : undefined}
          />
        </div>
        <div>
          <Label htmlFor="unit-from">From</Label>
          <Select
            value={fromId}
            onValueChange={(value) => value && setFromId(value as string)}
          >
            <SelectTrigger id="unit-from" className="mt-1.5 w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {category.units.map((unit) => (
                <SelectItem key={unit.id} value={unit.id}>
                  {unit.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="unit-to">To</Label>
          <Select
            value={toId}
            onValueChange={(value) => value && setToId(value as string)}
          >
            <SelectTrigger id="unit-to" className="mt-1.5 w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {category.units.map((unit) => (
                <SelectItem key={unit.id} value={unit.id}>
                  {unit.label}
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

      {result !== null && (
        <>
          <div className="border-border/60 rounded-lg border p-6 text-center">
            <p className="text-3xl font-semibold break-all tabular-nums">
              {formatValue(result)}
            </p>
            <p className="text-muted-foreground mt-2 text-sm">{toUnit.label}</p>
            <div className="mt-4 flex justify-center">
              <CopyButton value={formatValue(result)} label="Copy result" />
            </div>
          </div>

          <div className="border-border/60 overflow-x-auto rounded-lg border">
            <table className="w-full text-sm">
              <caption className="sr-only">
                The same amount expressed in every {category.label.toLowerCase()} unit
              </caption>
              <thead className="bg-muted/50">
                <tr>
                  <th scope="col" className="px-3 py-2 text-left font-medium">
                    Unit
                  </th>
                  <th scope="col" className="px-3 py-2 text-right font-medium">
                    Value
                  </th>
                </tr>
              </thead>
              <tbody>
                {allResults.map((row) => (
                  <tr key={row.unit.id} className="border-border/60 border-t">
                    <td className="px-3 py-2">{row.unit.label}</td>
                    <td className="px-3 py-2 text-right font-mono text-xs tabular-nums">
                      {formatValue(row.value)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
