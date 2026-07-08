import { Moon, Sun, Monitor } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useTheme } from "@/hooks/use-theme"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" size="icon" aria-label="Toggle theme">
            <Sun className="size-4.5 scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
            <Moon className="absolute size-4.5 scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
          </Button>
        }
      />
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => setTheme("light")}
          aria-checked={theme === "light"}
        >
          <Sun className="size-4" /> Light
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("dark")}
          aria-checked={theme === "dark"}
        >
          <Moon className="size-4" /> Dark
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("system")}
          aria-checked={theme === "system"}
        >
          <Monitor className="size-4" /> System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
