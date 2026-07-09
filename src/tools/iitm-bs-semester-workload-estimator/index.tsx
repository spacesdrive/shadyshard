import { useMemo } from "react"
import { Plus, Trash2, AlertTriangle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { UnofficialToolNotice } from "@/components/tool/UnofficialToolNotice"
import { useLocalStorageState } from "@/hooks/use-local-storage-state"

interface WorkloadEntry {
  id: string
  name: string
  credits: string
  hoursPerCredit: string
}

function newEntry(name = "", credits = "4", hoursPerCredit = "3"): WorkloadEntry {
  return { id: crypto.randomUUID(), name, credits, hoursPerCredit }
}

const DEFAULT_ENTRIES: WorkloadEntry[] = [
  newEntry("Machine Learning Techniques", "4", "4"),
  newEntry("Machine Learning Practice", "4", "3"),
  newEntry("Business Data Management", "4", "2.5"),
]

export default function IitmBsSemesterWorkloadEstimator() {
  const [entries, setEntries] = useLocalStorageState<WorkloadEntry[]>(
    "shadyshard-iitm-workload-entries",
    DEFAULT_ENTRIES,
  )
  const [budget, setBudget] = useLocalStorageState(
    "shadyshard-iitm-workload-budget",
    "35",
  )

  function updateEntry(id: string, patch: Partial<WorkloadEntry>) {
    setEntries(entries.map((e) => (e.id === id ? { ...e, ...patch } : e)))
  }

  function removeEntry(id: string) {
    setEntries(entries.filter((e) => e.id !== id))
  }

  const totalHours = useMemo(
    () =>
      entries.reduce(
        (sum, e) => sum + (Number(e.credits) || 0) * (Number(e.hoursPerCredit) || 0),
        0,
      ),
    [entries],
  )
  const budgetNumber = Number(budget) || 0
  const overloaded = budgetNumber > 0 && totalHours > budgetNumber

  return (
    <div className="space-y-5">
      <UnofficialToolNotice />

      <div className="w-40">
        <Label htmlFor="workload-budget">Weekly hours budget</Label>
        <Input
          id="workload-budget"
          name="budget"
          type="number"
          min="0"
          step="1"
          value={budget}
          onChange={(e) => setBudget(e.target.value)}
          className="mt-1.5"
        />
      </div>

      <div className="space-y-3">
        {entries.map((entry, index) => (
          <div key={entry.id} className="flex flex-wrap items-end gap-2">
            <div className="min-w-40 flex-1">
              <Label
                htmlFor={`workload-name-${entry.id}`}
                className={index === 0 ? undefined : "sr-only"}
              >
                Course name
              </Label>
              <Input
                id={`workload-name-${entry.id}`}
                name={`workload-name-${index}`}
                value={entry.name}
                onChange={(e) => updateEntry(entry.id, { name: e.target.value })}
                placeholder="Course name"
                className="mt-1.5"
              />
            </div>
            <div className="w-24">
              <Label
                htmlFor={`workload-credits-${entry.id}`}
                className={index === 0 ? undefined : "sr-only"}
              >
                Credits
              </Label>
              <Input
                id={`workload-credits-${entry.id}`}
                name={`workload-credits-${index}`}
                type="number"
                min="0"
                step="0.5"
                value={entry.credits}
                onChange={(e) => updateEntry(entry.id, { credits: e.target.value })}
                className="mt-1.5"
              />
            </div>
            <div className="w-32">
              <Label
                htmlFor={`workload-hpc-${entry.id}`}
                className={index === 0 ? undefined : "sr-only"}
              >
                Hours/credit
              </Label>
              <Input
                id={`workload-hpc-${entry.id}`}
                name={`workload-hpc-${index}`}
                type="number"
                min="0"
                step="0.5"
                value={entry.hoursPerCredit}
                onChange={(e) =>
                  updateEntry(entry.id, { hoursPerCredit: e.target.value })
                }
                className="mt-1.5"
              />
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label={`Remove ${entry.name || "course"}`}
              onClick={() => removeEntry(entry.id)}
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        ))}

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setEntries([...entries, newEntry()])}
        >
          <Plus className="size-4" />
          Add course
        </Button>
      </div>

      <div className="border-border/60 rounded-lg border p-4 text-center">
        <p className="text-2xl font-semibold tabular-nums">{totalHours.toFixed(1)}</p>
        <p className="text-muted-foreground mt-1 text-xs">Estimated hours per week</p>
      </div>

      {overloaded && (
        <div className="border-destructive/30 bg-destructive/10 text-destructive flex items-start gap-2 rounded-lg border p-3 text-sm">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" />
          <span>
            Estimated workload ({totalHours.toFixed(1)} hrs/week) exceeds your budget of{" "}
            {budgetNumber} hrs/week. Consider dropping a course or spreading credits
            across more terms.
          </span>
        </div>
      )}

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => {
          setEntries(DEFAULT_ENTRIES)
          setBudget("35")
        }}
      >
        Reset
      </Button>
    </div>
  )
}
