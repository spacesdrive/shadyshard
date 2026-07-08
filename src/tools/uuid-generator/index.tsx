import { useState } from "react"
import { Copy, Check, RefreshCw, ClipboardCopy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

const MIN_QUANTITY = 1
const MAX_QUANTITY = 50

function formatUuid(uuid: string, uppercase: boolean, removeHyphens: boolean): string {
  let result = uuid
  if (removeHyphens) result = result.replace(/-/g, "")
  if (uppercase) result = result.toUpperCase()
  return result
}

function generateUuids(quantity: number): string[] {
  return Array.from({ length: quantity }, () => crypto.randomUUID())
}

export default function UuidGenerator() {
  const [quantity, setQuantity] = useState(5)
  const [uppercase, setUppercase] = useState(false)
  const [removeHyphens, setRemoveHyphens] = useState(false)
  const [uuids, setUuids] = useState<string[]>(() => generateUuids(5))
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
  const [copiedAll, setCopiedAll] = useState(false)

  const formatted = uuids.map((u) => formatUuid(u, uppercase, removeHyphens))

  function handleGenerate() {
    const clamped = Math.min(MAX_QUANTITY, Math.max(MIN_QUANTITY, quantity))
    setQuantity(clamped)
    setUuids(generateUuids(clamped))
  }

  async function handleCopyOne(value: string, index: number) {
    await navigator.clipboard.writeText(value)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 1500)
  }

  async function handleCopyAll() {
    await navigator.clipboard.writeText(formatted.join("\n"))
    setCopiedAll(true)
    setTimeout(() => setCopiedAll(false), 1500)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <Label htmlFor="uuid-generator-quantity">Quantity</Label>
          <Input
            id="uuid-generator-quantity"
            name="quantity"
            type="number"
            min={MIN_QUANTITY}
            max={MAX_QUANTITY}
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            className="mt-1.5 w-24"
          />
        </div>
        <Button onClick={handleGenerate}>
          <RefreshCw className="size-4" />
          Generate
        </Button>
        <Button variant="outline" onClick={handleCopyAll} disabled={!formatted.length}>
          {copiedAll ? (
            <Check className="size-4" />
          ) : (
            <ClipboardCopy className="size-4" />
          )}
          {copiedAll ? "Copied all" : "Copy all"}
        </Button>
      </div>

      <div className="flex flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <Switch
            id="uuid-generator-uppercase"
            name="uppercase"
            checked={uppercase}
            onCheckedChange={setUppercase}
          />
          <Label htmlFor="uuid-generator-uppercase" className="font-normal">
            Uppercase
          </Label>
        </div>
        <div className="flex items-center gap-2">
          <Switch
            id="uuid-generator-remove-hyphens"
            name="removeHyphens"
            checked={removeHyphens}
            onCheckedChange={setRemoveHyphens}
          />
          <Label htmlFor="uuid-generator-remove-hyphens" className="font-normal">
            Remove hyphens
          </Label>
        </div>
      </div>

      <ul className="space-y-2">
        {formatted.map((uuid, index) => (
          <li
            key={index}
            className="border-border/60 flex items-center gap-2 rounded-lg border px-3 py-2"
          >
            <code className="flex-1 truncate font-mono text-sm">{uuid}</code>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={`Copy UUID ${index + 1}`}
              onClick={() => handleCopyOne(uuid, index)}
            >
              {copiedIndex === index ? (
                <Check className="size-3.5" />
              ) : (
                <Copy className="size-3.5" />
              )}
            </Button>
          </li>
        ))}
      </ul>
    </div>
  )
}
