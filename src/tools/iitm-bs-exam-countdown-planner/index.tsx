import { useMemo } from "react"
import { Plus, Trash2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { UnofficialToolNotice } from "@/components/tool/UnofficialToolNotice"
import { useLocalStorageState } from "@/hooks/use-local-storage-state"

interface ExamEntry {
  id: string
  course: string
  date: string
}

function newEntry(course = "", date = ""): ExamEntry {
  return { id: crypto.randomUUID(), course, date }
}

const DEFAULT_ENTRIES: ExamEntry[] = [newEntry("", "")]

function daysUntil(dateStr: string): number | null {
  if (!dateStr) return null
  const target = new Date(dateStr + "T00:00:00")
  if (Number.isNaN(target.getTime())) return null
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

export default function IitmBsExamCountdownPlanner() {
  const [entries, setEntries] = useLocalStorageState<ExamEntry[]>(
    "shadyshard-iitm-exam-countdown",
    DEFAULT_ENTRIES,
  )

  function updateEntry(id: string, patch: Partial<ExamEntry>) {
    setEntries(entries.map((e) => (e.id === id ? { ...e, ...patch } : e)))
  }

  function removeEntry(id: string) {
    setEntries(entries.filter((e) => e.id !== id))
  }

  const sorted = useMemo(() => {
    return [...entries].sort((a, b) => {
      const da = daysUntil(a.date)
      const db = daysUntil(b.date)
      if (da === null) return 1
      if (db === null) return -1
      return da - db
    })
  }, [entries])

  return (
    <div className="space-y-5">
      <UnofficialToolNotice />

      <div className="space-y-3">
        {entries.map((entry, index) => (
          <div key={entry.id} className="flex flex-wrap items-end gap-2">
            <div className="min-w-40 flex-1">
              <Label
                htmlFor={`exam-course-${entry.id}`}
                className={index === 0 ? undefined : "sr-only"}
              >
                Course or exam name
              </Label>
              <Input
                id={`exam-course-${entry.id}`}
                name={`exam-course-${index}`}
                value={entry.course}
                onChange={(e) => updateEntry(entry.id, { course: e.target.value })}
                placeholder="Course or exam name"
                className="mt-1.5"
              />
            </div>
            <div className="w-44">
              <Label
                htmlFor={`exam-date-${entry.id}`}
                className={index === 0 ? undefined : "sr-only"}
              >
                Exam date
              </Label>
              <Input
                id={`exam-date-${entry.id}`}
                name={`exam-date-${index}`}
                type="date"
                value={entry.date}
                onChange={(e) => updateEntry(entry.id, { date: e.target.value })}
                className="mt-1.5"
              />
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label={`Remove ${entry.course || "exam"}`}
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
          Add exam
        </Button>
      </div>

      <ul className="space-y-2">
        {sorted
          .filter((e) => e.course || e.date)
          .map((entry) => {
            const days = daysUntil(entry.date)
            const isPast = days !== null && days < 0
            return (
              <li
                key={entry.id}
                className="border-border/60 flex items-center justify-between rounded-lg border p-3 text-sm"
              >
                <span
                  className={isPast ? "text-muted-foreground line-through" : undefined}
                >
                  {entry.course || "Untitled"}
                </span>
                <span
                  className={
                    isPast
                      ? "text-muted-foreground text-xs"
                      : days !== null && days <= 3
                        ? "text-destructive text-xs font-medium"
                        : "text-xs font-medium"
                  }
                >
                  {days === null
                    ? "No date set"
                    : isPast
                      ? `Passed ${Math.abs(days)} day${Math.abs(days) === 1 ? "" : "s"} ago`
                      : days === 0
                        ? "Today"
                        : `${days} day${days === 1 ? "" : "s"} left`}
                </span>
              </li>
            )
          })}
      </ul>

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
