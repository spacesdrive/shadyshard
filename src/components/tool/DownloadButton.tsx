import { Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { downloadBlob } from "@/lib/download"

interface DownloadButtonProps {
  getBlob: () => Blob | null | Promise<Blob | null>
  filename: string
  label?: string
  disabled?: boolean
}

export function DownloadButton({
  getBlob,
  filename,
  label = "Download",
  disabled = false,
}: DownloadButtonProps) {
  return (
    <Button
      variant="outline"
      size="sm"
      disabled={disabled}
      onClick={async () => {
        const blob = await getBlob()
        if (blob) downloadBlob(blob, filename)
      }}
    >
      <Download className="size-4" />
      {label}
    </Button>
  )
}
