import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { FileDropZone } from "@/components/tool/FileDropZone"
import { CopyButton } from "@/components/tool/CopyButton"
import { hashFile } from "@/lib/hash"
import { formatBytes } from "@/lib/image"

interface HashedFile {
  name: string
  size: number
  lastModified: number
  hash: string
}

function identity(file: { name: string; size: number; lastModified: number }): string {
  return `${file.name}:${file.size}:${file.lastModified}`
}

export default function DuplicateFileFinder() {
  const [files, setFiles] = useState<HashedFile[]>([])
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleFiles(selected: File[]) {
    setError(null)
    const known = new Set(files.map(identity))
    const pending = selected.filter((file) => !known.has(identity(file)))
    if (pending.length === 0) return

    setProgress({ done: 0, total: pending.length })
    const hashed: HashedFile[] = []
    try {
      for (const [index, file] of pending.entries()) {
        hashed.push({
          name: file.name,
          size: file.size,
          lastModified: file.lastModified,
          hash: await hashFile(file, "SHA-256"),
        })
        setProgress({ done: index + 1, total: pending.length })
      }
      setFiles((current) => [...current, ...hashed])
    } catch (caught) {
      setError(
        caught instanceof Error
          ? `Could not read one of the files: ${caught.message}`
          : "Could not read one of the selected files.",
      )
    } finally {
      setProgress(null)
    }
  }

  const groups = useMemo(() => {
    const byHash = new Map<string, HashedFile[]>()
    for (const file of files) {
      const existing = byHash.get(file.hash)
      if (existing) existing.push(file)
      else byHash.set(file.hash, [file])
    }
    return [...byHash.values()]
      .filter((group) => group.length > 1)
      .sort((a, b) => b[0].size * (b.length - 1) - a[0].size * (a.length - 1))
  }, [files])

  const wastedBytes = groups.reduce(
    (total, group) => total + group[0].size * (group.length - 1),
    0,
  )

  const report = useMemo(
    () =>
      groups
        .map((group) =>
          [
            `${group[0].hash}  (${formatBytes(group[0].size)} each)`,
            ...group.map((file) => `  ${file.name}`),
          ].join("\n"),
        )
        .join("\n\n"),
    [groups],
  )

  return (
    <div className="space-y-4">
      <FileDropZone
        accept="*/*"
        multiple
        onFiles={handleFiles}
        hint="Select as many files as you like. They are hashed in your browser and never uploaded."
      />

      {progress && (
        <div>
          <p className="text-muted-foreground text-sm tabular-nums">
            Hashing {progress.done} of {progress.total} files
          </p>
          <Progress
            className="mt-2"
            value={(progress.done / progress.total) * 100}
            aria-label="Hashing progress"
          />
        </div>
      )}

      {error && <p className="text-destructive text-sm">{error}</p>}

      {files.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-4">
          <div className="border-border/60 rounded-lg border p-3">
            <p className="text-muted-foreground text-xs">Files checked</p>
            <p className="mt-1 text-lg font-semibold tabular-nums">{files.length}</p>
          </div>
          <div className="border-border/60 rounded-lg border p-3">
            <p className="text-muted-foreground text-xs">Duplicate groups</p>
            <p className="mt-1 text-lg font-semibold tabular-nums">{groups.length}</p>
          </div>
          <div className="border-border/60 rounded-lg border p-3">
            <p className="text-muted-foreground text-xs">Redundant copies</p>
            <p className="mt-1 text-lg font-semibold tabular-nums">
              {groups.reduce((total, group) => total + group.length - 1, 0)}
            </p>
          </div>
          <div className="border-border/60 rounded-lg border p-3">
            <p className="text-muted-foreground text-xs">Space they take up</p>
            <p className="mt-1 text-lg font-semibold tabular-nums">
              {formatBytes(wastedBytes)}
            </p>
          </div>
        </div>
      )}

      {files.length > 0 && groups.length === 0 && !progress && (
        <p className="text-muted-foreground text-sm">
          No duplicates among the {files.length} files checked. Every file has a distinct
          SHA-256 hash.
        </p>
      )}

      {groups.length > 0 && (
        <ul className="space-y-3">
          {groups.map((group) => (
            <li key={group[0].hash} className="border-border/60 rounded-lg border p-4">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="text-sm font-medium tabular-nums">
                  {group.length} identical files, {formatBytes(group[0].size)} each
                </p>
                <p className="text-muted-foreground font-mono text-xs break-all">
                  {group[0].hash.slice(0, 32)}
                </p>
              </div>
              <ul className="mt-2 space-y-1">
                {group.map((file, index) => (
                  <li
                    key={`${file.name}-${file.lastModified}-${index}`}
                    className="text-sm break-words"
                  >
                    {file.name}
                    {index === 0 && (
                      <span className="text-muted-foreground"> (keep this one)</span>
                    )}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      )}

      {files.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <CopyButton value={report} label="Copy duplicate list" />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setFiles([])
              setError(null)
            }}
          >
            Clear files
          </Button>
        </div>
      )}
    </div>
  )
}
