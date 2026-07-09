import { useState } from "react"
import { AlertCircle } from "lucide-react"
import { FileDropZone } from "@/components/tool/FileDropZone"
import { DownloadButton } from "@/components/tool/DownloadButton"
import { PageRangeInput } from "@/components/tool/PageRangeInput"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { rotatePages, pdfBytesToBlob, countPdfPages } from "@/lib/pdf"
import { parsePageRange } from "@/lib/page-range"

type Scope = "all" | "range"

export default function PdfPageRotator() {
  const [file, setFile] = useState<File | null>(null)
  const [totalPages, setTotalPages] = useState<number | null>(null)
  const [scope, setScope] = useState<Scope>("all")
  const [range, setRange] = useState("")
  const [angle, setAngle] = useState("90")
  const [error, setError] = useState<string | null>(null)
  const [processing, setProcessing] = useState(false)

  async function handleFile(files: File[]) {
    const selected = files[0]
    setError(null)
    setFile(selected)
    try {
      setTotalPages(await countPdfPages(selected))
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not read this PDF.")
      setFile(null)
    }
  }

  async function getRotatedBlob() {
    if (!file || totalPages === null) return null
    setProcessing(true)
    setError(null)
    try {
      const targets = scope === "all" ? "all" : parsePageRange(range, totalPages)
      const bytes = await rotatePages(file, targets, Number(angle))
      return pdfBytesToBlob(bytes)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not rotate these pages.")
      return null
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div className="space-y-5">
      {!file && (
        <FileDropZone accept="application/pdf" onFiles={handleFile} hint="One PDF file" />
      )}

      {error && (
        <div className="border-destructive/30 bg-destructive/10 text-destructive flex items-start gap-2 rounded-lg border p-3 text-sm">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {file && totalPages !== null && (
        <div className="space-y-4">
          <p className="text-sm font-medium">{file.name}</p>

          <Tabs value={scope} onValueChange={(value) => setScope(value as Scope)}>
            <TabsList>
              <TabsTrigger value="all">All pages</TabsTrigger>
              <TabsTrigger value="range">Specific pages</TabsTrigger>
            </TabsList>
          </Tabs>

          {scope === "range" && (
            <PageRangeInput
              id="pdf-rotator-range"
              value={range}
              onChange={setRange}
              totalPages={totalPages}
              label="Pages to rotate"
            />
          )}

          <div className="w-40">
            <Label htmlFor="pdf-rotator-angle">Rotate by</Label>
            <Select value={angle} onValueChange={(value) => value && setAngle(value)}>
              <SelectTrigger id="pdf-rotator-angle" className="mt-1.5 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="90">90 degrees</SelectItem>
                <SelectItem value="180">180 degrees</SelectItem>
                <SelectItem value="270">270 degrees</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-wrap gap-2">
            <DownloadButton
              getBlob={getRotatedBlob}
              filename={`${file.name.replace(/\.pdf$/i, "")}-rotated.pdf`}
              label={processing ? "Rotating..." : "Rotate and download"}
              disabled={(scope === "range" && !range.trim()) || processing}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setFile(null)
                setTotalPages(null)
                setRange("")
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
