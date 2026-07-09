import { Info } from "lucide-react"
import { IITM_UNOFFICIAL_NOTICE } from "@/lib/iitm-bs"

/** Shared disclaimer banner for every IITM BS Student Tools entry -- see lib/iitm-bs.ts for the exact wording and why it's needed. */
export function UnofficialToolNotice() {
  return (
    <div className="border-border/60 bg-muted/40 text-muted-foreground flex items-start gap-2 rounded-lg border p-3 text-xs">
      <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
      <span>{IITM_UNOFFICIAL_NOTICE}</span>
    </div>
  )
}
