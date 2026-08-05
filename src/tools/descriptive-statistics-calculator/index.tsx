import { useMemo, useState } from "react"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { CopyButton } from "@/components/tool/CopyButton"

interface ParsedInput {
  values: number[]
  unreadable: string[]
}

function parseNumbers(text: string): ParsedInput {
  const tokens = text.split(/[\s,;|]+/).filter(Boolean)
  const values: number[] = []
  const unreadable: string[] = []
  for (const token of tokens) {
    const parsed = Number(token)
    if (Number.isFinite(parsed)) values.push(parsed)
    else if (!unreadable.includes(token)) unreadable.push(token)
  }
  return { values, unreadable }
}

/** Linear interpolation between closest ranks, matching Excel's QUARTILE.INC. */
function quantile(sorted: number[], fraction: number): number {
  if (sorted.length === 1) return sorted[0]
  const position = (sorted.length - 1) * fraction
  const lower = Math.floor(position)
  const upper = Math.ceil(position)
  if (lower === upper) return sorted[lower]
  return sorted[lower] + (sorted[upper] - sorted[lower]) * (position - lower)
}

function formatNumber(value: number): string {
  if (!Number.isFinite(value)) return "n/a"
  if (Number.isInteger(value)) return value.toLocaleString("en-US")
  return value.toLocaleString("en-US", { maximumFractionDigits: 6 })
}

interface Summary {
  label: string
  value: string
  hint?: string
}

function buildSummaries(values: number[]): Summary[] {
  const sorted = [...values].sort((a, b) => a - b)
  const count = sorted.length
  const sum = sorted.reduce((total, value) => total + value, 0)
  const mean = sum / count
  const median = quantile(sorted, 0.5)

  const frequencies = new Map<number, number>()
  for (const value of sorted) frequencies.set(value, (frequencies.get(value) ?? 0) + 1)
  const highestFrequency = Math.max(...frequencies.values())
  const modes =
    highestFrequency === 1
      ? []
      : [...frequencies.entries()]
          .filter(([, frequency]) => frequency === highestFrequency)
          .map(([value]) => value)

  const squaredDeviations = sorted.reduce(
    (total, value) => total + (value - mean) ** 2,
    0,
  )
  const populationVariance = squaredDeviations / count
  const sampleVariance = count > 1 ? squaredDeviations / (count - 1) : NaN
  const populationDeviation = Math.sqrt(populationVariance)
  const sampleDeviation = Math.sqrt(sampleVariance)

  const q1 = quantile(sorted, 0.25)
  const q3 = quantile(sorted, 0.75)
  const iqr = q3 - q1
  const lowerFence = q1 - 1.5 * iqr
  const upperFence = q3 + 1.5 * iqr
  const outliers = sorted.filter((value) => value < lowerFence || value > upperFence)

  return [
    { label: "Count", value: formatNumber(count) },
    { label: "Sum", value: formatNumber(sum) },
    { label: "Mean", value: formatNumber(mean) },
    { label: "Median", value: formatNumber(median) },
    {
      label: "Mode",
      value: modes.length ? modes.map(formatNumber).join(", ") : "no repeated value",
      hint: modes.length > 1 ? "Several values share the highest frequency." : undefined,
    },
    { label: "Minimum", value: formatNumber(sorted[0]) },
    { label: "Maximum", value: formatNumber(sorted[count - 1]) },
    { label: "Range", value: formatNumber(sorted[count - 1] - sorted[0]) },
    {
      label: "Sample standard deviation",
      value: count > 1 ? formatNumber(sampleDeviation) : "needs at least 2 values",
    },
    {
      label: "Population standard deviation",
      value: formatNumber(populationDeviation),
    },
    {
      label: "Sample variance",
      value: count > 1 ? formatNumber(sampleVariance) : "needs at least 2 values",
    },
    { label: "Population variance", value: formatNumber(populationVariance) },
    {
      label: "Standard error of the mean",
      value: count > 1 ? formatNumber(sampleDeviation / Math.sqrt(count)) : "n/a",
    },
    {
      label: "Coefficient of variation",
      value:
        mean === 0
          ? "n/a"
          : `${formatNumber((populationDeviation / Math.abs(mean)) * 100)}%`,
    },
    { label: "First quartile (Q1)", value: formatNumber(q1) },
    { label: "Third quartile (Q3)", value: formatNumber(q3) },
    { label: "Interquartile range", value: formatNumber(iqr) },
    {
      label: "Outlier fences",
      value: `${formatNumber(lowerFence)} to ${formatNumber(upperFence)}`,
    },
    {
      label: "Outliers",
      value: outliers.length ? outliers.map(formatNumber).join(", ") : "none",
    },
  ]
}

export default function DescriptiveStatisticsCalculator() {
  const [text, setText] = useState("")

  const { values, unreadable } = useMemo(() => parseNumbers(text), [text])
  const summaries = useMemo(
    () => (values.length > 0 ? buildSummaries(values) : []),
    [values],
  )

  const plainText = useMemo(
    () => summaries.map((entry) => `${entry.label}: ${entry.value}`).join("\n"),
    [summaries],
  )

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="statistics-input">Numbers</Label>
        <Textarea
          id="statistics-input"
          name="numbers"
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="12, 15, 18, 22, 22, 29, 31, 44"
          className="mt-1.5 min-h-40 resize-y font-mono text-sm"
          spellCheck={false}
        />
        <p className="text-muted-foreground mt-1 text-xs">
          Separate values with commas, spaces, semicolons, or line breaks. Pasting a
          spreadsheet column works as is.
        </p>
      </div>

      {unreadable.length > 0 && (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-700 dark:text-amber-400">
          Ignored {unreadable.length} value{unreadable.length === 1 ? "" : "s"} that could
          not be read as a number: {unreadable.slice(0, 10).join(", ")}
          {unreadable.length > 10 ? ", and more" : ""}.
        </div>
      )}

      {values.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          Enter at least one number to see the summary.
        </p>
      ) : (
        <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {summaries.map((entry) => (
            <div key={entry.label} className="border-border/60 rounded-lg border p-3">
              <dt className="text-muted-foreground text-xs">{entry.label}</dt>
              <dd className="mt-1 font-medium break-words tabular-nums">{entry.value}</dd>
              {entry.hint && (
                <p className="text-muted-foreground mt-1 text-xs">{entry.hint}</p>
              )}
            </div>
          ))}
        </dl>
      )}

      <div className="flex flex-wrap gap-2">
        <CopyButton value={plainText} label="Copy summary" />
        <Button type="button" variant="outline" size="sm" onClick={() => setText("")}>
          Reset
        </Button>
      </div>
    </div>
  )
}
