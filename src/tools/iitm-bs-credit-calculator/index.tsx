import { useMemo } from "react"
import { Plus, Trash2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { UnofficialToolNotice } from "@/components/tool/UnofficialToolNotice"
import { useLocalStorageState } from "@/hooks/use-local-storage-state"

interface CreditEntry {
  id: string
  name: string
  credits: string
}

function newEntry(name = "", credits = "4"): CreditEntry {
  return { id: crypto.randomUUID(), name, credits }
}

const DEFAULT_ENTRIES: CreditEntry[] = [
  newEntry("Mathematics for Data Science I", "4"),
  newEntry("Statistics for Data Science I", "4"),
]

export default function IitmBsCreditCalculator() {
  const [entries, setEntries] = useLocalStorageState<CreditEntry[]>(
    "shadyshard-iitm-credit-entries",
    DEFAULT_ENTRIES,
  )
  const [target, setTarget] = useLocalStorageState("shadyshard-iitm-credit-target", "32")

  function updateEntry(id: string, patch: Partial<CreditEntry>) {
    setEntries(entries.map((e) => (e.id === id ? { ...e, ...patch } : e)))
  }

  function removeEntry(id: string) {
    setEntries(entries.filter((e) => e.id !== id))
  }

  const total = useMemo(
    () => entries.reduce((sum, e) => sum + (Number(e.credits) || 0), 0),
    [entries],
  )
  const targetNumber = Number(target) || 0
  const remaining = Math.max(targetNumber - total, 0)
  const percent = targetNumber > 0 ? Math.min((total / targetNumber) * 100, 100) : 0

  return (
    <div className="space-y-5">
      <UnofficialToolNotice />

      <div className="w-40">
        <Label htmlFor="credit-target">Credit target</Label>
        <Input
          id="credit-target"
          name="creditTarget"
          type="number"
          min="0"
          step="1"
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          className="mt-1.5"
        />
      </div>

      <div className="space-y-3">
        {entries.map((entry, index) => (
          <div key={entry.id} className="flex flex-wrap items-end gap-2">
            <div className="min-w-40 flex-1">
              <Label
                htmlFor={`credit-name-${entry.id}`}
                className={index === 0 ? undefined : "sr-only"}
              >
                Course name
              </Label>
              <Input
                id={`credit-name-${entry.id}`}
                name={`entry-name-${index}`}
                value={entry.name}
                onChange={(e) => updateEntry(entry.id, { name: e.target.value })}
                placeholder="Course name"
                className="mt-1.5"
              />
            </div>
            <div className="w-24">
              <Label
                htmlFor={`credit-value-${entry.id}`}
                className={index === 0 ? undefined : "sr-only"}
              >
                Credits
              </Label>
              <Input
                id={`credit-value-${entry.id}`}
                name={`entry-credits-${index}`}
                type="number"
                min="0"
                step="0.5"
                value={entry.credits}
                onChange={(e) => updateEntry(entry.id, { credits: e.target.value })}
                className="mt-1.5"
              />
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label={`Remove ${entry.name || "entry"}`}
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

      <div className="space-y-2">
        <div className="bg-muted h-2 w-full overflow-hidden rounded-full">
          <div
            className="bg-primary h-full rounded-full transition-all"
            style={{ width: `${percent}%` }}
          />
        </div>
        <div className="grid grid-cols-3 gap-3 text-center">
          <div>
            <p className="text-2xl font-semibold tabular-nums">{total}</p>
            <p className="text-muted-foreground mt-1 text-xs">Credits earned</p>
          </div>
          <div>
            <p className="text-2xl font-semibold tabular-nums">{remaining}</p>
            <p className="text-muted-foreground mt-1 text-xs">Credits remaining</p>
          </div>
          <div>
            <p className="text-2xl font-semibold tabular-nums">{percent.toFixed(0)}%</p>
            <p className="text-muted-foreground mt-1 text-xs">Of target</p>
          </div>
        </div>
      </div>

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => {
          setEntries(DEFAULT_ENTRIES)
          setTarget("32")
        }}
      >
        Reset
      </Button>
    </div>
  )
}
