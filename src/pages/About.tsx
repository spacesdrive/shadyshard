import { Seo } from "@/components/seo/Seo"
import { site } from "@/lib/site"

export default function About() {
  return (
    <>
      <Seo
        title="About"
        description={`Learn about ${site.name}'s mission to build fast, private, browser-based tools.`}
        path="/about"
      />
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <h1 className="text-3xl font-semibold">About {site.name}</h1>
        <div className="text-muted-foreground mt-6 space-y-4">
          <p>
            {site.name} is a growing collection of fast, free, browser-based tools. Every
            tool runs entirely on your device - nothing you type, upload, or generate ever
            touches a server.
          </p>
          <p>
            We built {site.name} because most "free" online tools quietly upload your
            files, track your usage, or bury the tool behind accounts and ads. We think
            utilities this simple shouldn't require any of that.
          </p>
          <p>
            No uploads. No accounts. No tracking. Just tools that work, instantly, in your
            browser.
          </p>
        </div>
      </div>
    </>
  )
}
