import { useState } from "react"
import { AlertCircle, CheckCircle2, XCircle } from "lucide-react"
import { FileDropZone } from "@/components/tool/FileDropZone"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { HASH_ALGORITHMS, hashFile, type HashAlgorithm } from "@/lib/hash"

const LENGTH_TO_ALGORITHM: Record<number, HashAlgorithm> = {
  40: "SHA-1",
  64: "SHA-256",
  96: "SHA-384",
  128: "SHA-512",
}

export default function ChecksumVerifier() {
  const [file, setFile] = useState<File | null>(null)
  const [expected, setExpected] = useState("")
  const [algorithm, setAlgorithm] = useState<HashAlgorithm>("SHA-256")
  const [result, setResult] = useState<{ match: boolean; computed: string } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [processing, setProcessing] = useState(false)

  function handleFile(files: File[]) {
    setFile(files[0])
    setResult(null)
    setError(null)
  }

  function handleExpectedChange(value: string) {
    setExpected(value)
    setResult(null)
    const cleaned = value.replace(/\s+/g, "")
    const detected = LENGTH_TO_ALGORITHM[cleaned.length]
    if (detected) setAlgorithm(detected)
  }

  async function verify() {
    if (!file) return
    const cleaned = expected.replace(/\s+/g, "").toLowerCase()
    if (!cleaned) {
      setError("Enter the expected checksum to compare against.")
      return
    }
    setProcessing(true)
    setError(null)
    try {
      const computed = await hashFile(file, algorithm)
      setResult({ match: computed === cleaned, computed })
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not compute this file's hash.")
    } finally {
      setProcessing(false)
    }
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
          <p className="truncate text-sm font-medium">{file.name}</p>

          <div>
            <Label htmlFor="checksum-expected">Expected checksum</Label>
            <Input
              id="checksum-expected"
              name="expected"
              value={expected}
              onChange={(e) => handleExpectedChange(e.target.value)}
              placeholder="Paste the published checksum here"
              className="mt-1.5 font-mono text-sm"
            />
          </div>

          <div className="w-40">
            <Label htmlFor="checksum-algorithm">Algorithm</Label>
            <Select
              value={algorithm}
              onValueChange={(value) => value && setAlgorithm(value as HashAlgorithm)}
            >
              <SelectTrigger id="checksum-algorithm" className="mt-1.5 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {HASH_ALGORITHMS.map((alg) => (
                  <SelectItem key={alg} value={alg}>
                    {alg}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              onClick={verify}
              disabled={processing || !expected.trim()}
            >
              {processing ? "Verifying..." : "Verify"}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setFile(null)
                setExpected("")
                setResult(null)
              }}
            >
              Reset
            </Button>
          </div>

          {result && (
            <div
              className={
                result.match
                  ? "flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-600 dark:text-emerald-400"
                  : "border-destructive/30 bg-destructive/10 text-destructive flex items-center gap-2 rounded-lg border p-3 text-sm"
              }
            >
              {result.match ? (
                <CheckCircle2 className="size-4 shrink-0" />
              ) : (
                <XCircle className="size-4 shrink-0" />
              )}
              <span>
                {result.match
                  ? "Checksum matches - the file is intact."
                  : `Checksum does not match. Computed: ${result.computed}`}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
