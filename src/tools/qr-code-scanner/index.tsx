import { useEffect, useRef, useState } from "react"
import jsQR from "jsqr"
import { Camera, CameraOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { FileDropZone } from "@/components/tool/FileDropZone"
import { CopyButton } from "@/components/tool/CopyButton"
import { loadImageFromFile } from "@/lib/image"

export default function QrCodeScanner() {
  const [result, setResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [scanning, setScanning] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const frameRef = useRef<number | null>(null)

  function stopCamera() {
    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current)
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
    setScanning(false)
  }

  useEffect(() => stopCamera, [])

  async function startCamera() {
    setError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }
      setScanning(true)
      tick()
    } catch {
      setError(
        "Could not access the camera. Check your browser's camera permission for this site.",
      )
    }
  }

  function tick() {
    const video = videoRef.current
    if (!video || video.readyState !== video.HAVE_ENOUGH_DATA) {
      frameRef.current = requestAnimationFrame(tick)
      return
    }
    const canvas = document.createElement("canvas")
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext("2d")
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const code = jsQR(imageData.data, imageData.width, imageData.height)
      if (code) {
        setResult(code.data)
        stopCamera()
        return
      }
    }
    frameRef.current = requestAnimationFrame(tick)
  }

  async function handleFile(files: File[]) {
    setError(null)
    setResult(null)
    try {
      const img = await loadImageFromFile(files[0])
      const canvas = document.createElement("canvas")
      canvas.width = img.naturalWidth
      canvas.height = img.naturalHeight
      const ctx = canvas.getContext("2d")
      if (!ctx) return
      ctx.drawImage(img, 0, 0)
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const code = jsQR(imageData.data, imageData.width, imageData.height)
      if (code) {
        setResult(code.data)
      } else {
        setError("No QR code was found in this image.")
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not read this image.")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {!scanning ? (
          <Button size="sm" onClick={startCamera}>
            <Camera className="size-4" />
            Scan with camera
          </Button>
        ) : (
          <Button size="sm" variant="outline" onClick={stopCamera}>
            <CameraOff className="size-4" />
            Stop camera
          </Button>
        )}
      </div>

      {scanning && (
        <video
          ref={videoRef}
          className="border-border/60 max-h-80 w-full rounded-lg border object-contain"
          muted
          playsInline
        >
          <track kind="captions" />
        </video>
      )}

      {!scanning && (
        <FileDropZone
          accept="image/*"
          onFiles={handleFile}
          hint="Upload an image containing a QR code"
        />
      )}

      {error && <p className="text-destructive text-sm">{error}</p>}

      {result && (
        <div className="border-border/60 space-y-2 rounded-lg border p-4">
          <p className="text-sm font-medium">Decoded content</p>
          <p className="text-muted-foreground text-sm break-all">{result}</p>
          <CopyButton value={result} label="Copy result" />
        </div>
      )}
    </div>
  )
}
