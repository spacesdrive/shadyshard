import { useEffect, useRef, useState } from "react"
import QRCode from "qrcode"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { downloadBlob } from "@/lib/download"

const ERROR_LEVELS = ["L", "M", "Q", "H"] as const

export default function QrCodeGenerator() {
  const [text, setText] = useState("https://shadyshard.com")
  const [size, setSize] = useState(256)
  const [errorLevel, setErrorLevel] = useState<(typeof ERROR_LEVELS)[number]>("M")
  const [error, setError] = useState<string | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current) return
    if (!text) {
      setError(null)
      return
    }
    QRCode.toCanvas(canvasRef.current, text, {
      width: size,
      errorCorrectionLevel: errorLevel,
    })
      .then(() => setError(null))
      .catch((e: unknown) =>
        setError(
          e instanceof Error ? e.message : "Could not generate a QR code for this input.",
        ),
      )
  }, [text, size, errorLevel])

  function handleDownload() {
    canvasRef.current?.toBlob((blob) => {
      if (blob) downloadBlob(blob, "qr-code.png")
    })
  }

  return (
    <div className="space-y-6">
      <Textarea
        id="qr-generator-input"
        name="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type a URL or any text to encode..."
        className="min-h-24 resize-y text-sm"
        aria-label="Text to encode as a QR code"
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Size</span>
            <span className="text-muted-foreground text-sm tabular-nums">{size}px</span>
          </div>
          <Slider
            aria-label="QR code size"
            className="mt-2"
            min={128}
            max={512}
            step={16}
            value={[size]}
            onValueChange={(v) => setSize(Array.isArray(v) ? v[0] : v)}
          />
        </div>
        <div>
          <span className="text-sm font-medium">Error correction</span>
          <div
            className="mt-1.5 flex gap-1.5"
            role="group"
            aria-label="Error correction level"
          >
            {ERROR_LEVELS.map((level) => (
              <Button
                key={level}
                variant={level === errorLevel ? "default" : "outline"}
                size="sm"
                onClick={() => setErrorLevel(level)}
              >
                {level}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {error && <p className="text-destructive text-sm">{error}</p>}

      <div className="border-border/60 flex flex-col items-center gap-4 rounded-xl border p-6">
        <canvas ref={canvasRef} role="img" aria-label={`QR code for: ${text}`} />
        <Button size="sm" onClick={handleDownload} disabled={!text || Boolean(error)}>
          Download PNG
        </Button>
      </div>
    </div>
  )
}
