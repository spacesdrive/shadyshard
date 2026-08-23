import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from "react"
import { Maximize, X } from "lucide-react"
import { Button } from "@/components/ui/button"

/**
 * These hex values are the test signal itself rather than interface styling,
 * so they are deliberately literal rather than theme tokens: the panel has to
 * receive an exact primary or secondary value for a stuck subpixel to show.
 */
const TEST_COLORS = [
  { name: "Black", value: "#000000", isLight: false },
  { name: "White", value: "#ffffff", isLight: true },
  { name: "Red", value: "#ff0000", isLight: false },
  { name: "Green", value: "#00ff00", isLight: true },
  { name: "Blue", value: "#0000ff", isLight: false },
  { name: "Cyan", value: "#00ffff", isLight: true },
  { name: "Magenta", value: "#ff00ff", isLight: false },
  { name: "Yellow", value: "#ffff00", isLight: true },
  { name: "Mid grey", value: "#808080", isLight: false },
]

const CONTROLS_TIMEOUT_MS = 2500

export default function DeadPixelTester() {
  const [running, setRunning] = useState(false)
  const [index, setIndex] = useState(0)
  const [controlsVisible, setControlsVisible] = useState(true)
  const [fullscreenBlocked, setFullscreenBlocked] = useState(false)
  const surfaceRef = useRef<HTMLDivElement>(null)
  const hideTimer = useRef<number | undefined>(undefined)

  const revealControls = useCallback(() => {
    setControlsVisible(true)
    window.clearTimeout(hideTimer.current)
    hideTimer.current = window.setTimeout(
      () => setControlsVisible(false),
      CONTROLS_TIMEOUT_MS,
    )
  }, [])

  const stop = useCallback(() => {
    setRunning(false)
    window.clearTimeout(hideTimer.current)
    if (document.fullscreenElement) void document.exitFullscreen()
  }, [])

  function start(startIndex: number) {
    setIndex(startIndex)
    setFullscreenBlocked(false)
    setRunning(true)
  }

  /**
   * Full screen is requested from an effect rather than from the click
   * handler so the surface has already been committed at its full size when
   * the browser takes it over.
   */
  useEffect(() => {
    if (!running) return
    const surface = surfaceRef.current
    surface?.focus()
    revealControls()
    surface?.requestFullscreen().catch(() => setFullscreenBlocked(true))

    function handleFullscreenChange() {
      if (!document.fullscreenElement) stop()
    }
    document.addEventListener("fullscreenchange", handleFullscreenChange)
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange)
  }, [running, stop, revealControls])

  useEffect(() => () => window.clearTimeout(hideTimer.current), [])

  function step(delta: number) {
    setIndex((current) => (current + delta + TEST_COLORS.length) % TEST_COLORS.length)
    revealControls()
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "ArrowRight" || event.key === "ArrowDown" || event.key === " ") {
      event.preventDefault()
      step(1)
      return
    }
    if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      event.preventDefault()
      step(-1)
      return
    }
    if (event.key === "Escape") stop()
  }

  const color = TEST_COLORS[index]

  return (
    <div className="space-y-5">
      <div className="border-border/60 rounded-xl border p-4">
        <p className="text-sm font-medium">Before you start</p>
        <ul className="text-muted-foreground mt-2 space-y-1.5 text-sm">
          <li>Clean the screen first, so dust is not mistaken for a stuck pixel.</li>
          <li>
            Look across the whole panel on each colour, including the corners and edges.
          </li>
          <li>
            A dot that stays black on white is dead; one that stays coloured on black is
            stuck.
          </li>
          <li>
            Click or press the arrow keys to change colour, and press Escape to leave.
          </li>
        </ul>
      </div>

      <div>
        <span className="text-sm font-medium">Start on a colour</span>
        <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-5">
          {TEST_COLORS.map((entry, entryIndex) => (
            <button
              key={entry.name}
              type="button"
              onClick={() => start(entryIndex)}
              className="border-border/60 focus-visible:ring-ring flex flex-col items-center gap-2 rounded-lg border p-2 text-xs focus-visible:ring-2 focus-visible:outline-none"
            >
              <span
                className="border-border/60 h-8 w-full rounded border"
                style={{ backgroundColor: entry.value }}
                aria-hidden
              />
              {entry.name}
            </button>
          ))}
        </div>
      </div>

      <Button onClick={() => start(0)}>
        <Maximize className="size-4" />
        Start full screen test
      </Button>

      {fullscreenBlocked && (
        <p className="text-muted-foreground text-sm">
          Your browser did not allow full screen, so the test covers the browser window
          instead. Press F11 first for the whole panel.
        </p>
      )}

      <div
        ref={surfaceRef}
        tabIndex={running ? 0 : -1}
        role={running ? "application" : undefined}
        aria-label={running ? `Pixel test showing ${color.name}` : undefined}
        onKeyDown={handleKeyDown}
        onClick={() => {
          if (running) step(1)
        }}
        onPointerMove={() => {
          if (running) revealControls()
        }}
        className={
          running ? "fixed inset-0 z-50 cursor-pointer focus:outline-none" : "hidden"
        }
        style={running ? { backgroundColor: color.value } : undefined}
      >
        {running && (
          <div
            className={`absolute inset-x-0 bottom-0 flex flex-wrap items-center justify-center gap-3 p-4 transition-opacity focus-within:opacity-100 ${
              controlsVisible ? "opacity-100" : "opacity-0"
            }`}
          >
            <span
              className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
                color.isLight ? "bg-black/70 text-white" : "bg-white/80 text-black"
              }`}
            >
              {color.name} ({index + 1} of {TEST_COLORS.length})
            </span>
            <Button
              variant="secondary"
              size="sm"
              onClick={(event) => {
                event.stopPropagation()
                step(-1)
              }}
            >
              Previous
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={(event) => {
                event.stopPropagation()
                step(1)
              }}
            >
              Next
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={(event) => {
                event.stopPropagation()
                stop()
              }}
            >
              <X className="size-4" />
              Exit test
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
