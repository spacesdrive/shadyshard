import { Plus, Trash2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { UnofficialToolNotice } from "@/components/tool/UnofficialToolNotice"
import { useLocalStorageState } from "@/hooks/use-local-storage-state"

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const

interface StudyRow {
  id: string
  course: string
  hours: Record<(typeof DAYS)[number], string>
}

function newRow(course = ""): StudyRow {
  return {
    id: crypto.randomUUID(),
    course,
    hours: Object.fromEntries(DAYS.map((d) => [d, "0"])) as StudyRow["hours"],
  }
}

const DEFAULT_ROWS: StudyRow[] = [
  newRow("Machine Learning Techniques"),
  newRow("Software Testing"),
]

export default function IitmBsWeeklyStudyPlanner() {
  const [rows, setRows] = useLocalStorageState<StudyRow[]>(
    "shadyshard-iitm-study-planner",
    DEFAULT_ROWS,
  )

  function updateHours(id: string, day: (typeof DAYS)[number], value: string) {
    setRows(
      rows.map((row) =>
        row.id === id ? { ...row, hours: { ...row.hours, [day]: value } } : row,
      ),
    )
  }

  function updateCourse(id: string, course: string) {
    setRows(rows.map((row) => (row.id === id ? { ...row, course } : row)))
  }

  function removeRow(id: string) {
    setRows(rows.filter((row) => row.id !== id))
  }

  const dayTotals = Object.fromEntries(
    DAYS.map((day) => [
      day,
      rows.reduce((sum, row) => sum + (Number(row.hours[day]) || 0), 0),
    ]),
  )
  const weekTotal = Object.values(dayTotals).reduce((sum, v) => sum + v, 0)

  return (
    <div className="space-y-5">
      <UnofficialToolNotice />

      <div className="overflow-x-auto">
        <table className="w-full min-w-max border-collapse text-sm">
          <thead>
            <tr>
              <th className="p-2 text-left font-medium">Course</th>
              {DAYS.map((day) => (
                <th key={day} scope="col" className="w-16 p-2 text-center font-medium">
                  {day}
                </th>
              ))}
              <th scope="col" className="w-16 p-2 text-center font-medium">
                Total
              </th>
              <th className="w-8 p-2" />
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => {
              const rowTotal = DAYS.reduce(
                (sum, d) => sum + (Number(row.hours[d]) || 0),
                0,
              )
              return (
                <tr key={row.id} className="border-border/60 border-t">
                  <td className="p-2">
                    <Label htmlFor={`course-${row.id}`} className="sr-only">
                      Course name, row {index + 1}
                    </Label>
                    <Input
                      id={`course-${row.id}`}
                      name={`course-${index}`}
                      value={row.course}
                      onChange={(e) => updateCourse(row.id, e.target.value)}
                      placeholder="Course name"
                      className="min-w-40"
                    />
                  </td>
                  {DAYS.map((day) => (
                    <td key={day} className="p-2">
                      <Label htmlFor={`hours-${row.id}-${day}`} className="sr-only">
                        {row.course || "Course"} hours on {day}
                      </Label>
                      <Input
                        id={`hours-${row.id}-${day}`}
                        name={`hours-${index}-${day}`}
                        type="number"
                        min="0"
                        step="0.5"
                        value={row.hours[day]}
                        onChange={(e) => updateHours(row.id, day, e.target.value)}
                        className="w-16 text-center"
                      />
                    </td>
                  ))}
                  <td className="p-2 text-center font-medium tabular-nums">{rowTotal}</td>
                  <td className="p-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Remove ${row.course || "course"}`}
                      onClick={() => removeRow(row.id)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </td>
                </tr>
              )
            })}
          </tbody>
          <tfoot>
            <tr className="border-border/60 border-t font-medium">
              <td className="p-2">Daily total</td>
              {DAYS.map((day) => (
                <td key={day} className="p-2 text-center tabular-nums">
                  {dayTotals[day]}
                </td>
              ))}
              <td className="p-2 text-center tabular-nums">{weekTotal}</td>
              <td />
            </tr>
          </tfoot>
        </table>
      </div>

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setRows([...rows, newRow()])}
      >
        <Plus className="size-4" />
        Add course
      </Button>

      <p className="text-sm">
        Total weekly study time: <span className="font-semibold">{weekTotal} hours</span>
      </p>

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setRows(DEFAULT_ROWS)}
      >
        Reset
      </Button>
    </div>
  )
}
