import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { UnofficialToolNotice } from "@/components/tool/UnofficialToolNotice"
import { useLocalStorageState } from "@/hooks/use-local-storage-state"
import { DEFAULT_PROGRAM_LEVELS } from "@/lib/iitm-bs"

type LevelState = Record<string, { completed: string; target: string }>

function defaultState(): LevelState {
  return Object.fromEntries(
    DEFAULT_PROGRAM_LEVELS.map((level) => [
      level.slug,
      { completed: "0", target: String(level.defaultCredits) },
    ]),
  )
}

export default function IitmBsDegreeProgressTracker() {
  const [state, setState] = useLocalStorageState<LevelState>(
    "shadyshard-iitm-degree-progress",
    defaultState(),
  )

  function update(slug: string, patch: Partial<{ completed: string; target: string }>) {
    setState({ ...state, [slug]: { ...state[slug], ...patch } })
  }

  return (
    <div className="space-y-5">
      <UnofficialToolNotice />

      <div className="space-y-4">
        {DEFAULT_PROGRAM_LEVELS.map((level) => {
          const row = state[level.slug] ?? {
            completed: "0",
            target: String(level.defaultCredits),
          }
          const completed = Number(row.completed) || 0
          const target = Number(row.target) || 0
          const percent = target > 0 ? Math.min((completed / target) * 100, 100) : 0
          const achieved = target > 0 && completed >= target

          return (
            <div key={level.slug} className="border-border/60 rounded-lg border p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-medium">{level.label}</span>
                <span
                  className={
                    achieved
                      ? "text-xs font-medium text-emerald-600 dark:text-emerald-400"
                      : "text-muted-foreground text-xs"
                  }
                >
                  {achieved
                    ? `${level.outcome} qualified`
                    : `${percent.toFixed(0)}% complete`}
                </span>
              </div>

              <div className="bg-muted mt-3 h-2 w-full overflow-hidden rounded-full">
                <div
                  className="bg-primary h-full rounded-full transition-all"
                  style={{ width: `${percent}%` }}
                />
              </div>

              <div className="mt-3 flex flex-wrap gap-3">
                <div>
                  <Label htmlFor={`level-completed-${level.slug}`}>
                    Credits completed
                  </Label>
                  <Input
                    id={`level-completed-${level.slug}`}
                    name={`completed-${level.slug}`}
                    type="number"
                    min="0"
                    step="1"
                    value={row.completed}
                    onChange={(e) => update(level.slug, { completed: e.target.value })}
                    className="mt-1.5 w-32"
                  />
                </div>
                <div>
                  <Label htmlFor={`level-target-${level.slug}`}>Credit target</Label>
                  <Input
                    id={`level-target-${level.slug}`}
                    name={`target-${level.slug}`}
                    type="number"
                    min="0"
                    step="1"
                    value={row.target}
                    onChange={(e) => update(level.slug, { target: e.target.value })}
                    className="mt-1.5 w-32"
                  />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setState(defaultState())}
      >
        Reset
      </Button>
    </div>
  )
}
