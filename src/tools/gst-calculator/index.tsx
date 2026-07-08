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

export default function GstCalculator() {
  const [addAmount, setAddAmount] = useState("1000")
  const [addRate, setAddRate] = useState("18")

  const [removeTotal, setRemoveTotal] = useState("1180")
  const [removeRate, setRemoveRate] = useState("18")

  const gstToAdd = (Number(addAmount) * Number(addRate)) / 100
  const totalWithGst = Number(addAmount) + gstToAdd

  const baseAmount = Number(removeTotal) / (1 + Number(removeRate) / 100)
  const gstInTotal = Number(removeTotal) - baseAmount

  return (
    <Tabs defaultValue="add">
      <TabsList>
        <TabsTrigger value="add">Add GST</TabsTrigger>
        <TabsTrigger value="remove">Remove GST</TabsTrigger>
      </TabsList>

      <TabsContent value="add" className="mt-4 space-y-4">
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <Label htmlFor="gst-add-amount">Amount</Label>
            <Input
              id="gst-add-amount"
              name="amount"
              type="number"
              value={addAmount}
              onChange={(e) => setAddAmount(e.target.value)}
              className="mt-1.5 w-36"
            />
          </div>
          <div>
            <Label htmlFor="gst-add-rate">GST rate (%)</Label>
            <Input
              id="gst-add-rate"
              name="rate"
              type="number"
              value={addRate}
              onChange={(e) => setAddRate(e.target.value)}
              className="mt-1.5 w-28"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <ResultCard
            label="GST amount"
            value={Number.isFinite(gstToAdd) ? gstToAdd.toFixed(2) : "-"}
          />
          <ResultCard
            label="Total with GST"
            value={Number.isFinite(totalWithGst) ? totalWithGst.toFixed(2) : "-"}
          />
        </div>
      </TabsContent>

      <TabsContent value="remove" className="mt-4 space-y-4">
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <Label htmlFor="gst-remove-total">GST-inclusive total</Label>
            <Input
              id="gst-remove-total"
              name="total"
              type="number"
              value={removeTotal}
              onChange={(e) => setRemoveTotal(e.target.value)}
              className="mt-1.5 w-36"
            />
          </div>
          <div>
            <Label htmlFor="gst-remove-rate">GST rate (%)</Label>
            <Input
              id="gst-remove-rate"
              name="rate"
              type="number"
              value={removeRate}
              onChange={(e) => setRemoveRate(e.target.value)}
              className="mt-1.5 w-28"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <ResultCard
            label="Base amount"
            value={Number.isFinite(baseAmount) ? baseAmount.toFixed(2) : "-"}
          />
          <ResultCard
            label="GST amount"
            value={Number.isFinite(gstInTotal) ? gstInTotal.toFixed(2) : "-"}
          />
        </div>
      </TabsContent>
    </Tabs>
  )
}
