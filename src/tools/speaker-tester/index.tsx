import { useCallback, useEffect, useRef, useState } from "react"
import { AlertCircle, Play, Square } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"

type Test = "left" | "right" | "both" | "sweep"

const SWEEP_START_HZ = 40
const SWEEP_END_HZ = 16000
const SWEEP_SECONDS = 10
const FADE_SECONDS = 0.03

const CHANNEL_TESTS: { id: Test; label: string; pan: number }[] = [
  { id: "left", label: "Left only", pan: -1 },
  { id: "both", label: "Both channels", pan: 0 },
  { id: "right", label: "Right only", pan: 1 },
]

export default function SpeakerTester() {
  const [frequency, setFrequency] = useState(440)
  const [volume, setVolume] = useState(25)
  const [active, setActive] = useState<Test | null>(null)
  const [error, setError] = useState<string | null>(null)

  const contextRef = useRef<AudioContext | null>(null)
  const oscillatorRef = useRef<OscillatorNode | null>(null)
  const gainRef = useRef<GainNode | null>(null)
  const stopTimer = useRef<number | undefined>(undefined)

  const stop = useCallback(() => {
    window.clearTimeout(stopTimer.current)
    const context = contextRef.current
    const oscillator = oscillatorRef.current
    const gain = gainRef.current
    if (context && oscillator && gain) {
      const now = context.currentTime
      gain.gain.cancelScheduledValues(now)
      gain.gain.setValueAtTime(gain.gain.value, now)
      gain.gain.linearRampToValueAtTime(0, now + FADE_SECONDS)
      oscillator.stop(now + FADE_SECONDS)
    }
    oscillatorRef.current = null
    gainRef.current = null
    setActive(null)
  }, [])

  useEffect(() => {
    return () => {
      window.clearTimeout(stopTimer.current)
      oscillatorRef.current?.stop()
      void contextRef.current?.close()
    }
  }, [])

  /** Keeps a running tone in step with the volume slider. */
  useEffect(() => {
    const context = contextRef.current
    const gain = gainRef.current
    if (!context || !gain) return
    gain.gain.setTargetAtTime(volume / 100, context.currentTime, 0.02)
  }, [volume])

  useEffect(() => {
    const context = contextRef.current
    const oscillator = oscillatorRef.current
    if (!context || !oscillator || active === "sweep" || active === null) return
    oscillator.frequency.setTargetAtTime(frequency, context.currentTime, 0.02)
  }, [frequency, active])

  function play(test: Test) {
    if (active) stop()
    setError(null)

    try {
      contextRef.current ??= new AudioContext()
      const context = contextRef.current
      void context.resume()

      const oscillator = context.createOscillator()
      const gain = context.createGain()
      const panner = context.createStereoPanner()

      oscillator.type = "sine"
      panner.pan.value = test === "left" ? -1 : test === "right" ? 1 : 0

      const now = context.currentTime
      gain.gain.setValueAtTime(0, now)
      gain.gain.linearRampToValueAtTime(volume / 100, now + FADE_SECONDS)

      if (test === "sweep") {
        oscillator.frequency.setValueAtTime(SWEEP_START_HZ, now)
        oscillator.frequency.exponentialRampToValueAtTime(
          SWEEP_END_HZ,
          now + SWEEP_SECONDS,
        )
        stopTimer.current = window.setTimeout(() => stop(), SWEEP_SECONDS * 1000)
      } else {
        oscillator.frequency.setValueAtTime(frequency, now)
      }

      oscillator.connect(gain).connect(panner).connect(context.destination)
      oscillator.start(now)

      oscillatorRef.current = oscillator
      gainRef.current = gain
      setActive(test)
    } catch {
      setError("This browser did not allow audio playback on this page.")
      setActive(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="border-border/60 rounded-xl border p-4 text-sm">
        <p className="font-medium">Turn your system volume down before starting.</p>
        <p className="text-muted-foreground mt-1.5">
          A continuous pure tone sounds louder than music at the same setting. The tone is
          generated in this page, so nothing is downloaded and the test works offline.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {CHANNEL_TESTS.map((test) => (
          <Button
            key={test.id}
            variant={active === test.id ? "default" : "outline"}
            onClick={() => play(test.id)}
          >
            <Play className="size-4" />
            {test.label}
          </Button>
        ))}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Frequency</span>
            <span className="text-muted-foreground text-sm tabular-nums">
              {frequency} Hz
            </span>
          </div>
          <Slider
            aria-label="Test tone frequency in hertz"
            className="mt-2"
            min={40}
            max={16000}
            step={10}
            value={[frequency]}
            onValueChange={(value) =>
              setFrequency(Array.isArray(value) ? value[0] : value)
            }
          />
        </div>
        <div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Volume</span>
            <span className="text-muted-foreground text-sm tabular-nums">{volume}%</span>
          </div>
          <Slider
            aria-label="Test tone volume"
            className="mt-2"
            min={0}
            max={100}
            step={1}
            value={[volume]}
            onValueChange={(value) => setVolume(Array.isArray(value) ? value[0] : value)}
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          variant={active === "sweep" ? "default" : "outline"}
          onClick={() => play("sweep")}
        >
          <Play className="size-4" />
          Sweep {SWEEP_START_HZ} Hz to {SWEEP_END_HZ / 1000} kHz
        </Button>
        <Button variant="outline" onClick={stop} disabled={!active}>
          <Square className="size-4" />
          Stop
        </Button>
      </div>

      <p aria-live="polite" className="text-muted-foreground text-sm">
        {active === null
          ? "No tone is playing."
          : active === "sweep"
            ? `Sweeping from ${SWEEP_START_HZ} Hz upwards for ${SWEEP_SECONDS} seconds.`
            : `Playing ${frequency} Hz through ${
                active === "both" ? "both channels" : `the ${active} channel only`
              }.`}
      </p>

      {error && (
        <div className="border-destructive/30 bg-destructive/10 text-destructive flex items-start gap-2 rounded-lg border p-3 text-sm">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  )
}
