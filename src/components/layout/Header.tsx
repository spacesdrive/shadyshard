import { useEffect, useState } from "react"
import { Link } from "react-router"
import { Menu, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { ThemeToggle } from "@/components/layout/ThemeToggle"
import { SearchDialog } from "@/components/search/SearchDialog"
import { categories } from "@/lib/categories"
import { site } from "@/lib/site"

export function Header() {
  const [searchOpen, setSearchOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault()
        setSearchOpen((open) => !open)
      }
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [])

  return (
    <header className="border-border/60 bg-background/80 sticky top-0 z-40 border-b backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2 font-semibold">
          <span>{site.name}</span>
        </Link>

        <nav className="text-muted-foreground hidden items-center gap-6 text-sm md:flex">
          {categories.slice(0, 5).map((category) => (
            <Link
              key={category.slug}
              to={`/category/${category.slug}`}
              className="hover:text-foreground transition-colors"
            >
              {category.title}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="text-muted-foreground hidden w-56 justify-start gap-2 sm:flex"
            onClick={() => setSearchOpen(true)}
          >
            <Search className="size-4" />
            <span>Search tools...</span>
            <kbd className="border-border bg-muted ml-auto rounded border px-1.5 py-0.5 text-[10px]">
              Ctrl K
            </kbd>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="sm:hidden"
            aria-label="Search"
            onClick={() => setSearchOpen(true)}
          >
            <Search className="size-4.5" />
          </Button>

          <ThemeToggle />

          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden"
                  aria-label="Open menu"
                >
                  <Menu className="size-4.5" />
                </Button>
              }
            />
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle>Categories</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-1 px-4 pb-4">
                {categories.map((category) => (
                  <Link
                    key={category.slug}
                    to={`/category/${category.slug}`}
                    onClick={() => setMobileOpen(false)}
                    className="hover:bg-muted flex items-center gap-3 rounded-md px-2 py-2 text-sm"
                  >
                    <category.icon className="text-muted-foreground size-4" />
                    {category.title}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
    </header>
  )
}
