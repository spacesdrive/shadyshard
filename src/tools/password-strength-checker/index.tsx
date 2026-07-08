import { useState } from "react"
import { Eye, EyeOff, Check, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { StrengthMeter } from "@/components/tool/StrengthMeter"
import { estimatePasswordStrength } from "@/lib/password-strength"

const CRITERIA: {
  key: keyof ReturnType<typeof estimatePasswordStrength>["criteria"]
  label: string
}[] = [
  { key: "minLength", label: "At least 12 characters" },
  { key: "hasUppercase", label: "Contains an uppercase letter" },
  { key: "hasLowercase", label: "Contains a lowercase letter" },
  { key: "hasNumber", label: "Contains a number" },
  { key: "hasSymbol", label: "Contains a symbol" },
]

export default function PasswordStrengthChecker() {
  const [password, setPassword] = useState("")
  const [visible, setVisible] = useState(false)
  const strength = estimatePasswordStrength(password)

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        <Input
          id="password-strength-input"
          name="password"
          type={visible ? "text" : "password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Type a password to check..."
          className="font-mono text-base"
          aria-label="Password to check"
          autoComplete="off"
          spellCheck={false}
        />
        <Button
          variant="outline"
          size="icon"
          aria-label={visible ? "Hide password" : "Show password"}
          onClick={() => setVisible((v) => !v)}
        >
          {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </Button>
      </div>

      <StrengthMeter strength={strength} />

      <ul className="grid gap-2 sm:grid-cols-2">
        {CRITERIA.map(({ key, label }) => {
          const met = strength.criteria[key]
          return (
            <li
              key={key}
              className="text-muted-foreground flex items-center gap-2 text-sm"
            >
              {met ? (
                <Check className="size-4 shrink-0 text-emerald-500" aria-hidden />
              ) : (
                <X className="text-muted-foreground/50 size-4 shrink-0" aria-hidden />
              )}
              <span className={met ? "text-foreground" : undefined}>{label}</span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
