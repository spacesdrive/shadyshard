import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

function calculateAge(birth: Date, today: Date) {
  let years = today.getFullYear() - birth.getFullYear()
  let months = today.getMonth() - birth.getMonth()
  let days = today.getDate() - birth.getDate()

  if (days < 0) {
    months -= 1
    days += new Date(today.getFullYear(), today.getMonth(), 0).getDate()
  }
  if (months < 0) {
    years -= 1
    months += 12
  }

  const totalDays = Math.floor((today.getTime() - birth.getTime()) / 86_400_000)

  let nextBirthday = new Date(today.getFullYear(), birth.getMonth(), birth.getDate())
  if (nextBirthday.getTime() < today.getTime()) {
    nextBirthday = new Date(today.getFullYear() + 1, birth.getMonth(), birth.getDate())
  }
  const daysUntilBirthday = Math.round(
    (nextBirthday.getTime() - today.getTime()) / 86_400_000,
  )

  return { years, months, days, totalDays, daysUntilBirthday }
}

export default function AgeCalculator() {
  const [birthDate, setBirthDate] = useState("")

  const parsed = birthDate ? new Date(birthDate + "T00:00:00") : null
  const valid =
    parsed && !Number.isNaN(parsed.getTime()) && parsed.getTime() <= Date.now()
  const result = valid ? calculateAge(parsed, new Date()) : null

  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="age-calculator-birthdate">Date of birth</Label>
        <Input
          id="age-calculator-birthdate"
          name="birthDate"
          type="date"
          value={birthDate}
          max={new Date().toISOString().slice(0, 10)}
          onChange={(e) => setBirthDate(e.target.value)}
          className="mt-1.5"
        />
      </div>

      {birthDate && !valid && (
        <p className="text-destructive text-sm">
          Enter a valid date that isn't in the future.
        </p>
      )}

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
              <p className="text-muted-foreground mt-1 text-xs">Total days lived</p>
            </div>
            <div className="border-border/60 rounded-lg border p-3 text-center">
              <p className="text-lg font-semibold tabular-nums">
                {result.daysUntilBirthday}
              </p>
              <p className="text-muted-foreground mt-1 text-xs">
                Days until next birthday
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
