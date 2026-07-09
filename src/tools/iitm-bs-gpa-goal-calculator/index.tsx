import { useMemo, useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { UnofficialToolNotice } from "@/components/tool/UnofficialToolNotice"
import { DEFAULT_GRADE_SCALE } from "@/lib/iitm-bs"

function nearestGrade(points: number) {
  if (points > 10) return null
  return (
    DEFAULT_GRADE_SCALE.filter((g) => g.points >= points).sort(
      (a, b) => a.points - b.points,
    )[0] ?? DEFAULT_GRADE_SCALE[DEFAULT_GRADE_SCALE.length - 1]
  )
}

export default function IitmBsGpaGoalCalculator() {
  const [currentCgpa, setCurrentCgpa] = useState("8.0")
  const [completedCredits, setCompletedCredits] = useState("40")
  const [targetCgpa, setTargetCgpa] = useState("8.5")
  const [remainingCredits, setRemainingCredits] = useState("20")

  const result = useMemo(() => {
    const current = Number(currentCgpa)
    const completed = Number(completedCredits)
    const target = Number(targetCgpa)
    const remaining = Number(remainingCredits)

    if (
      ![current, completed, target, remaining].every(Number.isFinite) ||
      completed < 0 ||
      remaining <= 0
    ) {
      return null
    }

    const requiredPoints =
      (target * (completed + remaining) - current * completed) / remaining

    return { requiredPoints, current, completed, target, remaining }
  }, [currentCgpa, completedCredits, targetCgpa, remainingCredits])

  const grade = result ? nearestGrade(result.requiredPoints) : null

  return (
    <div className="space-y-5">
      <UnofficialToolNotice />

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="goal-current-cgpa">Current CGPA</Label>
          <Input
            id="goal-current-cgpa"
            name="currentCgpa"
            type="number"
            min="0"
            max="10"
            step="0.01"
            value={currentCgpa}
            onChange={(e) => setCurrentCgpa(e.target.value)}
            className="mt-1.5"
          />
        </div>
        <div>
          <Label htmlFor="goal-completed-credits">Credits completed</Label>
          <Input
            id="goal-completed-credits"
            name="completedCredits"
            type="number"
            min="0"
            step="1"
            value={completedCredits}
            onChange={(e) => setCompletedCredits(e.target.value)}
            className="mt-1.5"
          />
        </div>
        <div>
          <Label htmlFor="goal-target-cgpa">Target CGPA</Label>
          <Input
            id="goal-target-cgpa"
            name="targetCgpa"
            type="number"
            min="0"
            max="10"
            step="0.01"
            value={targetCgpa}
            onChange={(e) => setTargetCgpa(e.target.value)}
            className="mt-1.5"
          />
        </div>
        <div>
          <Label htmlFor="goal-remaining-credits">Remaining credits planned</Label>
          <Input
            id="goal-remaining-credits"
            name="remainingCredits"
            type="number"
            min="1"
            step="1"
            value={remainingCredits}
            onChange={(e) => setRemainingCredits(e.target.value)}
            className="mt-1.5"
          />
        </div>
      </div>

      {result && (
        <div className="border-border/60 rounded-lg border p-4">
          {result.requiredPoints <= 0 ? (
            <p className="text-sm">
              Your target CGPA is already secured even with the lowest possible grades in
              your remaining credits.
            </p>
          ) : result.requiredPoints > 10 ? (
            <p className="text-destructive text-sm">
              This target is not reachable with {result.remaining} remaining credits - it
              would require an average grade point of {result.requiredPoints.toFixed(2)},
              above the maximum of 10. Add more credits or lower your target CGPA.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <div className="text-center">
                <p className="text-2xl font-semibold tabular-nums">
                  {result.requiredPoints.toFixed(2)}
                </p>
                <p className="text-muted-foreground mt-1 text-xs">
                  Required average grade points
                </p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-semibold tabular-nums">
                  {grade ? grade.letter : "-"}
                </p>
                <p className="text-muted-foreground mt-1 text-xs">
                  Nearest achievable grade average
                </p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-semibold tabular-nums">
                  {result.completed + result.remaining}
                </p>
                <p className="text-muted-foreground mt-1 text-xs">
                  Total credits at target
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => {
          setCurrentCgpa("8.0")
          setCompletedCredits("40")
          setTargetCgpa("8.5")
          setRemainingCredits("20")
        }}
      >
        Reset
      </Button>
    </div>
  )
}
