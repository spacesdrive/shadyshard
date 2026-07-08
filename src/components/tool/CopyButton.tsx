import { useState } from "react"
import { Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"

interface CopyButtonProps {
  value: string
  label?: string
  variant?: "outline" | "ghost" | "default"
  size?: "sm" | "default" | "icon" | "icon-sm"
}

export function CopyButton({
  value,
  label = "Copy",
  variant = "outline",
  size = "sm",
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    await navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const isIconOnly = size === "icon" || size === "icon-sm"

  return (
    <Button
      variant={variant}
      size={size}
      disabled={!value}
      onClick={handleCopy}
      aria-label={isIconOnly ? label : undefined}
    >
      {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
      {!isIconOnly && (copied ? "Copied" : label)}
    </Button>
  )
}
