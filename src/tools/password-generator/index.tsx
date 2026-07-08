import { useEffect, useState } from "react"
import { Copy, Check, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { StrengthMeter } from "@/components/tool/StrengthMeter"
import { secureRandomChar } from "@/lib/secure-random"
import { estimatePasswordStrength } from "@/lib/password-strength"

const CHAR_SETS = {
  uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  lowercase: "abcdefghijklmnopqrstuvwxyz",
  numbers: "0123456789",
  symbols: "!@#$%^&*()_+-=[]{}|;:,.<>?",
} as const

type CharSetKey = keyof typeof CHAR_SETS

const OPTIONS: { key: CharSetKey; label: string }[] = [
  { key: "uppercase", label: "Uppercase (A-Z)" },
  { key: "lowercase", label: "Lowercase (a-z)" },
  { key: "numbers", label: "Numbers (0-9)" },
  { key: "symbols", label: "Symbols (!@#$...)" },
]

function generatePassword(length: number, enabled: Record<CharSetKey, boolean>): string {
  const pool = OPTIONS.filter((o) => enabled[o.key])
    .map((o) => CHAR_SETS[o.key])
    .join("")
  if (!pool) return ""
  let result = ""
  for (let i = 0; i < length; i++) result += secureRandomChar(pool)
  return result
}

export default function PasswordGenerator() {
  const [length, setLength] = useState(16)
  const [enabled, setEnabled] = useState<Record<CharSetKey, boolean>>({
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true,
  })
  const [password, setPassword] = useState("")
  const [copied, setCopied] = useState(false)

  const enabledCount = Object.values(enabled).filter(Boolean).length

  useEffect(() => {
    setPassword(generatePassword(length, enabled))
  }, [length, enabled])

  function toggleOption(key: CharSetKey) {
    setEnabled((prev) => {
      if (prev[key] && enabledCount === 1) return prev
      return { ...prev, [key]: !prev[key] }
    })
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(password)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const strength = estimatePasswordStrength(password)

  return (
    <div className="space-y-6">
      <div>
        <div className="flex gap-2">
          <Input
            id="password-generator-output"
            name="password"
            value={password}
            readOnly
            className="font-mono text-base"
            aria-label="Generated password"
          />
          <Button
            variant="outline"
            size="icon"
            aria-label="Regenerate password"
            onClick={() => setPassword(generatePassword(length, enabled))}
          >
            <RefreshCw className="size-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            aria-label="Copy password"
            onClick={handleCopy}
            disabled={!password}
          >
            {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
          </Button>
        </div>
        <div className="mt-3">
          <StrengthMeter strength={strength} />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Length</span>
          <span className="text-muted-foreground text-sm tabular-nums">{length}</span>
        </div>
        <Slider
          aria-label="Password length"
          className="mt-2"
          min={8}
          max={64}
          value={[length]}
          onValueChange={(value) => setLength(Array.isArray(value) ? value[0] : value)}
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {OPTIONS.map(({ key, label }) => (
          <div
            key={key}
            className="border-border/60 flex items-center justify-between rounded-lg border px-3 py-2.5"
          >
            <Label htmlFor={`password-generator-${key}`} className="text-sm font-normal">
              {label}
            </Label>
            <Switch
              id={`password-generator-${key}`}
              name={key}
              checked={enabled[key]}
              onCheckedChange={() => toggleOption(key)}
              disabled={enabled[key] && enabledCount === 1}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
