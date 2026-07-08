import { Fragment } from "react"
import { Link } from "react-router"
import { ChevronRight, Home } from "lucide-react"

export interface BreadcrumbItem {
  name: string
  path: string
}

export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Breadcrumb" className="text-muted-foreground text-sm">
      <ol className="flex flex-wrap items-center gap-1.5">
        <li className="flex items-center gap-1.5">
          <Link
            to="/"
            aria-label="Home"
            className="hover:text-foreground flex items-center gap-1"
          >
            <Home className="size-3.5" />
          </Link>
        </li>
        {items.map((item, index) => (
          <Fragment key={item.path}>
            <li aria-hidden>
              <ChevronRight className="size-3.5" />
            </li>
            <li>
              {index === items.length - 1 ? (
                <span aria-current="page" className="text-foreground">
                  {item.name}
                </span>
              ) : (
                <Link to={item.path} className="hover:text-foreground">
                  {item.name}
                </Link>
              )}
            </li>
          </Fragment>
        ))}
      </ol>
    </nav>
  )
}
