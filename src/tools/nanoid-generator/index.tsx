import { useState } from "react"
import { Copy, Check, RefreshCw, ClipboardCopy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { secureRandomString } from "@/lib/secure-random"

const DEFAULT_ALPHABET =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-"
const MIN_QUANTITY = 1
const MAX_QUANTITY = 50

export default function NanoidGenerator() {
  const [length, setLength] = useState(21)
  const [alphabet, setAlphabet] = useState(DEFAULT_ALPHABET)
  const [quantity, setQuantity] = useState(5)
  const [ids, setIds] = useState<string[]>(() =>
    Array.from({ length: 5 }, () => secureRandomString(21, DEFAULT_ALPHABET)),
  )
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
  const [copiedAll, setCopiedAll] = useState(false)

  const pool = alphabet.length > 0 ? alphabet : DEFAULT_ALPHABET

  function handleGenerate() {
    const clampedQuantity = Math.min(MAX_QUANTITY, Math.max(MIN_QUANTITY, quantity))
    setQuantity(clampedQuantity)
    setIds(
      Array.from({ length: clampedQuantity }, () => secureRandomString(length, pool)),
    )
  }

  async function handleCopyOne(value: string, index: number) {
    await navigator.clipboard.writeText(value)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 1500)
  }

  async function handleCopyAll() {
    await navigator.clipboard.writeText(ids.join("\n"))
    setCopiedAll(true)
    setTimeout(() => setCopiedAll(false), 1500)
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Length</span>
          <span className="text-muted-foreground text-sm tabular-nums">{length}</span>
        </div>
        <Slider
          aria-label="ID length"
          className="mt-2"
          min={5}
          max={36}
          value={[length]}
          onValueChange={(value) => setLength(Array.isArray(value) ? value[0] : value)}
        />
      </div>

      <div>
        <Label htmlFor="nanoid-generator-alphabet">Alphabet</Label>
        <Input
          id="nanoid-generator-alphabet"
          name="alphabet"
          value={alphabet}
          onChange={(e) => setAlphabet(e.target.value)}
          className="mt-1.5 font-mono text-sm"
          spellCheck={false}
        />
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <div>
          <Label htmlFor="nanoid-generator-quantity">Quantity</Label>
          <Input
            id="nanoid-generator-quantity"
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
        <Button variant="outline" onClick={handleCopyAll} disabled={!ids.length}>
          {copiedAll ? (
            <Check className="size-4" />
          ) : (
            <ClipboardCopy className="size-4" />
          )}
          {copiedAll ? "Copied all" : "Copy all"}
        </Button>
      </div>

      <ul className="space-y-2">
        {ids.map((id, index) => (
          <li
            key={index}
            className="border-border/60 flex items-center gap-2 rounded-lg border px-3 py-2"
          >
            <code className="flex-1 truncate font-mono text-sm">{id}</code>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={`Copy ID ${index + 1}`}
              onClick={() => handleCopyOne(id, index)}
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
