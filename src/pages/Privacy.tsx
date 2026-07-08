import { Seo } from "@/components/seo/Seo"
import { site } from "@/lib/site"

export default function Privacy() {
  return (
    <>
      <Seo
        title="Privacy Policy"
        description={`${site.name}'s privacy policy - everything runs locally, we don't collect your data.`}
        path="/privacy"
      />
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <h1 className="text-3xl font-semibold">Privacy Policy</h1>
        <div className="text-muted-foreground mt-6 space-y-6">
          <section>
            <h2 className="text-foreground text-lg font-medium">
              We don't collect your data
            </h2>
            <p className="mt-2">
              Every tool on {site.name} runs entirely in your browser using client-side
              JavaScript. Files you select, text you type, and results you generate are
              processed locally on your device and are never uploaded to our servers.
            </p>
          </section>
          <section>
            <h2 className="text-foreground text-lg font-medium">No accounts</h2>
            <p className="mt-2">
              {site.name} does not require registration, so we don't collect names,
              emails, or passwords.
            </p>
          </section>
          <section>
            <h2 className="text-foreground text-lg font-medium">
              Hosting &amp; basic analytics
            </h2>
            <p className="mt-2">
              This site is served as static files. Our hosting provider may log standard,
              anonymized request metadata (such as IP address and user agent) for security
              and performance purposes, in line with their own privacy practices.
            </p>
          </section>
          <section>
            <h2 className="text-foreground text-lg font-medium">Changes</h2>
            <p className="mt-2">
              If this policy changes, the updated version will be posted on this page.
            </p>
          </section>
        </div>
      </div>
    </>
  )
}
