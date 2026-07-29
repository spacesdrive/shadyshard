import { useEffect, useState } from "react"
import { AlertCircle, MapPin, RotateCcw } from "lucide-react"
import { load as loadMetadata, type ExpandedTags } from "exifreader"
import { Button } from "@/components/ui/button"
import { FileDropZone } from "@/components/tool/FileDropZone"
import { CopyButton } from "@/components/tool/CopyButton"
import { DownloadButton } from "@/components/tool/DownloadButton"
import { formatBytes } from "@/lib/image"

/** Tags whose values are binary blobs or raw dumps rather than readable text. */
const SKIPPED_TAGS = new Set(["Thumbnail", "Images", "MakerNote", "_raw", "UserComment"])
const MAX_VALUE_LENGTH = 300

interface Entry {
  name: string
  value: string
}

function describe(tag: unknown): string | null {
  if (tag === null || tag === undefined) return null
  if (typeof tag === "number") return String(tag)
  if (typeof tag === "string") return tag.trim() || null

  if (typeof tag === "object") {
    const record = tag as { description?: unknown; value?: unknown }
    const candidate =
      typeof record.description === "string" && record.description.trim()
        ? record.description
        : typeof record.value === "string" || typeof record.value === "number"
          ? String(record.value)
          : null
    if (!candidate) return null
    return candidate.length > MAX_VALUE_LENGTH
      ? `${candidate.slice(0, MAX_VALUE_LENGTH)}...`
      : candidate
  }

  return null
}

function readGroup(group: unknown): Entry[] {
  if (!group || typeof group !== "object") return []
  return Object.entries(group as Record<string, unknown>)
    .filter(([name]) => !SKIPPED_TAGS.has(name))
    .map(([name, tag]) => ({ name, value: describe(tag) }))
    .filter((entry): entry is Entry => entry.value !== null)
}

const GROUP_LABELS: { key: keyof ExpandedTags; label: string }[] = [
  { key: "file", label: "File" },
  { key: "exif", label: "EXIF" },
  { key: "composite", label: "Derived" },
  { key: "iptc", label: "IPTC" },
  { key: "xmp", label: "XMP" },
  { key: "icc", label: "Colour profile" },
  { key: "png", label: "PNG" },
  { key: "gif", label: "GIF" },
]

interface Result {
  fileName: string
  fileSize: number
  groups: { label: string; entries: Entry[] }[]
  coordinates: { latitude: number; longitude: number; altitude: number | null } | null
  json: string
}

export default function ImageMetadataViewer() {
  const [result, setResult] = useState<Result | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  async function handleFiles(files: File[]) {
    const file = files[0]
    setLoading(true)
    setError(null)
    setResult(null)

    setPreviewUrl((current) => {
      if (current) URL.revokeObjectURL(current)
      return URL.createObjectURL(file)
    })

    try {
      const tags = await loadMetadata(file, { expanded: true })
      const groups = GROUP_LABELS.map(({ key, label }) => ({
        label,
        entries: readGroup(tags[key]),
      })).filter((group) => group.entries.length > 0)

      const gps = tags.gps
      const coordinates =
        gps && typeof gps.Latitude === "number" && typeof gps.Longitude === "number"
          ? {
              latitude: gps.Latitude,
              longitude: gps.Longitude,
              altitude: typeof gps.Altitude === "number" ? gps.Altitude : null,
            }
          : null

      if (groups.length === 0 && !coordinates) {
        setError(
          "No metadata was found in this image. It was probably stripped by the app or platform that produced it.",
        )
        setLoading(false)
        return
      }

      setResult({
        fileName: file.name,
        fileSize: file.size,
        groups,
        coordinates,
        json: JSON.stringify(
          Object.fromEntries(
            groups.map((group) => [
              group.label,
              Object.fromEntries(group.entries.map((entry) => [entry.name, entry.value])),
            ]),
          ),
          null,
          2,
        ),
      })
    } catch (thrown) {
      setError(
        thrown instanceof Error
          ? `This file could not be read: ${thrown.message}`
          : "This file could not be read as an image.",
      )
    } finally {
      setLoading(false)
    }
  }

  function reset() {
    setResult(null)
    setError(null)
    setPreviewUrl((current) => {
      if (current) URL.revokeObjectURL(current)
      return null
    })
  }

  return (
    <div className="space-y-5">
      {!result && !previewUrl && (
        <FileDropZone
          accept="image/*"
          onFiles={handleFiles}
          hint="JPEG, PNG, WebP, HEIC, AVIF, TIFF, or GIF"
        />
      )}

      {loading && <p className="text-muted-foreground text-sm">Reading metadata...</p>}

      {error && (
        <div className="border-destructive/30 bg-destructive/10 text-destructive flex items-start gap-2 rounded-lg border p-3 text-sm">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {previewUrl && (
        <div className="border-border/60 flex flex-wrap items-center gap-4 rounded-lg border p-3">
          <img
            src={previewUrl}
            alt="Selected image preview"
            className="size-20 rounded object-cover"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">
              {result?.fileName ?? "Selected image"}
            </p>
            {result && (
              <p className="text-muted-foreground text-xs tabular-nums">
                {formatBytes(result.fileSize)}
              </p>
            )}
          </div>
          <Button variant="outline" size="sm" onClick={reset}>
            <RotateCcw className="size-4" />
            Choose another image
          </Button>
        </div>
      )}

      {result?.coordinates && (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm">
          <div className="flex items-center gap-2 font-medium text-amber-700 dark:text-amber-400">
            <MapPin className="size-4 shrink-0" />
            <span>This photo contains GPS coordinates</span>
          </div>
          <p className="mt-2 font-mono tabular-nums">
            {result.coordinates.latitude.toFixed(6)},{" "}
            {result.coordinates.longitude.toFixed(6)}
            {result.coordinates.altitude !== null &&
              ` (${result.coordinates.altitude.toFixed(1)} m)`}
          </p>
          <p className="text-muted-foreground mt-2 text-xs">
            Anyone with the original file can read this. Strip it with the EXIF Remover
            before publishing the image.
          </p>
          <div className="mt-2">
            <CopyButton
              value={`${result.coordinates.latitude}, ${result.coordinates.longitude}`}
              label="Copy coordinates"
            />
          </div>
        </div>
      )}

      {result && (
        <>
          <div className="flex flex-wrap gap-2">
            <CopyButton value={result.json} label="Copy as JSON" />
            <DownloadButton
              getBlob={() => new Blob([result.json], { type: "application/json" })}
              filename="image-metadata.json"
            />
          </div>

          {result.groups.map((group) => (
            <div key={group.label}>
              <h3 className="text-sm font-medium">
                {group.label}
                <span className="text-muted-foreground ml-2 text-xs font-normal tabular-nums">
                  {group.entries.length} tags
                </span>
              </h3>
              <div className="mt-2 overflow-x-auto">
                <table className="w-full text-sm">
                  <caption className="sr-only">{group.label} metadata tags</caption>
                  <thead>
                    <tr className="border-border/60 border-b text-left">
                      <th scope="col" className="w-1/3 py-2 pr-4 font-medium">
                        Tag
                      </th>
                      <th scope="col" className="py-2 font-medium">
                        Value
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {group.entries.map((entry) => (
                      <tr
                        key={entry.name}
                        className="border-border/40 border-b last:border-0"
                      >
                        <td className="py-2 pr-4 align-top font-mono text-xs">
                          {entry.name}
                        </td>
                        <td className="py-2 align-top break-words">{entry.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  )
}
