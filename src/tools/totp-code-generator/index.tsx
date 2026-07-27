import { useCallback, useEffect, useMemo, useState } from "react"
import { AlertCircle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CopyButton } from "@/components/tool/CopyButton"

const BASE32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567"
const ALGORITHMS = ["SHA-1", "SHA-256", "SHA-512"] as const
type Algorithm = (typeof ALGORITHMS)[number]

function decodeBase32(secret: string): Uint8Array<ArrayBuffer> {
  const cleaned = secret.replace(/[\s-]/g, "").replace(/=+$/, "").toUpperCase()
  if (!cleaned) throw new Error("Enter a Base32 secret.")

  let bits = 0
  let value = 0
  const bytes: number[] = []

  for (const char of cleaned) {
    const index = BASE32_ALPHABET.indexOf(char)
    if (index === -1) {
      throw new Error(
        `"${char}" is not a Base32 character. Valid characters are A to Z and 2 to 7.`,
      )
    }
    value = (value << 5) | index
    bits += 5
    if (bits >= 8) {
      bits -= 8
      bytes.push((value >>> bits) & 255)
    }
  }

  if (bytes.length === 0) throw new Error("This secret is too short to produce a code.")
  return new Uint8Array(bytes)
}

async function generateCode(
  key: Uint8Array<ArrayBuffer>,
  counter: number,
  digits: number,
  algorithm: Algorithm,
): Promise<string> {
  const message = new Uint8Array(8)
  let remaining = counter
  for (let i = 7; i >= 0; i--) {
    message[i] = remaining & 255
    remaining = Math.floor(remaining / 256)
  }

  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    key,
    { name: "HMAC", hash: algorithm },
    false,
    ["sign"],
  )
  const signature = new Uint8Array(await crypto.subtle.sign("HMAC", cryptoKey, message))
  const offset = signature[signature.length - 1] & 0x0f
  const binary =
    ((signature[offset] & 0x7f) << 24) |
    (signature[offset + 1] << 16) |
    (signature[offset + 2] << 8) |
    signature[offset + 3]

  return String(binary % 10 ** digits).padStart(digits, "0")
}

interface OtpauthSettings {
  secret: string
  digits?: number
  period?: number
  algorithm?: Algorithm
  label?: string
}

function parseOtpauth(value: string): OtpauthSettings | null {
  if (!value.trim().toLowerCase().startsWith("otpauth://")) return null

  let url: URL
  try {
    url = new URL(value.trim())
  } catch {
    throw new Error("This otpauth:// URI could not be parsed.")
  }

  const secret = url.searchParams.get("secret")
  if (!secret) throw new Error("This otpauth:// URI has no secret parameter.")

  const rawAlgorithm = url.searchParams.get("algorithm")?.toUpperCase()
  const algorithm = ALGORITHMS.find(
    (candidate) => candidate.replace("-", "") === rawAlgorithm?.replace("-", ""),
  )

  return {
    secret,
    digits: Number(url.searchParams.get("digits")) || undefined,
    period: Number(url.searchParams.get("period")) || undefined,
    algorithm,
    label: decodeURIComponent(url.pathname.replace(/^\/+/, "")) || undefined,
  }
}

export default function TotpCodeGenerator() {
  const [rawSecret, setRawSecret] = useState("")
  const [digits, setDigits] = useState("6")
  const [period, setPeriod] = useState("30")
  const [algorithm, setAlgorithm] = useState<Algorithm>("SHA-1")
  const [codes, setCodes] = useState<{ current: string; next: string } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(interval)
  }, [])

  const settings = useMemo((): {
    secret: string
    applied: OtpauthSettings | null
    error: string | null
  } => {
    if (!rawSecret.trim()) return { secret: "", applied: null, error: null }
    try {
      const parsed = parseOtpauth(rawSecret)
      return { secret: parsed ? parsed.secret : rawSecret, applied: parsed, error: null }
    } catch (e) {
      return {
        secret: "",
        applied: null,
        error: e instanceof Error ? e.message : "This secret could not be read.",
      }
    }
  }, [rawSecret])

  const applied = settings.applied
  const effectiveDigits = applied?.digits ?? Number(digits)
  const effectivePeriod = applied?.period ?? Number(period)
  const effectiveAlgorithm = applied?.algorithm ?? algorithm

  const step = Math.floor(now / 1000 / effectivePeriod)
  const secondsLeft = effectivePeriod - (Math.floor(now / 1000) % effectivePeriod)

  const refresh = useCallback(async () => {
    if (settings.error) {
      setError(settings.error)
      setCodes(null)
      return
    }
    if (!settings.secret) {
      setError(null)
      setCodes(null)
      return
    }
    try {
      const key = decodeBase32(settings.secret)
      const [current, next] = await Promise.all([
        generateCode(key, step, effectiveDigits, effectiveAlgorithm),
        generateCode(key, step + 1, effectiveDigits, effectiveAlgorithm),
      ])
      setCodes({ current, next })
      setError(null)
    } catch (e) {
      setCodes(null)
      setError(e instanceof Error ? e.message : "A code could not be generated.")
    }
  }, [settings.secret, settings.error, step, effectiveDigits, effectiveAlgorithm])

  useEffect(() => {
    void refresh()
  }, [refresh])

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="totp-secret">Base32 secret or otpauth:// URI</Label>
        <Input
          id="totp-secret"
          name="secret"
          value={rawSecret}
          onChange={(e) => setRawSecret(e.target.value)}
          placeholder="JBSWY3DPEHPK3PXP"
          className="mt-1.5 font-mono text-sm"
          autoComplete="off"
          spellCheck={false}
        />
        {applied?.label && (
          <p className="text-muted-foreground mt-1.5 text-xs">Account: {applied.label}</p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <Label htmlFor="totp-digits">Digits</Label>
          <Select
            value={String(effectiveDigits)}
            onValueChange={(value) => value && setDigits(value)}
          >
            <SelectTrigger
              id="totp-digits"
              className="mt-1.5 w-full"
              disabled={!!applied?.digits}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {["6", "7", "8"].map((value) => (
                <SelectItem key={value} value={value}>
                  {value}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="totp-period">Period (seconds)</Label>
          <Select
            value={String(effectivePeriod)}
            onValueChange={(value) => value && setPeriod(value)}
          >
            <SelectTrigger
              id="totp-period"
              className="mt-1.5 w-full"
              disabled={!!applied?.period}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {["30", "60"].map((value) => (
                <SelectItem key={value} value={value}>
                  {value}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="totp-algorithm">Algorithm</Label>
          <Select
            value={effectiveAlgorithm}
            onValueChange={(value) => value && setAlgorithm(value as Algorithm)}
          >
            <SelectTrigger
              id="totp-algorithm"
              className="mt-1.5 w-full"
              disabled={!!applied?.algorithm}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ALGORITHMS.map((value) => (
                <SelectItem key={value} value={value}>
                  {value}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {error && (
        <div className="border-destructive/30 bg-destructive/10 text-destructive flex items-start gap-2 rounded-lg border p-3 text-sm">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {codes && (
        <div className="border-border/60 space-y-3 rounded-lg border p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="font-mono text-4xl font-semibold tracking-widest tabular-nums">
              {codes.current}
            </p>
            <CopyButton value={codes.current} label="Copy code" />
          </div>
          <Progress
            value={(secondsLeft / effectivePeriod) * 100}
            aria-label="Time left in the current code window"
          />
          <p className="text-muted-foreground text-sm">
            Valid for {secondsLeft} more second{secondsLeft === 1 ? "" : "s"}. Next code:{" "}
            <span className="font-mono">{codes.next}</span>
          </p>
        </div>
      )}
    </div>
  )
}
