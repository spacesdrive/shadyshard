import { useMemo, useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { UnofficialToolNotice } from "@/components/tool/UnofficialToolNotice"
import { TERMS_PER_YEAR } from "@/lib/iitm-bs"

export default function IitmBsGraduationEstimator() {
  const [completed, setCompleted] = useState("60")
  const [target, setTarget] = useState("142")
  const [creditsPerTerm, setCreditsPerTerm] = useState("12")

  const result = useMemo(() => {
    const completedNum = Number(completed)
    const targetNum = Number(target)
    const pace = Number(creditsPerTerm)

    if (![completedNum, targetNum, pace].every(Number.isFinite) || pace <= 0) return null

    const remaining = Math.max(targetNum - completedNum, 0)
    const terms = Math.ceil(remaining / pace)
    const years = terms / TERMS_PER_YEAR

    return { remaining, terms, years }
  }, [completed, target, creditsPerTerm])

  return (
    <div className="space-y-5">
      <UnofficialToolNotice />

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <Label htmlFor="grad-completed">Credits completed</Label>
          <Input
            id="grad-completed"
            name="completed"
            type="number"
            min="0"
            step="1"
            value={completed}
            onChange={(e) => setCompleted(e.target.value)}
            className="mt-1.5"
          />
        </div>
        <div>
          <Label htmlFor="grad-target">Credit target</Label>
          <Input
            id="grad-target"
            name="target"
            type="number"
            min="0"
            step="1"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            className="mt-1.5"
          />
        </div>
        <div>
          <Label htmlFor="grad-pace">Credits per term (planned)</Label>
          <Input
            id="grad-pace"
            name="creditsPerTerm"
            type="number"
            min="1"
            step="1"
            value={creditsPerTerm}
            onChange={(e) => setCreditsPerTerm(e.target.value)}
            className="mt-1.5"
          />
        </div>
      </div>

      {result && (
        <div className="grid grid-cols-3 gap-3">
          <div className="border-border/60 rounded-lg border p-4 text-center">
            <p className="text-2xl font-semibold tabular-nums">{result.remaining}</p>
            <p className="text-muted-foreground mt-1 text-xs">Credits remaining</p>
          </div>
          <div className="border-border/60 rounded-lg border p-4 text-center">
            <p className="text-2xl font-semibold tabular-nums">
              {result.remaining === 0 ? 0 : result.terms}
            </p>
            <p className="text-muted-foreground mt-1 text-xs">Terms remaining</p>
          </div>
          <div className="border-border/60 rounded-lg border p-4 text-center">
            <p className="text-2xl font-semibold tabular-nums">
              {result.remaining === 0 ? "0" : result.years.toFixed(1)}
            </p>
            <p className="text-muted-foreground mt-1 text-xs">~Years remaining</p>
          </div>
        </div>
      )}

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => {
          setCompleted("60")
          setTarget("142")
          setCreditsPerTerm("12")
        }}
      >
        Reset
      </Button>
    </div>
  )
}
