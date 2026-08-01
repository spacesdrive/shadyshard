import { useEffect, useMemo, useState } from "react"
import { AlertCircle, Info, Pause, Play, Square } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface VoiceOption {
  name: string
  lang: string
  isDefault: boolean
}

function useVoices(): { voices: VoiceOption[]; supported: boolean } {
  const supported = typeof window !== "undefined" && "speechSynthesis" in window
  const [voices, setVoices] = useState<VoiceOption[]>([])

  useEffect(() => {
    if (!supported) return

    function read() {
      setVoices(
        window.speechSynthesis.getVoices().map((voice) => ({
          name: voice.name,
          lang: voice.lang,
          isDefault: voice.default,
        })),
      )
    }

    read()
    window.speechSynthesis.addEventListener("voiceschanged", read)
    return () => window.speechSynthesis.removeEventListener("voiceschanged", read)
  }, [supported])

  return { voices, supported }
}

type Status = "idle" | "speaking" | "paused"

const SAMPLE =
  "Paste anything you would rather listen to than read. There is no character limit here, because the speech comes from voices already installed on this device rather than from a service that meters them."

export default function TextToSpeech() {
  const { voices, supported } = useVoices()
  const [text, setText] = useState(SAMPLE)
  const [voiceName, setVoiceName] = useState("")
  const [rate, setRate] = useState(1)
  const [pitch, setPitch] = useState(1)
  const [status, setStatus] = useState<Status>("idle")

  const sortedVoices = useMemo(
    () =>
      [...voices].sort(
        (a, b) => a.lang.localeCompare(b.lang) || a.name.localeCompare(b.name),
      ),
    [voices],
  )

  useEffect(() => {
    if (voiceName || sortedVoices.length === 0) return
    const preferred =
      sortedVoices.find((voice) => voice.isDefault) ??
      sortedVoices.find((voice) => voice.lang.startsWith("en")) ??
      sortedVoices[0]
    setVoiceName(preferred.name)
  }, [sortedVoices, voiceName])

  useEffect(() => {
    if (!supported) return
    return () => window.speechSynthesis.cancel()
  }, [supported])

  function speak() {
    if (!supported || !text.trim()) return

    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    const voice = window.speechSynthesis
      .getVoices()
      .find((entry) => entry.name === voiceName)
    if (voice) {
      utterance.voice = voice
      utterance.lang = voice.lang
    }
    utterance.rate = rate
    utterance.pitch = pitch
    utterance.onend = () => setStatus("idle")
    utterance.onerror = () => setStatus("idle")

    setStatus("speaking")
    window.speechSynthesis.speak(utterance)
  }

  function togglePause() {
    if (status === "speaking") {
      window.speechSynthesis.pause()
      setStatus("paused")
    } else if (status === "paused") {
      window.speechSynthesis.resume()
      setStatus("speaking")
    }
  }

  function stop() {
    window.speechSynthesis.cancel()
    setStatus("idle")
  }

  const words = text.trim() ? text.trim().split(/\s+/).length : 0
  const estimatedMinutes = words > 0 ? words / (180 * rate) : 0

  if (!supported) {
    return (
      <div className="border-destructive/30 bg-destructive/10 text-destructive flex items-start gap-2 rounded-lg border p-3 text-sm">
        <AlertCircle className="mt-0.5 size-4 shrink-0" />
        <span>
          This browser does not provide the Web Speech synthesis API, so text cannot be
          read aloud here. Recent versions of Chrome, Edge, Safari, and Firefox all
          support it.
        </span>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div>
        <Label htmlFor="tts-text">Text to read aloud</Label>
        <Textarea
          id="tts-text"
          name="text"
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Paste an article, a script, or your own draft."
          className="mt-1.5 min-h-44 resize-y text-sm"
        />
        <p className="text-muted-foreground mt-1 text-xs">
          {words.toLocaleString("en-US")} {words === 1 ? "word" : "words"}
          {words > 0 && `, roughly ${estimatedMinutes.toFixed(1)} minutes at this rate`}
        </p>
      </div>

      <div>
        <Label htmlFor="tts-voice">Voice</Label>
        <Select
          value={voiceName}
          onValueChange={(value) => value && setVoiceName(value as string)}
        >
          <SelectTrigger id="tts-voice" className="mt-1.5 w-full">
            <SelectValue placeholder="Loading the voices installed on this device" />
          </SelectTrigger>
          <SelectContent>
            {sortedVoices.map((voice) => (
              <SelectItem key={voice.name} value={voice.name}>
                {voice.name} ({voice.lang})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {sortedVoices.length === 0 && (
          <p className="text-muted-foreground mt-1 text-xs">
            No voices were reported yet. Some browsers load them a moment after the page
            opens.
          </p>
        )}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Speed</span>
            <span className="text-muted-foreground font-mono text-sm tabular-nums">
              {rate.toFixed(1)}x
            </span>
          </div>
          <Slider
            aria-label="Speech rate"
            value={[rate]}
            min={0.5}
            max={2}
            step={0.1}
            onValueChange={(value) => setRate(Array.isArray(value) ? value[0] : value)}
            className="mt-3"
          />
        </div>
        <div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Pitch</span>
            <span className="text-muted-foreground font-mono text-sm tabular-nums">
              {pitch.toFixed(1)}
            </span>
          </div>
          <Slider
            aria-label="Speech pitch"
            value={[pitch]}
            min={0}
            max={2}
            step={0.1}
            onValueChange={(value) => setPitch(Array.isArray(value) ? value[0] : value)}
            className="mt-3"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button size="sm" onClick={speak} disabled={!text.trim()}>
          <Play className="size-4" />
          {status === "idle" ? "Read aloud" : "Start again"}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={togglePause}
          disabled={status === "idle"}
        >
          <Pause className="size-4" />
          {status === "paused" ? "Resume" : "Pause"}
        </Button>
        <Button variant="outline" size="sm" onClick={stop} disabled={status === "idle"}>
          <Square className="size-4" />
          Stop
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            stop()
            setText("")
          }}
          disabled={!text}
        >
          Clear
        </Button>
      </div>

      <div className="border-border/60 text-muted-foreground flex items-start gap-2 rounded-lg border p-3 text-sm">
        <Info className="mt-0.5 size-4 shrink-0" />
        <span>
          The speech is produced by voices installed on your device, so playback cannot be
          saved as an audio file. Browsers do not expose the synthesised audio stream to a
          web page. Use a desktop application if you need a downloadable recording.
        </span>
      </div>
    </div>
  )
}
