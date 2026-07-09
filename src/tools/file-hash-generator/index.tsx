import { useState } from "react"
import { AlertCircle } from "lucide-react"
import { FileDropZone } from "@/components/tool/FileDropZone"
import { CopyButton } from "@/components/tool/CopyButton"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { HASH_ALGORITHMS, hashFile, type HashAlgorithm } from "@/lib/hash"
import { formatBytes } from "@/lib/image"

export default function FileHashGenerator() {
  const [file, setFile] = useState<File | null>(null)
  const [algorithm, setAlgorithm] = useState<HashAlgorithm>("SHA-256")
  const [hash, setHash] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [processing, setProcessing] = useState(false)

  async function compute(selected: File, alg: HashAlgorithm) {
    setProcessing(true)
    setError(null)
    try {
      setHash(await hashFile(selected, alg))
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not hash this file.")
    } finally {
      setProcessing(false)
    }
  }

  async function handleFile(files: File[]) {
    const selected = files[0]
    setFile(selected)
    await compute(selected, algorithm)
  }

  async function handleAlgorithmChange(value: HashAlgorithm) {
    setAlgorithm(value)
    if (file) await compute(file, value)
  }

  return (
    <div className="space-y-5">
      {!file && <FileDropZone accept="*/*" onFiles={handleFile} hint="Any file" />}

      {error && (
        <div className="border-destructive/30 bg-destructive/10 text-destructive flex items-start gap-2 rounded-lg border p-3 text-sm">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {file && (
        <div className="space-y-4">
          <p className="text-sm">
            <span className="truncate font-medium">{file.name}</span> -{" "}
            {formatBytes(file.size)}
          </p>

          <Tabs
            value={algorithm}
            onValueChange={(value) => handleAlgorithmChange(value as HashAlgorithm)}
          >
            <TabsList>
              {HASH_ALGORITHMS.map((alg) => (
                <TabsTrigger key={alg} value={alg}>
                  {alg}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          <div className="border-border/60 rounded-lg border p-3 font-mono text-sm break-all">
            {processing ? "Hashing..." : hash || "-"}
          </div>

          <div className="flex flex-wrap gap-2">
            <CopyButton value={hash} label="Copy hash" />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setFile(null)
                setHash("")
              }}
            >
              Reset
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
