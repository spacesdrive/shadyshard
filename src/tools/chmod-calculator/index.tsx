import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CopyButton } from "@/components/tool/CopyButton"

const CLASSES = [
  { key: "owner", label: "Owner" },
  { key: "group", label: "Group" },
  { key: "others", label: "Others" },
] as const

const PERMISSIONS = [
  { key: "read", label: "Read", bit: 4, letter: "r" },
  { key: "write", label: "Write", bit: 2, letter: "w" },
  { key: "execute", label: "Execute", bit: 1, letter: "x" },
] as const

const SPECIAL = [
  {
    key: "setuid",
    label: "Setuid",
    bit: 4,
    description: "Runs with the file owner's privileges rather than the caller's.",
  },
  {
    key: "setgid",
    label: "Setgid",
    bit: 2,
    description:
      "Runs with the file group, or makes new files in a directory inherit it.",
  },
  {
    key: "sticky",
    label: "Sticky",
    bit: 1,
    description: "In a directory, only a file's owner can delete or rename it.",
  },
] as const

type ClassKey = (typeof CLASSES)[number]["key"]
type PermissionKey = (typeof PERMISSIONS)[number]["key"]
type SpecialKey = (typeof SPECIAL)[number]["key"]

type Grid = Record<ClassKey, Record<PermissionKey, boolean>>
type Specials = Record<SpecialKey, boolean>

const EMPTY_GRID: Grid = {
  owner: { read: true, write: true, execute: true },
  group: { read: true, write: false, execute: true },
  others: { read: true, write: false, execute: true },
}

const NO_SPECIALS: Specials = { setuid: false, setgid: false, sticky: false }

function classDigit(permissions: Record<PermissionKey, boolean>): number {
  return PERMISSIONS.reduce(
    (total, permission) => total + (permissions[permission.key] ? permission.bit : 0),
    0,
  )
}

function specialDigit(specials: Specials): number {
  return SPECIAL.reduce(
    (total, special) => total + (specials[special.key] ? special.bit : 0),
    0,
  )
}

function toOctal(grid: Grid, specials: Specials): string {
  const digits = CLASSES.map((entry) => classDigit(grid[entry.key])).join("")
  const special = specialDigit(specials)
  return special > 0 ? `${special}${digits}` : digits
}

function toSymbolic(grid: Grid, specials: Specials): string {
  return CLASSES.map((entry, classIndex) => {
    const permissions = grid[entry.key]
    const letters: string[] = PERMISSIONS.map((permission) =>
      permissions[permission.key] ? permission.letter : "-",
    )
    if (classIndex === 0 && specials.setuid) letters[2] = permissions.execute ? "s" : "S"
    if (classIndex === 1 && specials.setgid) letters[2] = permissions.execute ? "s" : "S"
    if (classIndex === 2 && specials.sticky) letters[2] = permissions.execute ? "t" : "T"
    return letters.join("")
  }).join("")
}

function fromOctal(input: string): { grid: Grid; specials: Specials } | null {
  const trimmed = input.trim()
  if (!/^[0-7]{3,4}$/.test(trimmed)) return null
  const padded = trimmed.length === 3 ? `0${trimmed}` : trimmed
  const [specialChar, ...classChars] = padded.split("")
  const special = Number(specialChar)

  const grid = Object.fromEntries(
    CLASSES.map((entry, index) => {
      const digit = Number(classChars[index])
      return [
        entry.key,
        Object.fromEntries(
          PERMISSIONS.map((permission) => [
            permission.key,
            (digit & permission.bit) !== 0,
          ]),
        ),
      ]
    }),
  ) as Grid

  const specials = Object.fromEntries(
    SPECIAL.map((entry) => [entry.key, (special & entry.bit) !== 0]),
  ) as Specials

  return { grid, specials }
}

function fromSymbolic(input: string): { grid: Grid; specials: Specials } | null {
  const trimmed = input.trim().replace(/^[-dlbcps]/, "")
  if (!/^[rwxsStT-]{9}$/.test(trimmed)) return null

  const specials: Specials = { ...NO_SPECIALS }
  const grid = Object.fromEntries(
    CLASSES.map((entry, classIndex) => {
      const chunk = trimmed.slice(classIndex * 3, classIndex * 3 + 3)
      const third = chunk[2]
      if (classIndex === 0 && (third === "s" || third === "S")) specials.setuid = true
      if (classIndex === 1 && (third === "s" || third === "S")) specials.setgid = true
      if (classIndex === 2 && (third === "t" || third === "T")) specials.sticky = true
      return [
        entry.key,
        {
          read: chunk[0] === "r",
          write: chunk[1] === "w",
          execute: third === "x" || third === "s" || third === "t",
        },
      ]
    }),
  ) as Grid

  return { grid, specials }
}

function describe(grid: Grid, specials: Specials): string {
  const parts = CLASSES.map((entry) => {
    const allowed = PERMISSIONS.filter(
      (permission) => grid[entry.key][permission.key],
    ).map((permission) => permission.label.toLowerCase())
    return `${entry.label.toLowerCase()} can ${allowed.length ? allowed.join(", ") : "do nothing"}`
  })
  const specialNames = SPECIAL.filter((entry) => specials[entry.key]).map((entry) =>
    entry.label.toLowerCase(),
  )
  const suffix = specialNames.length
    ? ` The ${specialNames.join(" and ")} bit is set.`
    : ""
  return `${parts.join("; ")}.${suffix}`
}

export default function ChmodCalculator() {
  const [grid, setGrid] = useState<Grid>(EMPTY_GRID)
  const [specials, setSpecials] = useState<Specials>(NO_SPECIALS)
  const [octalDraft, setOctalDraft] = useState<string | null>(null)
  const [symbolicDraft, setSymbolicDraft] = useState<string | null>(null)

  const octal = toOctal(grid, specials)
  const symbolic = toSymbolic(grid, specials)
  const command = `chmod ${octal} filename`

  const octalError =
    octalDraft !== null && fromOctal(octalDraft) === null
      ? "Enter three or four digits, each between 0 and 7, for example 755 or 4755."
      : null
  const symbolicError =
    symbolicDraft !== null && fromSymbolic(symbolicDraft) === null
      ? "Enter nine permission characters, for example rwxr-xr-x."
      : null

  function toggle(classKey: ClassKey, permission: PermissionKey, checked: boolean) {
    setOctalDraft(null)
    setSymbolicDraft(null)
    setGrid((current) => ({
      ...current,
      [classKey]: { ...current[classKey], [permission]: checked },
    }))
  }

  return (
    <div className="space-y-6">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-border/60 border-b text-left">
              <th scope="col" className="py-2 pr-4 font-medium">
                Class
              </th>
              {PERMISSIONS.map((permission) => (
                <th key={permission.key} scope="col" className="py-2 pr-4 font-medium">
                  {permission.label}
                </th>
              ))}
              <th scope="col" className="py-2 font-medium">
                Digit
              </th>
            </tr>
          </thead>
          <tbody>
            {CLASSES.map((entry) => (
              <tr key={entry.key} className="border-border/60 border-b last:border-0">
                <th scope="row" className="py-3 pr-4 text-left font-normal">
                  {entry.label}
                </th>
                {PERMISSIONS.map((permission) => (
                  <td key={permission.key} className="py-3 pr-4">
                    <Checkbox
                      id={`chmod-${entry.key}-${permission.key}`}
                      name={`${entry.key}-${permission.key}`}
                      checked={grid[entry.key][permission.key]}
                      onCheckedChange={(checked) =>
                        toggle(entry.key, permission.key, checked === true)
                      }
                      aria-label={`${entry.label} ${permission.label}`}
                    />
                  </td>
                ))}
                <td className="py-3 font-mono tabular-nums">
                  {classDigit(grid[entry.key])}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <fieldset>
        <legend className="text-sm font-medium">Special bits</legend>
        <div className="mt-2 space-y-2">
          {SPECIAL.map((entry) => (
            <div key={entry.key} className="flex items-start gap-2">
              <Checkbox
                id={`chmod-${entry.key}`}
                name={entry.key}
                checked={specials[entry.key]}
                className="mt-0.5"
                onCheckedChange={(checked) => {
                  setOctalDraft(null)
                  setSymbolicDraft(null)
                  setSpecials((current) => ({
                    ...current,
                    [entry.key]: checked === true,
                  }))
                }}
              />
              <Label htmlFor={`chmod-${entry.key}`} className="font-normal">
                {entry.label}
                <span className="text-muted-foreground ml-1 text-xs">
                  {entry.description}
                </span>
              </Label>
            </div>
          ))}
        </div>
      </fieldset>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="chmod-octal">Octal</Label>
          <Input
            id="chmod-octal"
            name="octal"
            value={octalDraft ?? octal}
            onChange={(event) => {
              const next = event.target.value
              setOctalDraft(next)
              const parsed = fromOctal(next)
              if (parsed) {
                setGrid(parsed.grid)
                setSpecials(parsed.specials)
                setSymbolicDraft(null)
              }
            }}
            onBlur={() => setOctalDraft(null)}
            className="mt-1.5 font-mono text-sm"
          />
          {octalError && <p className="text-destructive mt-1 text-xs">{octalError}</p>}
        </div>
        <div>
          <Label htmlFor="chmod-symbolic">Symbolic</Label>
          <Input
            id="chmod-symbolic"
            name="symbolic"
            value={symbolicDraft ?? symbolic}
            onChange={(event) => {
              const next = event.target.value
              setSymbolicDraft(next)
              const parsed = fromSymbolic(next)
              if (parsed) {
                setGrid(parsed.grid)
                setSpecials(parsed.specials)
                setOctalDraft(null)
              }
            }}
            onBlur={() => setSymbolicDraft(null)}
            className="mt-1.5 font-mono text-sm"
          />
          {symbolicError && (
            <p className="text-destructive mt-1 text-xs">{symbolicError}</p>
          )}
        </div>
      </div>

      <p className="text-muted-foreground text-sm">{describe(grid, specials)}</p>

      <div className="flex flex-wrap gap-2">
        <Input
          id="chmod-command"
          name="command"
          value={command}
          readOnly
          className="min-w-56 flex-1 font-mono text-sm"
          aria-label="chmod command"
        />
        <CopyButton value={command} label="Copy command" size="icon" />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            setGrid(EMPTY_GRID)
            setSpecials(NO_SPECIALS)
            setOctalDraft(null)
            setSymbolicDraft(null)
          }}
        >
          Reset
        </Button>
      </div>
    </div>
  )
}
