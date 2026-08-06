import { useCallback, useEffect, useRef, useState } from "react"
import { AlertCircle, Camera, Square } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

interface StreamInfo {
  label: string
  width: number
  height: number
  frameRate: number
}

export default function WebcamTester() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const [running, setRunning] = useState(false)
  const [mirrored, setMirrored] = useState(true)
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([])
  const [deviceId, setDeviceId] = useState("")
  const [info, setInfo] = useState<StreamInfo | null>(null)
  const [error, setError] = useState<string | null>(null)

  const stop = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
    if (videoRef.current) videoRef.current.srcObject = null
    setRunning(false)
    setInfo(null)
  }, [])

  useEffect(() => stop, [stop])

  async function start() {
    setError(null)

    if (!navigator.mediaDevices?.getUserMedia) {
      setError("This browser does not expose camera access to web pages.")
      return
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: deviceId ? { deviceId: { exact: deviceId } } : true,
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }

      const track = stream.getVideoTracks()[0]
      const settings = track.getSettings()
      setInfo({
        label: track.label || "Default camera",
        width: settings.width ?? 0,
        height: settings.height ?? 0,
        frameRate: Math.round(settings.frameRate ?? 0),
      })
      setRunning(true)

      const all = await navigator.mediaDevices.enumerateDevices()
      setDevices(all.filter((device) => device.kind === "videoinput"))
    } catch (caught) {
      const name = caught instanceof DOMException ? caught.name : ""
      setError(
        name === "NotAllowedError"
          ? "Camera access was denied. Allow it in the browser's site permissions and try again."
          : name === "NotFoundError"
            ? "No camera was found. Connect one and try again."
            : "The camera could not be opened. Another application is probably using it.",
      )
      stop()
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-4">
        <div className="min-w-56 flex-1 space-y-2">
          <Label htmlFor="webcam-device">Camera</Label>
          <Select
            value={deviceId || "default"}
            onValueChange={(value) =>
              setDeviceId(value === "default" ? "" : (value ?? ""))
            }
          >
            <SelectTrigger id="webcam-device" name="device" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">System default</SelectItem>
              {devices.map((device, index) => (
                <SelectItem key={device.deviceId} value={device.deviceId}>
                  {device.label || `Camera ${index + 1}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {running ? (
          <Button variant="outline" onClick={stop}>
            <Square className="size-4" />
            Stop test
          </Button>
        ) : (
          <Button onClick={start}>
            <Camera className="size-4" />
            Start test
          </Button>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Switch
          id="webcam-mirror"
          name="mirrored"
          checked={mirrored}
          onCheckedChange={setMirrored}
        />
        <Label htmlFor="webcam-mirror">Mirror the preview</Label>
      </div>

      {error && (
        <p role="alert" className="text-destructive flex items-start gap-2 text-sm">
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
          {error}
        </p>
      )}

      <div className="border-border/60 bg-muted/30 overflow-hidden rounded-lg border">
        <video
          ref={videoRef}
          playsInline
          muted
          className={cn("aspect-video w-full object-contain", mirrored && "scale-x-[-1]")}
          aria-label="Live camera preview"
        />
      </div>

      {running && info && (
        <dl className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {[
            { term: "Device", value: info.label },
            {
              term: "Resolution",
              value: info.width ? `${info.width} x ${info.height}` : "unknown",
            },
            {
              term: "Frame rate",
              value: info.frameRate ? `${info.frameRate} fps` : "unknown",
            },
          ].map(({ term, value }) => (
            <div key={term} className="border-border/60 rounded-lg border p-3">
              <dt className="text-muted-foreground text-xs">{term}</dt>
              <dd className="mt-1 text-sm break-words">{value}</dd>
            </div>
          ))}
        </dl>
      )}

      {!running && !error && (
        <p className="text-muted-foreground text-sm">
          Start the test to see your camera's picture. The video stays in this page and is
          never recorded or uploaded.
        </p>
      )}
    </div>
  )
}
