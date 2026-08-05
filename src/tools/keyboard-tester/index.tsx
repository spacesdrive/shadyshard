import { useCallback, useEffect, useMemo, useState } from "react"
import { AlertCircle, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface KeyDef {
  code: string
  label: string
  width?: number
}

const MAIN_ROWS: KeyDef[][] = [
  [
    { code: "Escape", label: "Esc" },
    { code: "F1", label: "F1" },
    { code: "F2", label: "F2" },
    { code: "F3", label: "F3" },
    { code: "F4", label: "F4" },
    { code: "F5", label: "F5" },
    { code: "F6", label: "F6" },
    { code: "F7", label: "F7" },
    { code: "F8", label: "F8" },
    { code: "F9", label: "F9" },
    { code: "F10", label: "F10" },
    { code: "F11", label: "F11" },
    { code: "F12", label: "F12" },
  ],
  [
    { code: "Backquote", label: "`" },
    { code: "Digit1", label: "1" },
    { code: "Digit2", label: "2" },
    { code: "Digit3", label: "3" },
    { code: "Digit4", label: "4" },
    { code: "Digit5", label: "5" },
    { code: "Digit6", label: "6" },
    { code: "Digit7", label: "7" },
    { code: "Digit8", label: "8" },
    { code: "Digit9", label: "9" },
    { code: "Digit0", label: "0" },
    { code: "Minus", label: "-" },
    { code: "Equal", label: "=" },
    { code: "Backspace", label: "Backspace", width: 2 },
  ],
  [
    { code: "Tab", label: "Tab", width: 1.5 },
    { code: "KeyQ", label: "Q" },
    { code: "KeyW", label: "W" },
    { code: "KeyE", label: "E" },
    { code: "KeyR", label: "R" },
    { code: "KeyT", label: "T" },
    { code: "KeyY", label: "Y" },
    { code: "KeyU", label: "U" },
    { code: "KeyI", label: "I" },
    { code: "KeyO", label: "O" },
    { code: "KeyP", label: "P" },
    { code: "BracketLeft", label: "[" },
    { code: "BracketRight", label: "]" },
    { code: "Backslash", label: "\\", width: 1.5 },
  ],
  [
    { code: "CapsLock", label: "Caps", width: 1.75 },
    { code: "KeyA", label: "A" },
    { code: "KeyS", label: "S" },
    { code: "KeyD", label: "D" },
    { code: "KeyF", label: "F" },
    { code: "KeyG", label: "G" },
    { code: "KeyH", label: "H" },
    { code: "KeyJ", label: "J" },
    { code: "KeyK", label: "K" },
    { code: "KeyL", label: "L" },
    { code: "Semicolon", label: ";" },
    { code: "Quote", label: "'" },
    { code: "Enter", label: "Enter", width: 2.25 },
  ],
  [
    { code: "ShiftLeft", label: "Shift", width: 2.25 },
    { code: "KeyZ", label: "Z" },
    { code: "KeyX", label: "X" },
    { code: "KeyC", label: "C" },
    { code: "KeyV", label: "V" },
    { code: "KeyB", label: "B" },
    { code: "KeyN", label: "N" },
    { code: "KeyM", label: "M" },
    { code: "Comma", label: "," },
    { code: "Period", label: "." },
    { code: "Slash", label: "/" },
    { code: "ShiftRight", label: "Shift", width: 2.75 },
  ],
  [
    { code: "ControlLeft", label: "Ctrl", width: 1.25 },
    { code: "MetaLeft", label: "Meta", width: 1.25 },
    { code: "AltLeft", label: "Alt", width: 1.25 },
    { code: "Space", label: "Space", width: 6.25 },
    { code: "AltRight", label: "Alt", width: 1.25 },
    { code: "MetaRight", label: "Meta", width: 1.25 },
    { code: "ContextMenu", label: "Menu", width: 1.25 },
    { code: "ControlRight", label: "Ctrl", width: 1.25 },
  ],
]

const NAV_ROWS: KeyDef[][] = [
  [
    { code: "Insert", label: "Ins" },
    { code: "Home", label: "Home" },
    { code: "PageUp", label: "PgUp" },
  ],
  [
    { code: "Delete", label: "Del" },
    { code: "End", label: "End" },
    { code: "PageDown", label: "PgDn" },
  ],
  [{ code: "ArrowUp", label: "Up" }],
  [
    { code: "ArrowLeft", label: "Left" },
    { code: "ArrowDown", label: "Down" },
    { code: "ArrowRight", label: "Right" },
  ],
]

const NUMPAD_ROWS: KeyDef[][] = [
  [
    { code: "NumLock", label: "Num" },
    { code: "NumpadDivide", label: "/" },
    { code: "NumpadMultiply", label: "*" },
    { code: "NumpadSubtract", label: "-" },
  ],
  [
    { code: "Numpad7", label: "7" },
    { code: "Numpad8", label: "8" },
    { code: "Numpad9", label: "9" },
    { code: "NumpadAdd", label: "+" },
  ],
  [
    { code: "Numpad4", label: "4" },
    { code: "Numpad5", label: "5" },
    { code: "Numpad6", label: "6" },
    { code: "NumpadEnter", label: "Ent" },
  ],
  [
    { code: "Numpad1", label: "1" },
    { code: "Numpad2", label: "2" },
    { code: "Numpad3", label: "3" },
    { code: "Numpad0", label: "0" },
  ],
  [{ code: "NumpadDecimal", label: "." }],
]

const ALL_CODES = new Set(
  [...MAIN_ROWS, ...NAV_ROWS, ...NUMPAD_ROWS].flat().map((key) => key.code),
)

interface LastKey {
  key: string
  code: string
  keyCode: number
  location: number
}

const LOCATION_NAMES = ["standard", "left", "right", "numpad"]

function KeyCap({
  keyDef,
  pressed,
  tested,
}: {
  keyDef: KeyDef
  pressed: boolean
  tested: boolean
}) {
  return (
    <span
      style={{ flexGrow: keyDef.width ?? 1, flexBasis: 0 }}
      className={cn(
        "flex h-9 min-w-0 items-center justify-center rounded-md border px-1 text-center text-[11px] font-medium transition-colors",
        pressed
          ? "border-primary bg-primary text-primary-foreground"
          : tested
            ? "border-primary/40 bg-primary/15 text-foreground"
            : "border-border/60 bg-muted/40 text-muted-foreground",
      )}
    >
      <span className="truncate">{keyDef.label}</span>
    </span>
  )
}

export default function KeyboardTester() {
  const [pressed, setPressed] = useState<Set<string>>(new Set())
  const [tested, setTested] = useState<Set<string>>(new Set())
  const [history, setHistory] = useState<LastKey[]>([])
  const [unmapped, setUnmapped] = useState<string[]>([])

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const { code, key, keyCode, location, repeat } = event
      setPressed((current) => new Set(current).add(code))
      setTested((current) => new Set(current).add(code))
      if (!ALL_CODES.has(code)) {
        setUnmapped((current) =>
          current.includes(code) ? current : [...current, code].slice(-12),
        )
      }
      if (!repeat) {
        setHistory((current) =>
          [{ key, code, keyCode, location }, ...current].slice(0, 12),
        )
      }
    }

    function handleKeyUp(event: KeyboardEvent) {
      setPressed((current) => {
        const next = new Set(current)
        next.delete(event.code)
        return next
      })
    }

    function handleBlur() {
      setPressed(new Set())
    }

    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("keyup", handleKeyUp)
    window.addEventListener("blur", handleBlur)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("keyup", handleKeyUp)
      window.removeEventListener("blur", handleBlur)
    }
  }, [])

  const reset = useCallback(() => {
    setPressed(new Set())
    setTested(new Set())
    setHistory([])
    setUnmapped([])
  }, [])

  const last = history[0]
  const untested = useMemo(
    () => [...ALL_CODES].filter((code) => !tested.has(code)),
    [tested],
  )
  const stuck = useMemo(
    () => [...pressed].filter((code) => code !== "Tab" && code !== "Enter"),
    [pressed],
  )

  function renderBlock(rows: KeyDef[][]) {
    return rows.map((row, index) => (
      <div key={index} className="flex gap-1">
        {row.map((keyDef) => (
          <KeyCap
            key={keyDef.code}
            keyDef={keyDef}
            pressed={pressed.has(keyDef.code)}
            tested={tested.has(keyDef.code)}
          />
        ))}
      </div>
    ))
  }

  return (
    <div className="space-y-6">
      <p className="text-muted-foreground text-sm">
        Click anywhere on this page first, then press keys one at a time. Each key turns
        solid while it is held down and stays highlighted once it has been tested.
      </p>

      <div className="overflow-x-auto">
        <div className="flex min-w-[46rem] gap-4">
          <div className="flex flex-1 flex-col gap-1">{renderBlock(MAIN_ROWS)}</div>
          <div className="flex w-28 flex-col gap-1 pt-10">{renderBlock(NAV_ROWS)}</div>
          <div className="flex w-36 flex-col gap-1 pt-10">{renderBlock(NUMPAD_ROWS)}</div>
        </div>
      </div>

      <div aria-live="polite" className="sr-only">
        {last
          ? `Last key pressed: ${last.key}, code ${last.code}.`
          : "No key pressed yet."}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="border-border/60 rounded-lg border p-3">
          <p className="text-muted-foreground text-xs">Keys tested</p>
          <p className="mt-1 text-lg font-semibold tabular-nums">
            {tested.size} of {ALL_CODES.size}
          </p>
        </div>
        <div className="border-border/60 rounded-lg border p-3">
          <p className="text-muted-foreground text-xs">Currently held down</p>
          <p className="mt-1 text-lg font-semibold tabular-nums">{pressed.size}</p>
        </div>
        <div className="border-border/60 rounded-lg border p-3">
          <p className="text-muted-foreground text-xs">Not yet tested</p>
          <p className="mt-1 text-lg font-semibold tabular-nums">{untested.length}</p>
        </div>
      </div>

      {stuck.length > 0 && (
        <div className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-700 dark:text-amber-400">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <span>
            {stuck.join(", ")} {stuck.length === 1 ? "is" : "are"} still reported as held
            down. Release the key, and if the warning stays the switch may be stuck.
          </span>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="border-border/60 rounded-lg border p-4">
          <h2 className="text-sm font-medium">Last key</h2>
          {last ? (
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">key</dt>
                <dd className="truncate font-mono">
                  {last.key === " " ? "(space)" : last.key}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">code</dt>
                <dd className="truncate font-mono">{last.code}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">keyCode</dt>
                <dd className="font-mono tabular-nums">{last.keyCode}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">location</dt>
                <dd className="font-mono">
                  {LOCATION_NAMES[last.location] ?? String(last.location)}
                </dd>
              </div>
            </dl>
          ) : (
            <p className="text-muted-foreground mt-3 text-sm">
              Press any key to see what the browser reports.
            </p>
          )}
        </div>

        <div className="border-border/60 rounded-lg border p-4">
          <h2 className="text-sm font-medium">Recent keys</h2>
          {history.length > 0 ? (
            <ul className="mt-3 flex flex-wrap gap-1.5">
              {history.map((entry, index) => (
                <li
                  key={`${entry.code}-${index}`}
                  className="border-border/60 bg-muted/40 rounded border px-2 py-1 font-mono text-xs"
                >
                  {entry.key === " " ? "space" : entry.key}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground mt-3 text-sm">
              Your last twelve keys will appear here.
            </p>
          )}
        </div>
      </div>

      {unmapped.length > 0 && (
        <div className="border-border/60 rounded-lg border p-4">
          <h2 className="text-sm font-medium">Keys outside this layout</h2>
          <p className="text-muted-foreground mt-1 text-xs">
            These registered correctly but are not drawn on the standard layout above,
            usually because they belong to a non-US or laptop-specific keyboard.
          </p>
          <ul className="mt-3 flex flex-wrap gap-1.5">
            {unmapped.map((code) => (
              <li
                key={code}
                className="border-border/60 bg-muted/40 rounded border px-2 py-1 font-mono text-xs"
              >
                {code}
              </li>
            ))}
          </ul>
        </div>
      )}

      <Button type="button" variant="outline" size="sm" onClick={reset}>
        <RotateCcw className="size-4" />
        Reset test
      </Button>
    </div>
  )
}
