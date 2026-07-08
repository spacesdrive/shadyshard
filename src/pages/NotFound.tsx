import { Link } from "react-router"
import { Button } from "@/components/ui/button"
import { Seo } from "@/components/seo/Seo"

export default function NotFound() {
  return (
    <>
      <Seo
        title="Page not found"
        description="The page you're looking for doesn't exist."
        path="/404"
        noindex
      />
      <div className="mx-auto flex max-w-2xl flex-col items-center px-4 py-24 text-center sm:px-6">
        <p className="text-primary text-sm font-medium">404</p>
        <h1 className="mt-2 text-3xl font-semibold">Page not found</h1>
        <p className="text-muted-foreground mt-2">
          The page you're looking for doesn't exist or may have moved.
        </p>
        <Button render={<Link to="/" />} className="mt-6">
          Back to homepage
        </Button>
      </div>
    </>
  )
}
