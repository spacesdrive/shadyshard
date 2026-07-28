import { useState } from "react"
import { TriangleAlert } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { CopyButton } from "@/components/tool/CopyButton"

const DIRECTIVES = [
  "default-src",
  "script-src",
  "style-src",
  "img-src",
  "font-src",
  "connect-src",
  "media-src",
  "object-src",
  "frame-src",
  "frame-ancestors",
  "form-action",
  "base-uri",
  "worker-src",
] as const

type Directive = (typeof DIRECTIVES)[number]
type Policy = Record<Directive, string>

function policyFrom(entries: Partial<Policy>): Policy {
  return Object.fromEntries(
    DIRECTIVES.map((directive) => [directive, entries[directive] ?? ""]),
  ) as Policy
}

const PRESETS: { name: string; description: string; policy: Policy }[] = [
  {
    name: "Strict",
    description: "Nothing loads unless you allow it explicitly.",
    policy: policyFrom({
      "default-src": "'none'",
      "script-src": "'self'",
      "style-src": "'self'",
      "img-src": "'self' data:",
      "font-src": "'self'",
      "connect-src": "'self'",
      "object-src": "'none'",
      "frame-ancestors": "'none'",
      "form-action": "'self'",
      "base-uri": "'none'",
    }),
  },
  {
    name: "Moderate",
    description: "Same-origin by default, with room for inline styles and HTTPS images.",
    policy: policyFrom({
      "default-src": "'self'",
      "script-src": "'self'",
      "style-src": "'self' 'unsafe-inline'",
      "img-src": "'self' data: https:",
      "font-src": "'self' data:",
      "connect-src": "'self'",
      "object-src": "'none'",
      "frame-ancestors": "'self'",
      "form-action": "'self'",
      "base-uri": "'self'",
    }),
  },
  {
    name: "Basic",
    description: "A single default-src, as a starting point to tighten from.",
    policy: policyFrom({ "default-src": "'self'" }),
  },
]

function warningsFor(policy: Policy): string[] {
  const warnings: string[] = []
  const script = policy["script-src"] || policy["default-src"]
  const style = policy["style-src"] || policy["default-src"]

  if (/'unsafe-inline'/.test(script)) {
    warnings.push(
      "script-src allows 'unsafe-inline', which permits any injected inline script to run. Use a nonce or a hash instead.",
    )
  }
  if (/'unsafe-eval'/.test(script)) {
    warnings.push(
      "script-src allows 'unsafe-eval', which keeps eval and new Function available to injected code.",
    )
  }
  if (/\*(\s|$)/.test(script)) {
    warnings.push(
      "script-src contains a bare wildcard, which allows scripts from any host.",
    )
  }
  if (/'unsafe-inline'/.test(style)) {
    warnings.push(
      "style-src allows 'unsafe-inline'. This is common and much lower risk than inline scripts, but a nonce is still stronger.",
    )
  }
  if (!policy["default-src"].trim()) {
    warnings.push(
      "No default-src is set, so any directive you have not listed falls back to allowing everything.",
    )
  }
  if (!policy["object-src"].trim() && !/'none'/.test(policy["default-src"])) {
    warnings.push(
      "object-src is not restricted. Setting it to 'none' blocks legacy plugin content that can bypass script rules.",
    )
  }
  if (!policy["frame-ancestors"].trim()) {
    warnings.push(
      "frame-ancestors is not set, so this policy does not protect against clickjacking.",
    )
  }
  return warnings
}

export default function CspHeaderGenerator() {
  const [policy, setPolicy] = useState<Policy>(PRESETS[1].policy)
  const [reportOnly, setReportOnly] = useState(false)
  const [upgradeInsecure, setUpgradeInsecure] = useState(true)

  const parts = DIRECTIVES.filter((directive) => policy[directive].trim()).map(
    (directive) => `${directive} ${policy[directive].trim().replace(/\s+/g, " ")}`,
  )
  if (upgradeInsecure) parts.push("upgrade-insecure-requests")

  const value = parts.join("; ")
  const headerName = reportOnly
    ? "Content-Security-Policy-Report-Only"
    : "Content-Security-Policy"
  const header = value ? `${headerName}: ${value}` : ""
  const metaTag = value ? `<meta http-equiv="${headerName}" content="${value}">` : ""

  const warnings = warningsFor(policy)

  return (
    <div className="space-y-5">
      <div>
        <span className="text-sm font-medium">Presets</span>
        <div className="mt-2 flex flex-wrap gap-2">
          {PRESETS.map((preset) => (
            <Button
              key={preset.name}
              type="button"
              variant="outline"
              size="sm"
              title={preset.description}
              onClick={() => setPolicy(preset.policy)}
            >
              {preset.name}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {DIRECTIVES.map((directive) => (
          <div key={directive}>
            <Label htmlFor={`csp-${directive}`} className="font-mono text-xs">
              {directive}
            </Label>
            <Input
              id={`csp-${directive}`}
              name={directive}
              value={policy[directive]}
              onChange={(event) =>
                setPolicy((current) => ({ ...current, [directive]: event.target.value }))
              }
              placeholder="'self'"
              className="mt-1.5 font-mono text-sm"
            />
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-6">
        <div className="flex items-center gap-2">
          <Switch
            id="csp-report-only"
            name="reportOnly"
            checked={reportOnly}
            onCheckedChange={setReportOnly}
          />
          <Label htmlFor="csp-report-only" className="font-normal">
            Report-only mode
          </Label>
        </div>
        <div className="flex items-center gap-2">
          <Switch
            id="csp-upgrade"
            name="upgradeInsecure"
            checked={upgradeInsecure}
            onCheckedChange={setUpgradeInsecure}
          />
          <Label htmlFor="csp-upgrade" className="font-normal">
            upgrade-insecure-requests
          </Label>
        </div>
      </div>

      {warnings.length > 0 && (
        <div className="border-border/60 bg-muted/30 rounded-lg border p-3">
          <p className="flex items-center gap-2 text-sm font-medium">
            <TriangleAlert className="size-4 shrink-0" />
            Things worth checking
          </p>
          <ul className="text-muted-foreground mt-2 space-y-1.5 text-sm">
            {warnings.map((warning) => (
              <li key={warning} className="flex gap-2">
                <span className="bg-muted-foreground mt-2 size-1 shrink-0 rounded-full" />
                {warning}
              </li>
            ))}
          </ul>
        </div>
      )}

      {value ? (
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">HTTP response header</span>
              <CopyButton value={header} label="Copy header" />
            </div>
            <pre className="border-border/60 bg-muted/30 mt-2 overflow-auto rounded-lg border p-3 font-mono text-xs break-all whitespace-pre-wrap">
              {header}
            </pre>
          </div>
          <div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Meta tag equivalent</span>
              <CopyButton value={metaTag} label="Copy meta tag" />
            </div>
            <pre className="border-border/60 bg-muted/30 mt-2 overflow-auto rounded-lg border p-3 font-mono text-xs break-all whitespace-pre-wrap">
              {metaTag}
            </pre>
          </div>
        </div>
      ) : (
        <p className="text-muted-foreground text-sm">
          Fill in at least one directive to generate a policy.
        </p>
      )}

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => {
          setPolicy(policyFrom({}))
          setReportOnly(false)
          setUpgradeInsecure(false)
        }}
      >
        Clear all directives
      </Button>
    </div>
  )
}
