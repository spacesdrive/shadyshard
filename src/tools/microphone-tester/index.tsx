import { useCallback, useEffect, useRef, useState } from "react"
import { AlertCircle, Mic, Square } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface StreamInfo {
  sampleRate: number
  channels: number
  label: string
}

export default function MicrophoneTester() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const contextRef = useRef<AudioContext | null>(null)
  const frameRef = useRef(0)

  const [listening, setListening] = useState(false)
  const [level, setLevel] = useState(0)
  const [peak, setPeak] = useState(0)
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([])
  const [deviceId, setDeviceId] = useState("")
  const [info, setInfo] = useState<StreamInfo | null>(null)
  const [error, setError] = useState<string | null>(null)

  const stop = useCallback(() => {
    cancelAnimationFrame(frameRef.current)
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
    void contextRef.current?.close()
    contextRef.current = null
    setListening(false)
    setLevel(0)
    setInfo(null)
  }, [])

  useEffect(() => stop, [stop])

  async function refreshDevices() {
    if (!navigator.mediaDevices?.enumerateDevices) return
    const all = await navigator.mediaDevices.enumerateDevices()
    setDevices(all.filter((device) => device.kind === "audioinput"))
  }

  async function start() {
    setError(null)

    if (!navigator.mediaDevices?.getUserMedia) {
      setError("This browser does not expose microphone access to web pages.")
      return
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: deviceId ? { deviceId: { exact: deviceId } } : true,
      })
      streamRef.current = stream

      const context = new AudioContext()
      contextRef.current = context
      const analyser = context.createAnalyser()
      analyser.fftSize = 2048
      context.createMediaStreamSource(stream).connect(analyser)

      const track = stream.getAudioTracks()[0]
      const settings = track.getSettings()
      setInfo({
        sampleRate: settings.sampleRate ?? context.sampleRate,
        channels: settings.channelCount ?? 1,
        label: track.label || "Default microphone",
      })

      setListening(true)
      setPeak(0)
      void refreshDevices()

      const samples = new Float32Array(analyser.fftSize)
      const tick = () => {
        analyser.getFloatTimeDomainData(samples)

        let sumOfSquares = 0
        for (const sample of samples) sumOfSquares += sample * sample
        const rms = Math.sqrt(sumOfSquares / samples.length)
        const percentage = Math.min(100, Math.round(rms * 250))

        setLevel(percentage)
        setPeak((current) => Math.max(current, percentage))
        drawWaveform(canvasRef.current, samples)
        frameRef.current = requestAnimationFrame(tick)
      }
      frameRef.current = requestAnimationFrame(tick)
    } catch (caught) {
      const name = caught instanceof DOMException ? caught.name : ""
      setError(
        name === "NotAllowedError"
          ? "Microphone access was denied. Allow it in the browser's site permissions and try again."
          : name === "NotFoundError"
            ? "No microphone was found. Connect one and try again."
            : "The microphone could not be opened. Another application may be using it.",
      )
      stop()
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-4">
        <div className="min-w-56 flex-1 space-y-2">
          <Label htmlFor="microphone-device">Microphone</Label>
          <Select
            value={deviceId || "default"}
            onValueChange={(value) =>
              setDeviceId(value === "default" ? "" : (value ?? ""))
            }
          >
            <SelectTrigger id="microphone-device" name="device" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">System default</SelectItem>
              {devices.map((device, index) => (
                <SelectItem key={device.deviceId} value={device.deviceId}>
                  {device.label || `Microphone ${index + 1}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {listening ? (
          <Button variant="outline" onClick={stop}>
            <Square className="size-4" />
            Stop test
          </Button>
        ) : (
          <Button onClick={start}>
            <Mic className="size-4" />
            Start test
          </Button>
        )}
      </div>

      {error && (
        <p role="alert" className="text-destructive flex items-start gap-2 text-sm">
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
          {error}
        </p>
      )}

      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">Input level</span>
          <span className="text-muted-foreground tabular-nums">
            {level}% now, {peak}% peak
          </span>
        </div>
        <Progress value={level} aria-label="Live microphone input level" />
      </div>

      <canvas
        ref={canvasRef}
        width={800}
        height={160}
        className="border-border/60 bg-muted/30 h-40 w-full rounded-lg border"
        aria-label="Live microphone waveform"
        role="img"
      />

      {listening && info && (
        <dl className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {[
            { term: "Device", value: info.label },
            { term: "Sample rate", value: `${info.sampleRate} Hz` },
            { term: "Channels", value: String(info.channels) },
          ].map(({ term, value }) => (
            <div key={term} className="border-border/60 rounded-lg border p-3">
              <dt className="text-muted-foreground text-xs">{term}</dt>
              <dd className="mt-1 text-sm break-words">{value}</dd>
            </div>
          ))}
        </dl>
      )}

      {!listening && !error && (
        <p className="text-muted-foreground text-sm">
          Start the test and speak normally. The audio is analysed in this page and is
          never recorded or sent anywhere.
        </p>
      )}
    </div>
  )
}

function drawWaveform(canvas: HTMLCanvasElement | null, samples: Float32Array) {
  const context = canvas?.getContext("2d")
  if (!canvas || !context) return

  const { width, height } = canvas
  context.clearRect(0, 0, width, height)
  // currentColor resolves against the canvas element, so the waveform follows
  // the active theme without hard-coding a light or dark colour.
  context.strokeStyle = getComputedStyle(canvas).color
  context.lineWidth = 2
  context.beginPath()

  const step = width / samples.length
  samples.forEach((sample, index) => {
    const y = (1 - sample) * (height / 2)
    if (index === 0) context.moveTo(0, y)
    else context.lineTo(index * step, y)
  })
  context.stroke()
}
