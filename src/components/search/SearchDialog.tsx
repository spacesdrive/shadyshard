import { useEffect, useState } from "react"
import { useNavigate } from "react-router"
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { useSearchIndex } from "@/hooks/use-search-index"

interface SearchDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SearchDialog({ open, onOpenChange }: SearchDialogProps) {
  const [query, setQuery] = useState("")
  const results = useSearchIndex(query)
  const navigate = useNavigate()

  useEffect(() => {
    if (!open) setQuery("")
  }, [open])

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Search tools"
      description="Find a tool by name, category, or keyword"
    >
      <Command shouldFilter={false}>
        <CommandInput
          placeholder="Search 500+ tools..."
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          <CommandEmpty>No tools found.</CommandEmpty>
          <CommandGroup heading={query ? "Results" : "Popular tools"}>
            {results.map(({ meta }) => (
              <CommandItem
                key={meta.slug}
                value={meta.slug}
                onSelect={() => {
                  onOpenChange(false)
                  navigate(`/tools/${meta.slug}`)
                }}
              >
                <meta.icon className="size-4" />
                <div className="flex flex-col">
                  <span>{meta.title}</span>
                  <span className="text-muted-foreground text-xs">
                    {meta.description}
                  </span>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </Command>
    </CommandDialog>
  )
}
