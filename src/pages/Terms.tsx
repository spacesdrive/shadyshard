import { Seo } from "@/components/seo/Seo"
import { site } from "@/lib/site"

export default function Terms() {
  return (
    <>
      <Seo
        title="Terms of Service"
        description={`Terms of service for using ${site.name}.`}
        path="/terms"
      />
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <h1 className="text-3xl font-semibold">Terms of Service</h1>
        <div className="text-muted-foreground mt-6 space-y-6">
          <section>
            <h2 className="text-foreground text-lg font-medium">Use of tools</h2>
            <p className="mt-2">
              {site.name} provides free browser-based tools "as is," without warranty of
              any kind. You are responsible for verifying results before relying on them
              for critical or professional use.
            </p>
          </section>
          <section>
            <h2 className="text-foreground text-lg font-medium">No liability</h2>
            <p className="mt-2">
              We are not liable for any loss or damage arising from your use of these
              tools, including data loss, since all processing happens locally on your
              device and outside our control.
            </p>
          </section>
          <section>
            <h2 className="text-foreground text-lg font-medium">Acceptable use</h2>
            <p className="mt-2">
              Do not use {site.name} for unlawful purposes or in a way that could damage,
              disable, or impair the site.
            </p>
          </section>
          <section>
            <h2 className="text-foreground text-lg font-medium">Changes</h2>
            <p className="mt-2">
              We may update these terms at any time. Continued use of the site constitutes
              acceptance of the updated terms.
            </p>
          </section>
        </div>
      </div>
    </>
  )
}
