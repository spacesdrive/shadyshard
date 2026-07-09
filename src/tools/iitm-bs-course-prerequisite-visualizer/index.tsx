import { useMemo } from "react"
import { Plus, Trash2, AlertCircle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { UnofficialToolNotice } from "@/components/tool/UnofficialToolNotice"
import { useLocalStorageState } from "@/hooks/use-local-storage-state"

interface CourseNode {
  id: string
  name: string
  prereqIds: string[]
}

function newCourse(name = ""): CourseNode {
  return { id: crypto.randomUUID(), name, prereqIds: [] }
}

const DEFAULT_COURSES: CourseNode[] = (() => {
  const foundations = newCourse("Mathematics for Data Science I")
  const stats = newCourse("Statistics for Data Science I")
  const ml = newCourse("Machine Learning Techniques")
  ml.prereqIds = [foundations.id, stats.id]
  return [foundations, stats, ml]
})()

type LayoutResult =
  { ok: true; levels: CourseNode[][] } | { ok: false; cycleNames: string[] }

class PrerequisiteCycleError extends Error {
  cycleIds: string[]

  constructor(cycleIds: string[]) {
    super("Prerequisite cycle detected")
    this.cycleIds = cycleIds
  }
}

function computeLayout(courses: CourseNode[]): LayoutResult {
  const byId = new Map(courses.map((c) => [c.id, c]))
  const depth = new Map<string, number>()
  const state = new Map<string, "visiting" | "done">()
  const stack: string[] = []

  function visit(id: string): number {
    if (depth.has(id)) return depth.get(id) as number
    if (state.get(id) === "visiting") {
      const cycleStart = stack.indexOf(id)
      const cycleIds = stack.slice(cycleStart === -1 ? 0 : cycleStart).concat(id)
      throw new PrerequisiteCycleError(cycleIds)
    }
    state.set(id, "visiting")
    stack.push(id)
    const course = byId.get(id)
    const validPrereqs = (course?.prereqIds ?? []).filter((p) => byId.has(p))
    const d = validPrereqs.length === 0 ? 0 : 1 + Math.max(...validPrereqs.map(visit))
    depth.set(id, d)
    state.set(id, "done")
    stack.pop()
    return d
  }

  try {
    for (const course of courses) visit(course.id)
  } catch (error) {
    if (!(error instanceof PrerequisiteCycleError)) throw error
    const names = error.cycleIds.map((id) => byId.get(id)?.name || "Untitled")
    return { ok: false, cycleNames: names }
  }

  const maxDepth = Math.max(0, ...Array.from(depth.values()))
  const levels: CourseNode[][] = Array.from({ length: maxDepth + 1 }, () => [])
  for (const course of courses) {
    levels[depth.get(course.id) ?? 0].push(course)
  }
  return { ok: true, levels }
}

export default function IitmBsCoursePrerequisiteVisualizer() {
  const [courses, setCourses] = useLocalStorageState<CourseNode[]>(
    "shadyshard-iitm-prerequisites",
    DEFAULT_COURSES,
  )

  function updateName(id: string, name: string) {
    setCourses(courses.map((c) => (c.id === id ? { ...c, name } : c)))
  }

  function updatePrereqs(id: string, prereqIds: string[]) {
    setCourses(courses.map((c) => (c.id === id ? { ...c, prereqIds } : c)))
  }

  function removeCourse(id: string) {
    setCourses(
      courses
        .filter((c) => c.id !== id)
        .map((c) => ({ ...c, prereqIds: c.prereqIds.filter((p) => p !== id) })),
    )
  }

  const layout = useMemo(() => computeLayout(courses), [courses])

  return (
    <div className="space-y-5">
      <UnofficialToolNotice />

      <div className="space-y-4">
        {courses.map((course, index) => (
          <div key={course.id} className="border-border/60 rounded-lg border p-3">
            <div className="flex flex-wrap items-end gap-2">
              <div className="min-w-40 flex-1">
                <Label
                  htmlFor={`prereq-name-${course.id}`}
                  className={index === 0 ? undefined : "sr-only"}
                >
                  Course name
                </Label>
                <Input
                  id={`prereq-name-${course.id}`}
                  name={`course-name-${index}`}
                  value={course.name}
                  onChange={(e) => updateName(course.id, e.target.value)}
                  placeholder="Course name"
                  className="mt-1.5"
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label={`Remove ${course.name || "course"}`}
                onClick={() => removeCourse(course.id)}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
            {courses.length > 1 && (
              <div className="mt-2">
                <Label htmlFor={`prereq-select-${course.id}`} className="text-xs">
                  Requires (hold Ctrl/Cmd to select multiple)
                </Label>
                <select
                  id={`prereq-select-${course.id}`}
                  name={`prereqs-${index}`}
                  multiple
                  value={course.prereqIds}
                  onChange={(e) =>
                    updatePrereqs(
                      course.id,
                      Array.from(e.target.selectedOptions, (o) => o.value),
                    )
                  }
                  className="border-input focus-visible:border-ring focus-visible:ring-ring/50 dark:bg-input/30 mt-1.5 h-20 w-full rounded-lg border bg-transparent p-1.5 text-sm outline-none focus-visible:ring-3"
                >
                  {courses
                    .filter((c) => c.id !== course.id)
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name || "Untitled course"}
                      </option>
                    ))}
                </select>
              </div>
            )}
          </div>
        ))}

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setCourses([...courses, newCourse()])}
        >
          <Plus className="size-4" />
          Add course
        </Button>
      </div>

      {!layout.ok ? (
        <div className="border-destructive/30 bg-destructive/10 text-destructive flex items-start gap-2 rounded-lg border p-3 text-sm">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <span>
            Prerequisite cycle detected: {layout.cycleNames.join(" -> ")}. Remove one of
            these links to get a valid course order.
          </span>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-muted-foreground text-sm">
            Suggested take-order, earliest courses first:
          </p>
          {layout.levels.map((level, i) => (
            <div key={i}>
              <p className="text-muted-foreground text-xs">Stage {i + 1}</p>
              <div className="mt-1 flex flex-wrap gap-2">
                {level.map((c) => (
                  <span
                    key={c.id}
                    className="border-border/60 rounded-full border px-3 py-1 text-sm"
                  >
                    {c.name || "Untitled course"}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setCourses(DEFAULT_COURSES)}
      >
        Reset
      </Button>
    </div>
  )
}
