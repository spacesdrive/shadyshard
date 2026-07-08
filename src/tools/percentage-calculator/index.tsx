import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

function ResultCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-border/60 rounded-lg border p-4 text-center">
      <p className="text-2xl font-semibold tabular-nums">{value}</p>
      <p className="text-muted-foreground mt-1 text-xs">{label}</p>
    </div>
  )
}

export default function PercentageCalculator() {
  const [percent, setPercent] = useState("20")
  const [ofValue, setOfValue] = useState("150")

  const [partValue, setPartValue] = useState("30")
  const [wholeValue, setWholeValue] = useState("150")

  const [fromValue, setFromValue] = useState("100")
  const [toValue, setToValue] = useState("125")

  const percentOfResult = (Number(percent) / 100) * Number(ofValue)
  const partOfWholeResult =
    Number(wholeValue) !== 0 ? (Number(partValue) / Number(wholeValue)) * 100 : null
  const changeResult =
    Number(fromValue) !== 0
      ? ((Number(toValue) - Number(fromValue)) / Number(fromValue)) * 100
      : null

  return (
    <Tabs defaultValue="percent-of">
      <TabsList>
        <TabsTrigger value="percent-of">% of a number</TabsTrigger>
        <TabsTrigger value="what-percent">What % is X of Y</TabsTrigger>
        <TabsTrigger value="change">% change</TabsTrigger>
      </TabsList>

      <TabsContent value="percent-of" className="mt-4 space-y-4">
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <Label htmlFor="pct-percent">Percent</Label>
            <Input
              id="pct-percent"
              name="percent"
              type="number"
              value={percent}
              onChange={(e) => setPercent(e.target.value)}
              className="mt-1.5 w-32"
            />
          </div>
          <span className="text-muted-foreground mb-2 text-sm">% of</span>
          <div>
            <Label htmlFor="pct-of">Value</Label>
            <Input
              id="pct-of"
              name="ofValue"
              type="number"
              value={ofValue}
              onChange={(e) => setOfValue(e.target.value)}
              className="mt-1.5 w-32"
            />
          </div>
        </div>
        <ResultCard
          label={`${percent || 0}% of ${ofValue || 0}`}
          value={
            Number.isFinite(percentOfResult) ? percentOfResult.toLocaleString() : "-"
          }
        />
      </TabsContent>

      <TabsContent value="what-percent" className="mt-4 space-y-4">
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <Label htmlFor="pct-part">X</Label>
            <Input
              id="pct-part"
              name="partValue"
              type="number"
              value={partValue}
              onChange={(e) => setPartValue(e.target.value)}
              className="mt-1.5 w-32"
            />
          </div>
          <span className="text-muted-foreground mb-2 text-sm">is what % of</span>
          <div>
            <Label htmlFor="pct-whole">Y</Label>
            <Input
              id="pct-whole"
              name="wholeValue"
              type="number"
              value={wholeValue}
              onChange={(e) => setWholeValue(e.target.value)}
              className="mt-1.5 w-32"
            />
          </div>
        </div>
        <ResultCard
          label={`${partValue || 0} as a percent of ${wholeValue || 0}`}
          value={
            partOfWholeResult !== null
              ? `${partOfWholeResult.toFixed(2)}%`
              : "Not calculable"
          }
        />
      </TabsContent>

      <TabsContent value="change" className="mt-4 space-y-4">
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <Label htmlFor="pct-from">From</Label>
            <Input
              id="pct-from"
              name="fromValue"
              type="number"
              value={fromValue}
              onChange={(e) => setFromValue(e.target.value)}
              className="mt-1.5 w-32"
            />
          </div>
          <div>
            <Label htmlFor="pct-to">To</Label>
            <Input
              id="pct-to"
              name="toValue"
              type="number"
              value={toValue}
              onChange={(e) => setToValue(e.target.value)}
              className="mt-1.5 w-32"
            />
          </div>
        </div>
        <ResultCard
          label={
            changeResult !== null && changeResult >= 0
              ? "Percentage increase"
              : "Percentage decrease"
          }
          value={
            changeResult !== null
              ? `${Math.abs(changeResult).toFixed(2)}%`
              : "Not calculable"
          }
        />
      </TabsContent>
    </Tabs>
  )
}
