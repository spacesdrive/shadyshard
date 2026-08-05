import { useEffect, useMemo, useRef, useState } from "react"
import { Gamepad2, RotateCcw, Vibrate } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

interface GamepadSnapshot {
  index: number
  id: string
  mapping: string
  buttons: { pressed: boolean; value: number }[]
  axes: number[]
  hasVibration: boolean
}

interface HapticActuator {
  playEffect?: (type: string, params: Record<string, number>) => Promise<string>
}

const DRIFT_MINOR = 0.05
const DRIFT_SIGNIFICANT = 0.15

function readGamepads(): GamepadSnapshot[] {
  const pads = navigator.getGamepads ? navigator.getGamepads() : []
  return Array.from(pads)
    .filter((pad): pad is Gamepad => pad !== null)
    .map((pad) => ({
      index: pad.index,
      id: pad.id,
      mapping: pad.mapping || "unmapped",
      buttons: pad.buttons.map((button) => ({
        pressed: button.pressed,
        value: button.value,
      })),
      axes: Array.from(pad.axes),
      hasVibration: Boolean(
        (pad.vibrationActuator as HapticActuator | undefined | null)?.playEffect,
      ),
    }))
}

function StickVisualiser({ label, x, y }: { label: string; x: number; y: number }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="border-border/60 bg-muted/40 relative size-24 rounded-full border">
        <span className="bg-border/70 absolute top-1/2 left-0 h-px w-full" aria-hidden />
        <span className="bg-border/70 absolute top-0 left-1/2 h-full w-px" aria-hidden />
        <span
          className="bg-primary absolute size-3 rounded-full"
          style={{
            left: `calc(50% + ${x * 42}% - 0.375rem)`,
            top: `calc(50% + ${y * 42}% - 0.375rem)`,
          }}
          aria-hidden
        />
      </div>
      <p className="text-xs font-medium">{label}</p>
      <p className="text-muted-foreground font-mono text-xs tabular-nums">
        {x.toFixed(3)}, {y.toFixed(3)}
      </p>
    </div>
  )
}

export default function GamepadTester() {
  const [snapshots, setSnapshots] = useState<GamepadSnapshot[]>([])
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [driftRunning, setDriftRunning] = useState(false)
  const [driftPeaks, setDriftPeaks] = useState<number[]>([])
  const [driftSeconds, setDriftSeconds] = useState(0)
  const [rumbleError, setRumbleError] = useState<string | null>(null)
  const driftRunningRef = useRef(false)
  const driftStartRef = useRef(0)

  useEffect(() => {
    let frame = 0

    function poll(now: number) {
      const pads = readGamepads()
      setSnapshots(pads)

      if (driftRunningRef.current) {
        const active = pads.find((pad) => pad.index === selectedIndex) ?? pads[0]
        if (active) {
          setDriftPeaks((current) =>
            active.axes.map((value, axisIndex) =>
              Math.max(current[axisIndex] ?? 0, Math.abs(value)),
            ),
          )
        }
        setDriftSeconds((now - driftStartRef.current) / 1000)
      }

      frame = requestAnimationFrame(poll)
    }

    frame = requestAnimationFrame(poll)
    return () => cancelAnimationFrame(frame)
  }, [selectedIndex])

  useEffect(() => {
    if (snapshots.length === 0) {
      if (selectedIndex !== null) setSelectedIndex(null)
      return
    }
    if (!snapshots.some((pad) => pad.index === selectedIndex)) {
      setSelectedIndex(snapshots[0].index)
    }
  }, [snapshots, selectedIndex])

  const active = useMemo(
    () => snapshots.find((pad) => pad.index === selectedIndex) ?? null,
    [snapshots, selectedIndex],
  )

  const worstDrift = driftPeaks.length ? Math.max(...driftPeaks) : 0

  function startDrift() {
    setDriftPeaks([])
    setDriftSeconds(0)
    driftStartRef.current = performance.now()
    driftRunningRef.current = true
    setDriftRunning(true)
  }

  function stopDrift() {
    driftRunningRef.current = false
    setDriftRunning(false)
  }

  async function testRumble() {
    if (selectedIndex === null) return
    const pad = navigator.getGamepads()[selectedIndex]
    const actuator = pad?.vibrationActuator as HapticActuator | undefined | null
    if (!actuator?.playEffect) {
      setRumbleError("This controller does not expose a vibration actuator.")
      return
    }
    setRumbleError(null)
    try {
      await actuator.playEffect("dual-rumble", {
        duration: 600,
        strongMagnitude: 0.8,
        weakMagnitude: 0.4,
      })
    } catch {
      setRumbleError("The browser refused the vibration request for this controller.")
    }
  }

  if (!active) {
    return (
      <div className="border-border/60 flex flex-col items-center gap-3 rounded-xl border border-dashed p-10 text-center">
        <Gamepad2 className="text-muted-foreground size-8" aria-hidden />
        <p className="text-sm font-medium">No controller detected yet</p>
        <p className="text-muted-foreground max-w-md text-sm">
          Connect a controller over USB or Bluetooth, then press any button on it.
          Browsers keep gamepads hidden from a page until they receive input, so nothing
          appears until you press something.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {snapshots.length > 1 && (
        <div className="max-w-sm">
          <Label htmlFor="gamepad-select">Controller</Label>
          <Select
            value={String(selectedIndex)}
            onValueChange={(value) => value && setSelectedIndex(Number(value))}
          >
            <SelectTrigger id="gamepad-select" className="mt-1.5 w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {snapshots.map((pad) => (
                <SelectItem key={pad.index} value={String(pad.index)}>
                  {pad.index}: {pad.id.slice(0, 40)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="border-border/60 rounded-lg border p-4">
        <p className="text-sm font-medium break-words">{active.id}</p>
        <p className="text-muted-foreground mt-1 text-xs">
          Mapping: {active.mapping} - {active.buttons.length} buttons,{" "}
          {active.axes.length} axes
        </p>
      </div>

      {active.axes.length >= 2 && (
        <div className="flex flex-wrap justify-center gap-8">
          <StickVisualiser label="Left stick" x={active.axes[0]} y={active.axes[1]} />
          {active.axes.length >= 4 && (
            <StickVisualiser label="Right stick" x={active.axes[2]} y={active.axes[3]} />
          )}
        </div>
      )}

      <div>
        <h2 className="text-sm font-medium">Buttons</h2>
        <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
          {active.buttons.map((button, index) => (
            <div
              key={index}
              className={cn(
                "rounded-md border p-2 text-center transition-colors",
                button.pressed
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border/60 bg-muted/40",
              )}
            >
              <p className="text-xs font-medium tabular-nums">{index}</p>
              <p className="font-mono text-[11px] tabular-nums">
                {button.value.toFixed(2)}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-sm font-medium">Axes</h2>
        <ul className="mt-3 space-y-2">
          {active.axes.map((value, index) => (
            <li key={index} className="flex items-center gap-3">
              <span className="text-muted-foreground w-14 shrink-0 text-xs">
                Axis {index}
              </span>
              <span className="bg-muted relative h-2 flex-1 overflow-hidden rounded-full">
                <span
                  className="bg-primary absolute top-0 h-full"
                  style={{
                    left: `${Math.min(50, 50 + value * 50)}%`,
                    width: `${Math.abs(value) * 50}%`,
                  }}
                  aria-hidden
                />
              </span>
              <span className="w-16 shrink-0 text-right font-mono text-xs tabular-nums">
                {value.toFixed(3)}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="border-border/60 rounded-lg border p-4">
        <h2 className="text-sm font-medium">Drift test</h2>
        <p className="text-muted-foreground mt-1 text-sm">
          Put the controller down on a flat surface without touching it, then start the
          test. The largest reading each axis produces while at rest is recorded below.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {driftRunning ? (
            <Button type="button" size="sm" onClick={stopDrift}>
              Stop test
            </Button>
          ) : (
            <Button type="button" size="sm" onClick={startDrift}>
              Start drift test
            </Button>
          )}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              stopDrift()
              setDriftPeaks([])
              setDriftSeconds(0)
            }}
          >
            <RotateCcw className="size-4" />
            Reset
          </Button>
          {active.hasVibration && (
            <Button type="button" variant="outline" size="sm" onClick={testRumble}>
              <Vibrate className="size-4" />
              Test rumble
            </Button>
          )}
        </div>

        {rumbleError && <p className="text-destructive mt-3 text-sm">{rumbleError}</p>}

        {driftPeaks.length > 0 && (
          <div className="mt-4 space-y-3">
            <p className="text-muted-foreground text-xs tabular-nums">
              Measured over {driftSeconds.toFixed(1)} seconds
            </p>
            <ul className="grid gap-2 sm:grid-cols-2">
              {driftPeaks.map((peak, index) => (
                <li
                  key={index}
                  className="border-border/60 flex items-center justify-between rounded-md border px-3 py-2 text-sm"
                >
                  <span className="text-muted-foreground">Axis {index} peak</span>
                  <span className="font-mono tabular-nums">{peak.toFixed(4)}</span>
                </li>
              ))}
            </ul>
            <p
              className={cn(
                "text-sm",
                worstDrift >= DRIFT_SIGNIFICANT
                  ? "text-destructive"
                  : worstDrift >= DRIFT_MINOR
                    ? "text-amber-700 dark:text-amber-400"
                    : "text-muted-foreground",
              )}
            >
              {worstDrift >= DRIFT_SIGNIFICANT
                ? `Peak resting movement of ${worstDrift.toFixed(3)} is significant drift and will affect aiming in most games.`
                : worstDrift >= DRIFT_MINOR
                  ? `Peak resting movement of ${worstDrift.toFixed(3)} is minor drift. Most games will absorb it with their own deadzone, but you may notice it in menus.`
                  : `Peak resting movement of ${worstDrift.toFixed(3)} is within the normal range for a healthy stick.`}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
