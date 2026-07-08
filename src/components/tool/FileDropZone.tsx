import { useId, useState, type DragEvent } from "react"
import { UploadCloud } from "lucide-react"
import { cn } from "@/lib/utils"

interface FileDropZoneProps {
  accept: string
  multiple?: boolean
  onFiles: (files: File[]) => void
  hint: string
}

export function FileDropZone({
  accept,
  multiple = false,
  onFiles,
  hint,
}: FileDropZoneProps) {
  const [dragging, setDragging] = useState(false)
  const inputId = useId()

  function handleDrop(e: DragEvent<HTMLLabelElement>) {
    e.preventDefault()
    setDragging(false)
    const files = Array.from(e.dataTransfer.files)
    if (files.length) onFiles(multiple ? files : [files[0]])
  }

  return (
    <label
      htmlFor={inputId}
      onDragOver={(e) => {
        e.preventDefault()
        setDragging(true)
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      className={cn(
        "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-10 text-center transition-colors",
        dragging ? "border-primary bg-primary/5" : "border-border/60 hover:border-border",
      )}
    >
      <UploadCloud className="text-muted-foreground size-8" aria-hidden />
      <p className="text-sm font-medium">Drop a file here or click to browse</p>
      <p className="text-muted-foreground text-xs">{hint}</p>
      <input
        id={inputId}
        name="file"
        type="file"
        accept={accept}
        multiple={multiple}
        className="sr-only"
        onChange={(e) => {
          const files = Array.from(e.target.files ?? [])
          if (files.length) onFiles(files)
          e.target.value = ""
        }}
      />
    </label>
  )
}
