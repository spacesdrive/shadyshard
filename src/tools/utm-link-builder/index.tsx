import { useMemo, useState } from "react"
import { AlertCircle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { CopyButton } from "@/components/tool/CopyButton"

interface ParameterField {
  key: string
  label: string
  placeholder: string
  required: boolean
  hint: string
}

const PARAMETERS: ParameterField[] = [
  {
    key: "utm_source",
    label: "Campaign source",
    placeholder: "newsletter",
    required: true,
    hint: "Where the traffic comes from, such as google or newsletter.",
  },
  {
    key: "utm_medium",
    label: "Campaign medium",
    placeholder: "email",
    required: true,
    hint: "The channel, such as email, cpc, or social.",
  },
  {
    key: "utm_campaign",
    label: "Campaign name",
    placeholder: "spring-launch",
    required: true,
    hint: "The campaign this link belongs to.",
  },
  {
    key: "utm_term",
    label: "Campaign term",
    placeholder: "project management",
    required: false,
    hint: "Paid search keyword, if this is an ad.",
  },
  {
    key: "utm_content",
    label: "Campaign content",
    placeholder: "header-button",
    required: false,
    hint: "Distinguishes two links pointing at the same page.",
  },
  {
    key: "utm_id",
    label: "Campaign id",
    placeholder: "2026-q3-launch",
    required: false,
    hint: "An identifier that matches the campaign in your ad platform.",
  },
]

function normalizeValue(value: string, normalize: boolean): string {
  const trimmed = value.trim()
  if (!normalize) return trimmed
  return trimmed.toLowerCase().replace(/\s+/g, "-")
}

export default function UtmLinkBuilder() {
  const [baseUrl, setBaseUrl] = useState("")
  const [values, setValues] = useState<Record<string, string>>({})
  const [normalize, setNormalize] = useState(true)

  const { url, error, missing } = useMemo(() => {
    const trimmed = baseUrl.trim()
    if (!trimmed) return { url: "", error: null, missing: [] as string[] }

    const invalidUrl = {
      url: "",
      missing: [] as string[],
      error: `"${trimmed}" is not a valid URL. Include the domain, for example https://example.com/page.`,
    }

    let parsed: URL
    try {
      parsed = new URL(trimmed.includes("://") ? trimmed : `https://${trimmed}`)
    } catch {
      return invalidUrl
    }

    // The URL parser percent-encodes a host it cannot make sense of rather
    // than throwing, so "not a url" silently becomes "not%20a%20url". Check
    // the host itself looks like a hostname before accepting it.
    if (
      !/^https?:$/.test(parsed.protocol) ||
      !/^[a-z0-9.-]+$/i.test(parsed.hostname) ||
      (!parsed.hostname.includes(".") && parsed.hostname !== "localhost")
    ) {
      return invalidUrl
    }

    const missingRequired = PARAMETERS.filter(
      (parameter) =>
        parameter.required && !normalizeValue(values[parameter.key] ?? "", normalize),
    ).map((parameter) => parameter.key)

    for (const parameter of PARAMETERS) {
      const value = normalizeValue(values[parameter.key] ?? "", normalize)
      if (value) parsed.searchParams.set(parameter.key, value)
      else parsed.searchParams.delete(parameter.key)
    }

    return { url: parsed.toString(), error: null, missing: missingRequired }
  }, [baseUrl, values, normalize])

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="utm-base-url">Landing page URL</Label>
        <Input
          id="utm-base-url"
          name="baseUrl"
          value={baseUrl}
          onChange={(e) => setBaseUrl(e.target.value)}
          placeholder="https://example.com/pricing"
          className="mt-1.5 font-mono text-sm"
          spellCheck={false}
        />
      </div>

      <div className="flex items-center gap-2">
        <Switch
          id="utm-normalize"
          name="normalize"
          checked={normalize}
          onCheckedChange={setNormalize}
        />
        <Label htmlFor="utm-normalize" className="font-normal">
          Lowercase values and replace spaces with hyphens
        </Label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {PARAMETERS.map((parameter) => (
          <div key={parameter.key}>
            <Label htmlFor={`utm-${parameter.key}`}>
              {parameter.label}
              {parameter.required && <span className="text-destructive"> *</span>}
            </Label>
            <Input
              id={`utm-${parameter.key}`}
              name={parameter.key}
              value={values[parameter.key] ?? ""}
              onChange={(e) =>
                setValues((current) => ({ ...current, [parameter.key]: e.target.value }))
              }
              placeholder={parameter.placeholder}
              className="mt-1.5"
              spellCheck={false}
            />
            <p className="text-muted-foreground mt-1 text-xs">{parameter.hint}</p>
          </div>
        ))}
      </div>

      {error && (
        <div className="border-destructive/30 bg-destructive/10 text-destructive flex items-start gap-2 rounded-lg border p-3 text-sm">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {!error && missing.length > 0 && baseUrl.trim() && (
        <div className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-700 dark:text-amber-400">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <span>
            Analytics attribution needs {missing.join(", ")}. The link below still works
            without them, but the visit will not be tied to a campaign.
          </span>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <CopyButton value={url} label="Copy link" />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            setBaseUrl("")
            setValues({})
          }}
        >
          Reset
        </Button>
      </div>

      <div>
        <Label htmlFor="utm-output">Tracking URL</Label>
        <Textarea
          id="utm-output"
          name="url"
          value={url}
          readOnly
          className="mt-1.5 min-h-24 resize-y font-mono text-sm"
        />
      </div>
    </div>
  )
}
