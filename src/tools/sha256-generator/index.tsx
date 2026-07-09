import { useEffect, useState } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CopyButton } from "@/components/tool/CopyButton"
import { HASH_ALGORITHMS, hashText, type HashAlgorithm } from "@/lib/hash"

export default function Sha256Generator() {
  const [input, setInput] = useState("")
  const [algorithm, setAlgorithm] = useState<HashAlgorithm>("SHA-256")
  const [hash, setHash] = useState("")

  useEffect(() => {
    if (!input) {
      setHash("")
      return
    }
    let cancelled = false
    hashText(input, algorithm).then((result) => {
      if (!cancelled) setHash(result)
    })
    return () => {
      cancelled = true
    }
  }, [input, algorithm])

  return (
    <div className="space-y-4">
      <Textarea
        id="sha256-generator-input"
        name="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type or paste text to hash..."
        className="min-h-40 resize-y font-mono text-sm"
        aria-label="Text to hash"
      />

      <Tabs
        value={algorithm}
        onValueChange={(value) => setAlgorithm(value as HashAlgorithm)}
      >
        <TabsList>
          {HASH_ALGORITHMS.map((alg) => (
            <TabsTrigger key={alg} value={alg}>
              {alg}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="flex gap-2">
        <Textarea
          id="sha256-generator-output"
          name="hash"
          value={hash}
          readOnly
          placeholder="Hash appears here..."
          className="min-h-16 resize-none font-mono text-sm"
          aria-label={`${algorithm} hash output`}
        />
      </div>
      <CopyButton value={hash} label="Copy hash" />
    </div>
  )
}
