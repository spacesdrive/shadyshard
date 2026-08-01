import { useMemo, useState } from "react"
import { AlertCircle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CopyButton } from "@/components/tool/CopyButton"

const FREQUENCIES: { value: string; label: string; perYear: number }[] = [
  { value: "1", label: "Yearly", perYear: 1 },
  { value: "2", label: "Half-yearly", perYear: 2 },
  { value: "4", label: "Quarterly", perYear: 4 },
  { value: "12", label: "Monthly", perYear: 12 },
  { value: "365", label: "Daily", perYear: 365 },
]

const CURRENCIES: { value: string; label: string; symbol: string }[] = [
  { value: "usd", label: "US dollar", symbol: "$" },
  { value: "eur", label: "Euro", symbol: "€" },
  { value: "gbp", label: "Pound sterling", symbol: "£" },
  { value: "inr", label: "Indian rupee", symbol: "₹" },
  { value: "none", label: "No symbol", symbol: "" },
]

interface YearRow {
  year: number
  invested: number
  balance: number
}

function formatMoney(value: number, symbol: string): string {
  return `${symbol}${value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

interface Projection {
  finalBalance: number
  totalInvested: number
  totalGain: number
  rows: YearRow[]
}

function projectLumpSum(
  principal: number,
  annualRate: number,
  years: number,
  perYear: number,
): Projection {
  const periodRate = annualRate / 100 / perYear
  const rows: YearRow[] = []

  for (let year = 1; year <= years; year++) {
    const balance = principal * Math.pow(1 + periodRate, perYear * year)
    rows.push({ year, invested: principal, balance })
  }

  const finalBalance = rows.at(-1)?.balance ?? principal
  return {
    finalBalance,
    totalInvested: principal,
    totalGain: finalBalance - principal,
    rows,
  }
}

/**
 * Contributions are treated as made at the end of each period, which is the
 * ordinary annuity convention every SIP and savings calculator uses.
 */
function projectContributions(
  principal: number,
  contribution: number,
  annualRate: number,
  years: number,
  perYear: number,
): Projection {
  const periodRate = annualRate / 100 / perYear
  const rows: YearRow[] = []
  let balance = principal
  let invested = principal

  for (let year = 1; year <= years; year++) {
    for (let period = 0; period < perYear; period++) {
      balance = balance * (1 + periodRate) + contribution
      invested += contribution
    }
    rows.push({ year, invested, balance })
  }

  return {
    finalBalance: balance,
    totalInvested: invested,
    totalGain: balance - invested,
    rows,
  }
}

interface SummaryProps {
  projection: Projection
  symbol: string
  gainLabel: string
}

function Summary({ projection, symbol, gainLabel }: SummaryProps) {
  const growth =
    projection.totalInvested > 0
      ? (projection.totalGain / projection.totalInvested) * 100
      : 0

  const summaryText = [
    `Final value: ${formatMoney(projection.finalBalance, symbol)}`,
    `Total invested: ${formatMoney(projection.totalInvested, symbol)}`,
    `${gainLabel}: ${formatMoney(projection.totalGain, symbol)}`,
    `Growth on the amount invested: ${growth.toFixed(1)}%`,
  ].join("\n")

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="border-border/60 rounded-lg border p-3 text-center">
          <p className="text-lg font-semibold break-all tabular-nums">
            {formatMoney(projection.finalBalance, symbol)}
          </p>
          <p className="text-muted-foreground mt-1 text-xs">Final value</p>
        </div>
        <div className="border-border/60 rounded-lg border p-3 text-center">
          <p className="text-lg font-semibold break-all tabular-nums">
            {formatMoney(projection.totalInvested, symbol)}
          </p>
          <p className="text-muted-foreground mt-1 text-xs">Total invested</p>
        </div>
        <div className="border-border/60 rounded-lg border p-3 text-center">
          <p className="text-lg font-semibold break-all text-emerald-500 tabular-nums">
            {formatMoney(projection.totalGain, symbol)}
          </p>
          <p className="text-muted-foreground mt-1 text-xs">{gainLabel}</p>
        </div>
        <div className="border-border/60 rounded-lg border p-3 text-center">
          <p className="text-lg font-semibold tabular-nums">{growth.toFixed(1)}%</p>
          <p className="text-muted-foreground mt-1 text-xs">Growth on what you put in</p>
        </div>
      </div>

      <div className="border-border/60 max-h-96 overflow-auto rounded-lg border">
        <table className="w-full text-sm">
          <caption className="sr-only">Balance at the end of each year</caption>
          <thead className="bg-muted/50 sticky top-0">
            <tr>
              <th scope="col" className="px-3 py-2 text-left font-medium">
                Year
              </th>
              <th scope="col" className="px-3 py-2 text-right font-medium">
                Invested
              </th>
              <th scope="col" className="px-3 py-2 text-right font-medium">
                Balance
              </th>
              <th scope="col" className="px-3 py-2 text-right font-medium">
                {gainLabel}
              </th>
            </tr>
          </thead>
          <tbody>
            {projection.rows.map((row) => (
              <tr key={row.year} className="border-border/60 border-t">
                <td className="px-3 py-2 tabular-nums">{row.year}</td>
                <td className="px-3 py-2 text-right font-mono text-xs tabular-nums">
                  {formatMoney(row.invested, symbol)}
                </td>
                <td className="px-3 py-2 text-right font-mono text-xs tabular-nums">
                  {formatMoney(row.balance, symbol)}
                </td>
                <td className="px-3 py-2 text-right font-mono text-xs tabular-nums">
                  {formatMoney(row.balance - row.invested, symbol)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <CopyButton value={summaryText} label="Copy summary" />
    </div>
  )
}

export default function CompoundInterestCalculator() {
  const [mode, setMode] = useState("lump")
  const [principal, setPrincipal] = useState("10000")
  const [contribution, setContribution] = useState("500")
  const [rate, setRate] = useState("8")
  const [years, setYears] = useState("15")
  const [frequency, setFrequency] = useState("12")
  const [currency, setCurrency] = useState("usd")

  const symbol = CURRENCIES.find((entry) => entry.value === currency)?.symbol ?? "$"
  const perYear = FREQUENCIES.find((entry) => entry.value === frequency)?.perYear ?? 12

  const { projection, error } = useMemo(() => {
    const principalValue = Number(principal)
    const contributionValue = Number(contribution)
    const rateValue = Number(rate)
    const yearsValue = Number(years)

    if (!Number.isFinite(principalValue) || principalValue < 0) {
      return { projection: null, error: "Enter a starting amount of zero or more." }
    }
    if (
      mode === "sip" &&
      (!Number.isFinite(contributionValue) || contributionValue < 0)
    ) {
      return { projection: null, error: "Enter a contribution of zero or more." }
    }
    if (!Number.isFinite(rateValue) || rateValue < 0 || rateValue > 100) {
      return {
        projection: null,
        error: "Enter an annual return between 0 and 100 percent.",
      }
    }
    if (!Number.isInteger(yearsValue) || yearsValue < 1 || yearsValue > 60) {
      return {
        projection: null,
        error: "Enter a whole number of years between 1 and 60.",
      }
    }
    if (mode === "sip" && principalValue === 0 && contributionValue === 0) {
      return {
        projection: null,
        error: "Enter a starting amount, a regular contribution, or both.",
      }
    }
    if (mode === "lump" && principalValue === 0) {
      return { projection: null, error: "Enter a starting amount greater than zero." }
    }

    return {
      projection:
        mode === "lump"
          ? projectLumpSum(principalValue, rateValue, yearsValue, perYear)
          : projectContributions(
              principalValue,
              contributionValue,
              rateValue,
              yearsValue,
              perYear,
            ),
      error: null,
    }
  }, [mode, principal, contribution, rate, years, perYear])

  const contributionLabel =
    perYear === 12
      ? "Monthly contribution"
      : perYear === 1
        ? "Yearly contribution"
        : "Contribution each period"

  return (
    <div className="space-y-5">
      <Tabs value={mode} onValueChange={(value) => setMode(value as string)}>
        <TabsList>
          <TabsTrigger value="lump">One-off amount</TabsTrigger>
          <TabsTrigger value="sip">Regular contributions</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <Label htmlFor="ci-principal">
            {mode === "lump" ? "Starting amount" : "Starting amount, if any"}
          </Label>
          <Input
            id="ci-principal"
            name="principal"
            type="number"
            min="0"
            step="any"
            value={principal}
            onChange={(event) => setPrincipal(event.target.value)}
            className="mt-1.5"
          />
        </div>

        {mode === "sip" && (
          <div>
            <Label htmlFor="ci-contribution">{contributionLabel}</Label>
            <Input
              id="ci-contribution"
              name="contribution"
              type="number"
              min="0"
              step="any"
              value={contribution}
              onChange={(event) => setContribution(event.target.value)}
              className="mt-1.5"
            />
          </div>
        )}

        <div>
          <Label htmlFor="ci-rate">Annual return (%)</Label>
          <Input
            id="ci-rate"
            name="rate"
            type="number"
            min="0"
            max="100"
            step="any"
            value={rate}
            onChange={(event) => setRate(event.target.value)}
            className="mt-1.5"
          />
        </div>

        <div>
          <Label htmlFor="ci-years">Years</Label>
          <Input
            id="ci-years"
            name="years"
            type="number"
            min="1"
            max="60"
            step="1"
            value={years}
            onChange={(event) => setYears(event.target.value)}
            className="mt-1.5"
          />
        </div>

        <div>
          <Label htmlFor="ci-frequency">
            {mode === "lump" ? "Compounding" : "Contribution and compounding"}
          </Label>
          <Select
            value={frequency}
            onValueChange={(value) => value && setFrequency(value as string)}
          >
            <SelectTrigger id="ci-frequency" className="mt-1.5 w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FREQUENCIES.map((entry) => (
                <SelectItem key={entry.value} value={entry.value}>
                  {entry.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="ci-currency">Currency symbol</Label>
          <Select
            value={currency}
            onValueChange={(value) => value && setCurrency(value as string)}
          >
            <SelectTrigger id="ci-currency" className="mt-1.5 w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CURRENCIES.map((entry) => (
                <SelectItem key={entry.value} value={entry.value}>
                  {entry.label}
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

      {projection && (
        <Summary
          projection={projection}
          symbol={symbol}
          gainLabel={mode === "lump" ? "Interest earned" : "Returns"}
        />
      )}
    </div>
  )
}
