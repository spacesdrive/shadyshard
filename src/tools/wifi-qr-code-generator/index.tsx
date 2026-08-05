import { useEffect, useMemo, useRef, useState } from "react"
import QRCode from "qrcode"
import { AlertCircle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CopyButton } from "@/components/tool/CopyButton"
import { downloadBlob } from "@/lib/download"

const SECURITY_TYPES = [
  { value: "WPA", label: "WPA / WPA2 / WPA3 (most common)" },
  { value: "SAE", label: "WPA3 only (SAE)" },
  { value: "WEP", label: "WEP (legacy)" },
  { value: "nopass", label: "Open network, no password" },
] as const

type SecurityType = (typeof SECURITY_TYPES)[number]["value"]

/**
 * The WIFI payload uses ";" and ":" as separators, so those characters plus
 * "\", "," and '"' have to be backslash-escaped inside a value. A value that
 * reads as raw hexadecimal must also be quoted, or a reader is entitled to
 * decode it as bytes rather than as text. The length and parity conditions
 * keep ordinary words that happen to use only hex letters, such as "cafe" or
 * "facade", out of that rule, since quoting those breaks more readers than it
 * fixes; real hex keys are 10, 26, or 64 characters.
 */
function escapeValue(value: string): string {
  const escaped = value.replace(/([\\;,:"])/g, "\\$1")
  const looksLikeRawHex =
    value.length >= 8 && value.length % 2 === 0 && /^[0-9a-fA-F]+$/.test(value)
  return looksLikeRawHex ? `"${escaped}"` : escaped
}

function buildPayload(
  ssid: string,
  security: SecurityType,
  password: string,
  hidden: boolean,
): string {
  const parts = [`T:${security === "nopass" ? "nopass" : security}`]
  parts.push(`S:${escapeValue(ssid)}`)
  if (security !== "nopass") parts.push(`P:${escapeValue(password)}`)
  if (hidden) parts.push("H:true")
  return `WIFI:${parts.join(";")};;`
}

export default function WifiQrCodeGenerator() {
  const [ssid, setSsid] = useState("")
  const [security, setSecurity] = useState<SecurityType>("WPA")
  const [password, setPassword] = useState("")
  const [hidden, setHidden] = useState(false)
  const [size, setSize] = useState(256)
  const [renderError, setRenderError] = useState<string | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const payload = useMemo(
    () => (ssid ? buildPayload(ssid, security, password, hidden) : ""),
    [ssid, security, password, hidden],
  )

  const problems = useMemo(() => {
    const found: string[] = []
    if (!ssid.trim())
      found.push(
        "Enter the network name exactly as it appears, including capital letters.",
      )
    if (security !== "nopass" && !password)
      found.push("Enter the network password, or switch to an open network.")
    if (security === "WPA" && password && (password.length < 8 || password.length > 63))
      found.push(
        "A WPA passphrase is between 8 and 63 characters. This one will not be accepted by most routers.",
      )
    if (ssid.length > 32)
      found.push("Network names are limited to 32 characters, so this one is too long.")
    return found
  }, [ssid, security, password])

  useEffect(() => {
    if (!canvasRef.current || !payload) {
      setRenderError(null)
      return
    }
    QRCode.toCanvas(canvasRef.current, payload, {
      width: size,
      errorCorrectionLevel: "M",
      margin: 2,
    })
      .then(() => setRenderError(null))
      .catch((error: unknown) =>
        setRenderError(
          error instanceof Error
            ? error.message
            : "Could not generate a QR code for this network.",
        ),
      )
  }, [payload, size])

  function handleDownload() {
    canvasRef.current?.toBlob((blob) => {
      if (blob)
        downloadBlob(blob, `wifi-${ssid.replace(/[^a-z0-9]+/gi, "-") || "network"}.png`)
    })
  }

  function handleReset() {
    setSsid("")
    setPassword("")
    setSecurity("WPA")
    setHidden(false)
    setSize(256)
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="wifi-ssid">Network name (SSID)</Label>
          <Input
            id="wifi-ssid"
            name="ssid"
            value={ssid}
            onChange={(event) => setSsid(event.target.value)}
            placeholder="Cafe Guest"
            className="mt-1.5"
            spellCheck={false}
            autoComplete="off"
          />
          <p className="text-muted-foreground mt-1 text-xs">
            Network names are case sensitive.
          </p>
        </div>

        <div>
          <Label htmlFor="wifi-security">Security</Label>
          <Select
            value={security}
            onValueChange={(value) => value && setSecurity(value as SecurityType)}
          >
            <SelectTrigger id="wifi-security" className="mt-1.5 w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SECURITY_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {security !== "nopass" && (
        <div>
          <Label htmlFor="wifi-password">Password</Label>
          <Input
            id="wifi-password"
            name="password"
            type="text"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Network password"
            className="mt-1.5 font-mono text-sm"
            spellCheck={false}
            autoComplete="off"
          />
          <p className="text-muted-foreground mt-1 text-xs">
            Shown as plain text on purpose, so you can check it before printing.
          </p>
        </div>
      )}

      <div className="flex items-center gap-2">
        <Switch
          id="wifi-hidden"
          name="hidden"
          checked={hidden}
          onCheckedChange={setHidden}
        />
        <Label htmlFor="wifi-hidden" className="font-normal">
          This network is hidden and does not broadcast its name
        </Label>
      </div>

      <div>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Image size</span>
          <span className="text-muted-foreground text-sm tabular-nums">{size}px</span>
        </div>
        <Slider
          aria-label="QR code size in pixels"
          className="mt-2"
          min={128}
          max={640}
          step={32}
          value={[size]}
          onValueChange={(value) => setSize(Array.isArray(value) ? value[0] : value)}
        />
      </div>

      {security === "WEP" && (
        <div className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-700 dark:text-amber-400">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <span>
            WEP has been broken for years and can be cracked in minutes. The code will
            still work, but move the network to WPA2 or WPA3 if the router allows it.
          </span>
        </div>
      )}

      {problems.length > 0 && (
        <div className="border-destructive/30 bg-destructive/10 text-destructive flex items-start gap-2 rounded-lg border p-3 text-sm">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <ul className="space-y-1">
            {problems.map((problem) => (
              <li key={problem}>{problem}</li>
            ))}
          </ul>
        </div>
      )}

      {renderError && <p className="text-destructive text-sm">{renderError}</p>}

      {payload && problems.length === 0 && (
        <div className="border-border/60 flex flex-col items-center gap-4 rounded-xl border bg-white p-6">
          <canvas
            ref={canvasRef}
            role="img"
            aria-label={`WiFi QR code for the network ${ssid}`}
          />
        </div>
      )}

      <div>
        <Label htmlFor="wifi-payload">Encoded payload</Label>
        <Input
          id="wifi-payload"
          name="payload"
          value={payload}
          readOnly
          className="mt-1.5 font-mono text-sm"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          onClick={handleDownload}
          disabled={!payload || problems.length > 0}
        >
          Download PNG
        </Button>
        <CopyButton value={payload} label="Copy payload" />
        <Button type="button" variant="outline" size="sm" onClick={handleReset}>
          Reset
        </Button>
      </div>

      <p className="text-muted-foreground text-sm">
        A WiFi QR code stores the password in plain text. Anyone who photographs the
        printed code can read it, so treat the printout the same way you would treat the
        password written on a card.
      </p>
    </div>
  )
}
