import { useMemo } from "react"
import { Plus, Trash2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { UnofficialToolNotice } from "@/components/tool/UnofficialToolNotice"
import { useLocalStorageState } from "@/hooks/use-local-storage-state"

interface PlanEntry {
  id: string
  name: string
  credits: string
  term: string
}

function newEntry(name = "", credits = "4", term = "Jan 2027"): PlanEntry {
  return { id: crypto.randomUUID(), name, credits, term }
}

const DEFAULT_ENTRIES: PlanEntry[] = [
  newEntry("Machine Learning Techniques", "4", "Jan 2027"),
  newEntry("Machine Learning Practice", "4", "Jan 2027"),
  newEntry("Business Data Management", "4", "May 2027"),
]

export default function IitmBsSemesterPlanner() {
  const [entries, setEntries] = useLocalStorageState<PlanEntry[]>(
    "shadyshard-iitm-semester-plan",
    DEFAULT_ENTRIES,
  )

  function updateEntry(id: string, patch: Partial<PlanEntry>) {
    setEntries(entries.map((e) => (e.id === id ? { ...e, ...patch } : e)))
  }

  function removeEntry(id: string) {
    setEntries(entries.filter((e) => e.id !== id))
  }

  const byTerm = useMemo(() => {
    const groups = new Map<string, PlanEntry[]>()
    for (const entry of entries) {
      const key = entry.term.trim() || "Unassigned"
      groups.set(key, [...(groups.get(key) ?? []), entry])
    }
    return Array.from(groups.entries())
  }, [entries])

  const totalCredits = entries.reduce((sum, e) => sum + (Number(e.credits) || 0), 0)

  return (
    <div className="space-y-5">
      <UnofficialToolNotice />

      <div className="space-y-3">
        {entries.map((entry, index) => (
          <div key={entry.id} className="flex flex-wrap items-end gap-2">
            <div className="min-w-40 flex-1">
              <Label
                htmlFor={`plan-name-${entry.id}`}
                className={index === 0 ? undefined : "sr-only"}
              >
                Course name
              </Label>
              <Input
                id={`plan-name-${entry.id}`}
                name={`plan-name-${index}`}
                value={entry.name}
                onChange={(e) => updateEntry(entry.id, { name: e.target.value })}
                placeholder="Course name"
                className="mt-1.5"
              />
            </div>
            <div className="w-24">
              <Label
                htmlFor={`plan-credits-${entry.id}`}
                className={index === 0 ? undefined : "sr-only"}
              >
                Credits
              </Label>
              <Input
                id={`plan-credits-${entry.id}`}
                name={`plan-credits-${index}`}
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
                htmlFor={`plan-term-${entry.id}`}
                className={index === 0 ? undefined : "sr-only"}
              >
                Term
              </Label>
              <Input
                id={`plan-term-${entry.id}`}
                name={`plan-term-${index}`}
                value={entry.term}
                onChange={(e) => updateEntry(entry.id, { term: e.target.value })}
                placeholder="Jan 2027"
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

      <div className="space-y-3">
        {byTerm.map(([term, courses]) => {
          const termCredits = courses.reduce(
            (sum, c) => sum + (Number(c.credits) || 0),
            0,
          )
          return (
            <div key={term} className="border-border/60 rounded-lg border p-3">
              <div className="flex items-center justify-between">
                <span className="font-medium">{term}</span>
                <span className="text-muted-foreground text-xs">
                  {termCredits} credit{termCredits === 1 ? "" : "s"}
                </span>
              </div>
              <ul className="text-muted-foreground mt-2 space-y-0.5 text-sm">
                {courses.map((c) => (
                  <li key={c.id}>
                    {c.name || "Untitled course"} - {c.credits || 0} credits
                  </li>
                ))}
              </ul>
            </div>
          )
        })}
      </div>

      <p className="text-sm">
        Total planned credits: <span className="font-semibold">{totalCredits}</span>
      </p>

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setEntries(DEFAULT_ENTRIES)}
      >
        Reset
      </Button>
    </div>
  )
}
