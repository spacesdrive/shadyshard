import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface PageRangeInputProps {
  id: string
  value: string
  onChange: (value: string) => void
  totalPages: number
  label?: string
}

/** Shared "1-3,5,8-9" page-range text field, used by every PDF tool that lets a user pick specific pages. Parsing/validation lives in lib/page-range.ts. */
export function PageRangeInput({
  id,
  value,
  onChange,
  totalPages,
  label = "Pages",
}: PageRangeInputProps) {
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        name="pageRange"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={`e.g. 1-3,5,${totalPages}`}
        className="mt-1.5"
      />
      <p className="text-muted-foreground mt-1 text-xs">
        This PDF has {totalPages} page{totalPages === 1 ? "" : "s"}. Use commas for
        individual pages and hyphens for ranges.
      </p>
    </div>
  )
}
