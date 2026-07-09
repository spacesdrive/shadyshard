import { useMemo, useState } from "react"
import { Plus, Trash2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { CopyButton } from "@/components/tool/CopyButton"
import { DownloadButton } from "@/components/tool/DownloadButton"
import { UnofficialToolNotice } from "@/components/tool/UnofficialToolNotice"
import { useLocalStorageState } from "@/hooks/use-local-storage-state"
import { DEFAULT_GRADE_SCALE, type GradeOption } from "@/lib/iitm-bs"

interface CourseRow {
  id: string
  name: string
  credits: string
  grade: string
}

function newRow(name = "", credits = "4", grade = "A"): CourseRow {
  return { id: crypto.randomUUID(), name, credits, grade }
}

const DEFAULT_ROWS: CourseRow[] = [
  newRow("Mathematics for Data Science I", "4", "A"),
  newRow("Statistics for Data Science I", "4", "S"),
  newRow("Computational Thinking", "4", "B"),
]

export default function IitmBsCgpaCalculator() {
  const [courses, setCourses] = useLocalStorageState<CourseRow[]>(
    "shadyshard-iitm-cgpa-courses",
    DEFAULT_ROWS,
  )
  const [gradeScale, setGradeScale] = useState<GradeOption[]>(DEFAULT_GRADE_SCALE)

  function updateRow(id: string, patch: Partial<CourseRow>) {
    setCourses(courses.map((c) => (c.id === id ? { ...c, ...patch } : c)))
  }

  function removeRow(id: string) {
    setCourses(courses.filter((c) => c.id !== id))
  }

  function pointsFor(letter: string): number {
    return gradeScale.find((g) => g.letter === letter)?.points ?? 0
  }

  function updateGradePoints(letter: string, points: number) {
    setGradeScale(gradeScale.map((g) => (g.letter === letter ? { ...g, points } : g)))
  }

  const { totalCredits, cgpa } = useMemo(() => {
    let credits = 0
    let weighted = 0
    for (const course of courses) {
      const c = Number(course.credits)
      if (!Number.isFinite(c) || c <= 0) continue
      const points = gradeScale.find((g) => g.letter === course.grade)?.points ?? 0
      credits += c
      weighted += c * points
    }
    return {
      totalCredits: credits,
      weightedPoints: weighted,
      cgpa: credits > 0 ? weighted / credits : 0,
    }
  }, [courses, gradeScale])

  const csv = [
    "Course,Credits,Grade,Grade Points",
    ...courses.map(
      (c) =>
        `"${c.name.replace(/"/g, '""')}",${c.credits},${c.grade},${pointsFor(c.grade)}`,
    ),
    `Total,${totalCredits},,`,
    `CGPA,${cgpa.toFixed(2)},,`,
  ].join("\n")

  return (
    <div className="space-y-5">
      <UnofficialToolNotice />

      <div className="space-y-3">
        {courses.map((course, index) => (
          <div key={course.id} className="flex flex-wrap items-end gap-2">
            <div className="min-w-40 flex-1">
              <Label
                htmlFor={`cgpa-name-${course.id}`}
                className={index === 0 ? undefined : "sr-only"}
              >
                Course name
              </Label>
              <Input
                id={`cgpa-name-${course.id}`}
                name={`course-name-${index}`}
                value={course.name}
                onChange={(e) => updateRow(course.id, { name: e.target.value })}
                placeholder="Course name"
                className="mt-1.5"
              />
            </div>
            <div className="w-24">
              <Label
                htmlFor={`cgpa-credits-${course.id}`}
                className={index === 0 ? undefined : "sr-only"}
              >
                Credits
              </Label>
              <Input
                id={`cgpa-credits-${course.id}`}
                name={`course-credits-${index}`}
                type="number"
                min="0"
                step="0.5"
                value={course.credits}
                onChange={(e) => updateRow(course.id, { credits: e.target.value })}
                className="mt-1.5"
              />
            </div>
            <div className="w-28">
              <Label
                htmlFor={`cgpa-grade-${course.id}`}
                className={index === 0 ? undefined : "sr-only"}
              >
                Grade
              </Label>
              <select
                id={`cgpa-grade-${course.id}`}
                name={`course-grade-${index}`}
                value={course.grade}
                onChange={(e) => updateRow(course.id, { grade: e.target.value })}
                className="border-input focus-visible:border-ring focus-visible:ring-ring/50 dark:bg-input/30 mt-1.5 h-8 w-full rounded-lg border bg-transparent px-2.5 text-sm outline-none focus-visible:ring-3"
              >
                {gradeScale.map((g) => (
                  <option key={g.letter} value={g.letter}>
                    {g.letter} ({g.points})
                  </option>
                ))}
              </select>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label={`Remove ${course.name || "course"}`}
              onClick={() => removeRow(course.id)}
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        ))}

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setCourses([...courses, newRow()])}
        >
          <Plus className="size-4" />
          Add course
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div className="border-border/60 rounded-lg border p-4 text-center">
          <p className="text-2xl font-semibold tabular-nums">
            {totalCredits > 0 ? cgpa.toFixed(2) : "-"}
          </p>
          <p className="text-muted-foreground mt-1 text-xs">CGPA</p>
        </div>
        <div className="border-border/60 rounded-lg border p-4 text-center">
          <p className="text-2xl font-semibold tabular-nums">{totalCredits}</p>
          <p className="text-muted-foreground mt-1 text-xs">Total credits</p>
        </div>
        <div className="border-border/60 rounded-lg border p-4 text-center">
          <p className="text-2xl font-semibold tabular-nums">
            {totalCredits > 0 ? (cgpa * 10).toFixed(1) + "%" : "-"}
          </p>
          <p className="text-muted-foreground mt-1 text-xs">
            Approx. percentage (CGPA x 10)
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <CopyButton value={cgpa.toFixed(2)} label="Copy CGPA" />
        <DownloadButton
          getBlob={() => new Blob([csv], { type: "text/csv" })}
          filename="iitm-bs-cgpa.csv"
          label="Export CSV"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            setCourses(DEFAULT_ROWS)
            setGradeScale(DEFAULT_GRADE_SCALE)
          }}
        >
          Reset
        </Button>
      </div>

      <details className="border-border/60 rounded-lg border p-3 text-sm">
        <summary className="cursor-pointer font-medium">Edit grade-point scale</summary>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {gradeScale.map((g) => (
            <div key={g.letter}>
              <Label htmlFor={`grade-point-${g.letter}`}>
                {g.letter} - {g.description}
              </Label>
              <Input
                id={`grade-point-${g.letter}`}
                name={`grade-point-${g.letter}`}
                type="number"
                min="0"
                max="10"
                value={g.points}
                onChange={(e) => updateGradePoints(g.letter, Number(e.target.value))}
                className="mt-1.5 w-20"
              />
            </div>
          ))}
        </div>
      </details>
    </div>
  )
}
