import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

function dateDiff(earlier: Date, later: Date) {
  let years = later.getFullYear() - earlier.getFullYear()
  let months = later.getMonth() - earlier.getMonth()
  let days = later.getDate() - earlier.getDate()

  if (days < 0) {
    months -= 1
    days += new Date(later.getFullYear(), later.getMonth(), 0).getDate()
  }
  if (months < 0) {
    years -= 1
    months += 12
  }

  const totalDays = Math.round((later.getTime() - earlier.getTime()) / 86_400_000)

  return { years, months, days, totalDays, totalWeeks: Math.floor(totalDays / 7) }
}

export default function DateDifferenceCalculator() {
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")

  const start = startDate ? new Date(startDate + "T00:00:00") : null
  const end = endDate ? new Date(endDate + "T00:00:00") : null
  const valid =
    start && end && !Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime())

  const result = valid
    ? dateDiff(
        start.getTime() <= end.getTime() ? start : end,
        start.getTime() <= end.getTime() ? end : start,
      )
    : null

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="date-diff-start">Start date</Label>
          <Input
            id="date-diff-start"
            name="startDate"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="mt-1.5"
          />
        </div>
        <div>
          <Label htmlFor="date-diff-end">End date</Label>
          <Input
            id="date-diff-end"
            name="endDate"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="mt-1.5"
          />
        </div>
      </div>

      {result && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="border-border/60 rounded-lg border p-4 text-center">
              <p className="text-2xl font-semibold tabular-nums">{result.years}</p>
              <p className="text-muted-foreground mt-1 text-xs">Years</p>
            </div>
            <div className="border-border/60 rounded-lg border p-4 text-center">
              <p className="text-2xl font-semibold tabular-nums">{result.months}</p>
              <p className="text-muted-foreground mt-1 text-xs">Months</p>
            </div>
            <div className="border-border/60 rounded-lg border p-4 text-center">
              <p className="text-2xl font-semibold tabular-nums">{result.days}</p>
              <p className="text-muted-foreground mt-1 text-xs">Days</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="border-border/60 rounded-lg border p-3 text-center">
              <p className="text-lg font-semibold tabular-nums">
                {result.totalDays.toLocaleString()}
              </p>
              <p className="text-muted-foreground mt-1 text-xs">Total days</p>
            </div>
            <div className="border-border/60 rounded-lg border p-3 text-center">
              <p className="text-lg font-semibold tabular-nums">
                {result.totalWeeks.toLocaleString()}
              </p>
              <p className="text-muted-foreground mt-1 text-xs">Total weeks</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
