import { useMemo, useState } from "react"
import { Trash2 } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const CURRENCIES = [
  { value: "INR", label: "Indian rupee", locale: "en-IN" },
  { value: "USD", label: "US dollar", locale: "en-US" },
  { value: "EUR", label: "Euro", locale: "en-IE" },
  { value: "GBP", label: "Pound sterling", locale: "en-GB" },
]

const COMPOUNDING = [
  { value: "12", label: "Monthly" },
  { value: "4", label: "Quarterly" },
  { value: "2", label: "Half-yearly" },
  { value: "1", label: "Annually" },
]

const CONTRIBUTION_FREQUENCY = [
  { value: "12", label: "Monthly" },
  { value: "4", label: "Quarterly" },
  { value: "1", label: "Yearly" },
  { value: "0", label: "No recurring contribution" },
]

interface YearRow {
  year: number
  contributed: number
  interest: number
  balance: number
}

interface Projection {
  rows: YearRow[]
  finalBalance: number
  totalContributed: number
  totalInterest: number
}

function project(
  principal: number,
  contribution: number,
  contributionsPerYear: number,
  annualRatePercent: number,
  years: number,
  compoundsPerYear: number,
  contributeAtStart: boolean,
): Projection {
  // Both schedules are stepped on the finer of the two so a contribution
  // always lands on a period boundary rather than being smeared across one.
  const periodsPerYear = Math.max(compoundsPerYear, contributionsPerYear || 1)
  const ratePerCompound = annualRatePercent / 100 / compoundsPerYear
  const compoundEvery = periodsPerYear / compoundsPerYear
  const contributeEvery = contributionsPerYear ? periodsPerYear / contributionsPerYear : 0

  let balance = principal
  let contributed = principal
  const rows: YearRow[] = []

  for (let year = 1; year <= years; year++) {
    const openingBalance = balance
    const openingContributed = contributed

    for (let period = 1; period <= periodsPerYear; period++) {
      const contributesNow = contributeEvery > 0 && period % contributeEvery === 0
      const compoundsNow = period % compoundEvery === 0

      if (contributesNow && contributeAtStart) {
        balance += contribution
        contributed += contribution
      }
      if (compoundsNow) balance *= 1 + ratePerCompound
      if (contributesNow && !contributeAtStart) {
        balance += contribution
        contributed += contribution
      }
    }

    rows.push({
      year,
      contributed: contributed - openingContributed,
      interest: balance - openingBalance - (contributed - openingContributed),
      balance,
    })
  }

  return {
    rows,
    finalBalance: balance,
    totalContributed: contributed,
    totalInterest: balance - contributed,
  }
}

export default function CompoundInterestCalculator() {
  const [principal, setPrincipal] = useState("100000")
  const [contribution, setContribution] = useState("5000")
  const [contributionFrequency, setContributionFrequency] = useState("12")
  const [rate, setRate] = useState("12")
  const [years, setYears] = useState("10")
  const [compounding, setCompounding] = useState("12")
  const [contributeAtStart, setContributeAtStart] = useState(false)
  const [currency, setCurrency] = useState("INR")

  const numbers = {
    principal: Number(principal),
    contribution: Number(contribution),
    rate: Number(rate),
    years: Number(years),
  }

  const errors: string[] = []
  if (!Number.isFinite(numbers.principal) || numbers.principal < 0) {
    errors.push("Starting amount must be zero or a positive number.")
  }
  if (!Number.isFinite(numbers.contribution) || numbers.contribution < 0) {
    errors.push("Contribution must be zero or a positive number.")
  }
  if (!Number.isFinite(numbers.rate) || numbers.rate < 0 || numbers.rate > 100) {
    errors.push("Annual return must be between 0 and 100 percent.")
  }
  if (!Number.isInteger(numbers.years) || numbers.years < 1 || numbers.years > 60) {
    errors.push("Time horizon must be a whole number of years between 1 and 60.")
  }

  const valid = errors.length === 0

  const projection = useMemo(
    () =>
      valid
        ? project(
            numbers.principal,
            numbers.contribution,
            Number(contributionFrequency),
            numbers.rate,
            numbers.years,
            Number(compounding),
            contributeAtStart,
          )
        : null,
    [
      valid,
      numbers.principal,
      numbers.contribution,
      contributionFrequency,
      numbers.rate,
      numbers.years,
      compounding,
      contributeAtStart,
    ],
  )

  const locale = CURRENCIES.find((entry) => entry.value === currency)?.locale ?? "en-US"
  const money = new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  })

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <Label htmlFor="compound-principal">Starting amount</Label>
          <Input
            id="compound-principal"
            name="principal"
            type="number"
            min={0}
            step="any"
            inputMode="decimal"
            value={principal}
            onChange={(event) => setPrincipal(event.target.value)}
            className="mt-1.5"
          />
        </div>

        <div>
          <Label htmlFor="compound-contribution">Recurring contribution</Label>
          <Input
            id="compound-contribution"
            name="contribution"
            type="number"
            min={0}
            step="any"
            inputMode="decimal"
            value={contribution}
            onChange={(event) => setContribution(event.target.value)}
            disabled={contributionFrequency === "0"}
            className="mt-1.5"
          />
        </div>

        <div>
          <Label htmlFor="compound-frequency">Contribution frequency</Label>
          <Select
            value={contributionFrequency}
            onValueChange={(next) => next && setContributionFrequency(next as string)}
          >
            <SelectTrigger id="compound-frequency" className="mt-1.5 w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CONTRIBUTION_FREQUENCY.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="compound-rate">Expected annual return, percent</Label>
          <Input
            id="compound-rate"
            name="rate"
            type="number"
            min={0}
            max={100}
            step="any"
            inputMode="decimal"
            value={rate}
            onChange={(event) => setRate(event.target.value)}
            className="mt-1.5"
          />
        </div>

        <div>
          <Label htmlFor="compound-years">Time horizon in years</Label>
          <Input
            id="compound-years"
            name="years"
            type="number"
            min={1}
            max={60}
            value={years}
            onChange={(event) => setYears(event.target.value)}
            className="mt-1.5"
          />
        </div>

        <div>
          <Label htmlFor="compound-compounding">Compounding</Label>
          <Select
            value={compounding}
            onValueChange={(next) => next && setCompounding(next as string)}
          >
            <SelectTrigger id="compound-compounding" className="mt-1.5 w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {COMPOUNDING.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        <div className="flex items-center gap-2">
          <Switch
            id="compound-timing"
            name="contributeAtStart"
            checked={contributeAtStart}
            onCheckedChange={setContributeAtStart}
            disabled={contributionFrequency === "0"}
          />
          <Label htmlFor="compound-timing" className="font-normal">
            Contribute at the start of each period
          </Label>
        </div>

        <div className="min-w-44">
          <Label htmlFor="compound-currency">Currency</Label>
          <Select
            value={currency}
            onValueChange={(next) => next && setCurrency(next as string)}
          >
            <SelectTrigger id="compound-currency" className="mt-1.5 w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CURRENCIES.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {errors.length > 0 && (
        <ul className="text-destructive space-y-1 text-sm">
          {errors.map((message) => (
            <li key={message}>{message}</li>
          ))}
        </ul>
      )}

      {projection && (
        <div className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="border-border/60 bg-card rounded-lg border p-4">
              <p className="text-muted-foreground text-xs">Final balance</p>
              <p className="mt-1 text-2xl font-semibold tabular-nums">
                {money.format(projection.finalBalance)}
              </p>
            </div>
            <div className="border-border/60 bg-card rounded-lg border p-4">
              <p className="text-muted-foreground text-xs">Total invested</p>
              <p className="mt-1 text-2xl font-semibold tabular-nums">
                {money.format(projection.totalContributed)}
              </p>
            </div>
            <div className="border-border/60 bg-card rounded-lg border p-4">
              <p className="text-muted-foreground text-xs">Interest earned</p>
              <p className="mt-1 text-2xl font-semibold tabular-nums">
                {money.format(projection.totalInterest)}
              </p>
              <p className="text-muted-foreground mt-1 text-xs tabular-nums">
                {Math.round((projection.totalInterest / projection.finalBalance) * 100)}{" "}
                percent of the final balance
              </p>
            </div>
          </div>

          <div className="border-border/60 overflow-x-auto rounded-lg border">
            <table className="w-full text-sm">
              <caption className="sr-only">
                Year by year contributions, interest, and closing balance
              </caption>
              <thead className="bg-muted/50">
                <tr>
                  <th scope="col" className="px-4 py-2 text-left font-medium">
                    Year
                  </th>
                  <th scope="col" className="px-4 py-2 text-right font-medium">
                    Contributed
                  </th>
                  <th scope="col" className="px-4 py-2 text-right font-medium">
                    Interest
                  </th>
                  <th scope="col" className="px-4 py-2 text-right font-medium">
                    Closing balance
                  </th>
                </tr>
              </thead>
              <tbody>
                {projection.rows.map((row) => (
                  <tr key={row.year} className="border-border/60 border-t">
                    <th scope="row" className="px-4 py-2 text-left font-normal">
                      {row.year}
                    </th>
                    <td className="px-4 py-2 text-right tabular-nums">
                      {money.format(row.contributed)}
                    </td>
                    <td className="px-4 py-2 text-right tabular-nums">
                      {money.format(row.interest)}
                    </td>
                    <td className="px-4 py-2 text-right font-medium tabular-nums">
                      {money.format(row.balance)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          setPrincipal("100000")
          setContribution("5000")
          setContributionFrequency("12")
          setRate("12")
          setYears("10")
          setCompounding("12")
          setContributeAtStart(false)
          setCurrency("INR")
        }}
      >
        <Trash2 className="size-4" />
        Reset
      </Button>
    </div>
  )
}
