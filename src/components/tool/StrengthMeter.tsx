import { cn } from "@/lib/utils"
import type { PasswordStrength } from "@/lib/password-strength"

const SCORE_COLORS = [
  "bg-destructive",
  "bg-destructive",
  "bg-amber-500",
  "bg-lime-500",
  "bg-emerald-500",
]

export function StrengthMeter({ strength }: { strength: PasswordStrength }) {
  const { score, label, entropyBits } = strength

  return (
    <div>
      <div className="flex gap-1" role="img" aria-label={`Password strength: ${label}`}>
        {Array.from({ length: 5 }, (_, index) => (
          <div
            key={index}
            className={cn(
              "bg-muted h-1.5 flex-1 rounded-full transition-colors",
              index <= score && SCORE_COLORS[score],
            )}
          />
        ))}
      </div>
      <div className="text-muted-foreground mt-1.5 flex items-center justify-between text-xs">
        <span>{label}</span>
        {entropyBits > 0 && <span>{entropyBits} bits of entropy</span>}
      </div>
    </div>
  )
}
