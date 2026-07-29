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
import { DownloadButton } from "@/components/tool/DownloadButton"
import { toDelimited } from "@/lib/csv"

const CURRENCIES = ["INR", "USD", "EUR", "GBP", "AUD", "CAD", "JPY"]
const TERM_UNITS = [
  { value: "years", label: "Years", months: 12 },
  { value: "months", label: "Months", months: 1 },
]
const MAX_MONTHS = 600

interface MonthRow {
  month: number
  interest: number
  principal: number
  balance: number
}

interface Schedule {
  monthlyPayment: number
  totalInterest: number
  totalPaid: number
  months: MonthRow[]
}

function buildSchedule(amount: number, annualRate: number, months: number): Schedule {
  const monthlyRate = annualRate / 12 / 100
  const monthlyPayment =
    monthlyRate === 0
      ? amount / months
      : (amount * monthlyRate * Math.pow(1 + monthlyRate, months)) /
        (Math.pow(1 + monthlyRate, months) - 1)

  const rows: MonthRow[] = []
  let balance = amount
  let totalInterest = 0

  for (let month = 1; month <= months; month++) {
    const interest = balance * monthlyRate
    const principal = month === months ? balance : monthlyPayment - interest
    balance = Math.max(0, balance - principal)
    totalInterest += interest
    rows.push({ month, interest, principal, balance })
  }

  return {
    monthlyPayment,
    totalInterest,
    totalPaid: amount + totalInterest,
    months: rows,
  }
}

interface YearRow {
  year: number
  interest: number
  principal: number
  balance: number
}

function byYear(months: MonthRow[]): YearRow[] {
  const years: YearRow[] = []
  months.forEach((row) => {
    const yearIndex = Math.floor((row.month - 1) / 12)
    const existing = years[yearIndex]
    if (existing) {
      existing.interest += row.interest
      existing.principal += row.principal
      existing.balance = row.balance
    } else {
      years[yearIndex] = {
        year: yearIndex + 1,
        interest: row.interest,
        principal: row.principal,
        balance: row.balance,
      }
    }
  })
  return years
}

export default function LoanEmiCalculator() {
  const [amount, setAmount] = useState("2500000")
  const [rate, setRate] = useState("8.5")
  const [term, setTerm] = useState("20")
  const [termUnit, setTermUnit] = useState("years")
  const [currency, setCurrency] = useState("INR")

  const amountValue = Number(amount)
  const rateValue = Number(rate)
  const termValue = Number(term)
  const monthsPerUnit = TERM_UNITS.find((unit) => unit.value === termUnit)?.months ?? 12
  const months = Math.round(termValue * monthsPerUnit)

  const error =
    !Number.isFinite(amountValue) || amountValue <= 0
      ? "Enter a loan amount greater than zero."
      : !Number.isFinite(rateValue) || rateValue < 0
        ? "Enter an interest rate of zero or more."
        : !Number.isFinite(termValue) || months < 1
          ? "Enter a term of at least one month."
          : months > MAX_MONTHS
            ? `The term is limited to ${MAX_MONTHS} months (50 years).`
            : null

  const schedule = useMemo(
    () => (error ? null : buildSchedule(amountValue, rateValue, months)),
    [error, amountValue, rateValue, months],
  )

  const formatter = useMemo(
    () =>
      new Intl.NumberFormat(undefined, {
        style: "currency",
        currency,
        maximumFractionDigits: 0,
      }),
    [currency],
  )

  function money(value: number): string {
    return formatter.format(value)
  }

  const years = schedule ? byYear(schedule.months) : []

  const summary = schedule
    ? [
        `Loan amount: ${money(amountValue)}`,
        `Annual interest rate: ${rateValue}%`,
        `Term: ${months} months`,
        `Monthly instalment: ${money(schedule.monthlyPayment)}`,
        `Total interest: ${money(schedule.totalInterest)}`,
        `Total repayment: ${money(schedule.totalPaid)}`,
      ].join("\n")
    : ""

  function scheduleCsv(): Blob {
    if (!schedule) return new Blob([], { type: "text/csv" })
    const rows = [
      ["Month", "Payment", "Interest", "Principal", "Remaining balance"],
      ...schedule.months.map((row) => [
        String(row.month),
        (row.interest + row.principal).toFixed(2),
        row.interest.toFixed(2),
        row.principal.toFixed(2),
        row.balance.toFixed(2),
      ]),
    ]
    return new Blob([toDelimited(rows, ",")], { type: "text/csv" })
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="emi-amount">Loan amount</Label>
          <Input
            id="emi-amount"
            name="amount"
            type="number"
            min={0}
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            className="mt-1.5"
          />
        </div>

        <div>
          <Label htmlFor="emi-rate">Annual interest rate (%)</Label>
          <Input
            id="emi-rate"
            name="rate"
            type="number"
            min={0}
            step={0.05}
            value={rate}
            onChange={(event) => setRate(event.target.value)}
            className="mt-1.5"
          />
        </div>

        <div>
          <Label htmlFor="emi-term">Term</Label>
          <div className="mt-1.5 flex gap-2">
            <Input
              id="emi-term"
              name="term"
              type="number"
              min={1}
              value={term}
              onChange={(event) => setTerm(event.target.value)}
            />
            <Select
              value={termUnit}
              onValueChange={(next) => next && setTermUnit(next as string)}
            >
              <SelectTrigger id="emi-term-unit" aria-label="Term unit">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TERM_UNITS.map((unit) => (
                  <SelectItem key={unit.value} value={unit.value}>
                    {unit.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="emi-currency">Currency</Label>
          <Select
            value={currency}
            onValueChange={(next) => next && setCurrency(next as string)}
          >
            <SelectTrigger id="emi-currency" className="mt-1.5 w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CURRENCIES.map((code) => (
                <SelectItem key={code} value={code}>
                  {code}
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

      {schedule && (
        <>
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { label: "Monthly instalment", value: money(schedule.monthlyPayment) },
              { label: "Total interest", value: money(schedule.totalInterest) },
              { label: "Total repayment", value: money(schedule.totalPaid) },
            ].map((stat) => (
              <div
                key={stat.label}
                className="border-border/60 rounded-lg border p-4 text-center"
              >
                <p className="text-2xl font-semibold tabular-nums">{stat.value}</p>
                <p className="text-muted-foreground mt-1 text-xs">{stat.label}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            <CopyButton value={summary} label="Copy summary" />
            <DownloadButton
              getBlob={scheduleCsv}
              filename="amortisation-schedule.csv"
              label="Download schedule"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <caption className="sr-only">
                Amortisation summary by year: interest paid, principal repaid, and
                remaining balance
              </caption>
              <thead>
                <tr className="border-border/60 border-b text-left">
                  <th scope="col" className="py-2 pr-4 font-medium">
                    Year
                  </th>
                  <th scope="col" className="py-2 pr-4 text-right font-medium">
                    Interest
                  </th>
                  <th scope="col" className="py-2 pr-4 text-right font-medium">
                    Principal
                  </th>
                  <th scope="col" className="py-2 text-right font-medium">
                    Balance
                  </th>
                </tr>
              </thead>
              <tbody>
                {years.map((row) => (
                  <tr key={row.year} className="border-border/40 border-b last:border-0">
                    <td className="py-2 pr-4 tabular-nums">{row.year}</td>
                    <td className="py-2 pr-4 text-right tabular-nums">
                      {money(row.interest)}
                    </td>
                    <td className="py-2 pr-4 text-right tabular-nums">
                      {money(row.principal)}
                    </td>
                    <td className="py-2 text-right tabular-nums">{money(row.balance)}</td>
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
