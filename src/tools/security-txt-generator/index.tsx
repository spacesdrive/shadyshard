import { useMemo, useState } from "react"
import { AlertCircle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { CopyButton } from "@/components/tool/CopyButton"
import { DownloadButton } from "@/components/tool/DownloadButton"

interface FormState {
  contact: string
  expires: string
  encryption: string
  acknowledgments: string
  preferredLanguages: string
  canonical: string
  policy: string
  hiring: string
  csaf: string
}

const CONTACT_SCHEMES = ["mailto:", "tel:", "https:"]

function oneYearFromToday(): string {
  const date = new Date()
  date.setFullYear(date.getFullYear() + 1)
  return date.toISOString().slice(0, 10)
}

function lines(value: string): string[] {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
}

function isAbsoluteUri(value: string): boolean {
  try {
    const url = new URL(value)
    return Boolean(url.protocol)
  } catch {
    return false
  }
}

function isHttpsUrl(value: string): boolean {
  try {
    return new URL(value).protocol === "https:"
  } catch {
    return false
  }
}

interface BuildResult {
  output: string
  errors: string[]
  warnings: string[]
}

function build(form: FormState): BuildResult {
  const errors: string[] = []
  const warnings: string[] = []
  const output: string[] = []

  const contacts = lines(form.contact)
  if (contacts.length === 0) {
    errors.push("At least one Contact entry is required.")
  }
  for (const contact of contacts) {
    if (!CONTACT_SCHEMES.some((scheme) => contact.toLowerCase().startsWith(scheme))) {
      errors.push(
        `Contact "${contact}" must be a URI. Write an email address as mailto:you@example.com, a phone number as tel:+1-201-555-0123, and a form as its https URL.`,
      )
    } else if (!isAbsoluteUri(contact)) {
      errors.push(`Contact "${contact}" is not a valid URI.`)
    } else {
      output.push(`Contact: ${contact}`)
    }
  }

  if (!form.expires) {
    errors.push("Expires is required by RFC 9116.")
  } else {
    const expiry = new Date(`${form.expires}T23:59:59Z`)
    if (Number.isNaN(expiry.getTime())) {
      errors.push("Expires is not a valid date.")
    } else {
      const now = Date.now()
      if (expiry.getTime() <= now) {
        errors.push("Expires is in the past, so the file would be treated as stale.")
      } else if (expiry.getTime() - now > 400 * 24 * 60 * 60 * 1000) {
        warnings.push(
          "Expires is more than a year away. RFC 9116 recommends less than a year so an abandoned file eventually announces itself.",
        )
      }
      output.push(`Expires: ${expiry.toISOString().replace(".000", "")}`)
    }
  }

  const multiValueFields: { key: keyof FormState; field: string }[] = [
    { key: "encryption", field: "Encryption" },
    { key: "acknowledgments", field: "Acknowledgments" },
    { key: "canonical", field: "Canonical" },
  ]

  for (const { key, field } of multiValueFields) {
    for (const value of lines(form[key])) {
      if (!isAbsoluteUri(value)) {
        errors.push(`${field} "${value}" is not a valid absolute URI.`)
        continue
      }
      if (field === "Canonical") {
        if (!isHttpsUrl(value)) {
          errors.push(`Canonical "${value}" must use HTTPS.`)
          continue
        }
        if (!value.endsWith("/.well-known/security.txt")) {
          warnings.push(
            `Canonical "${value}" does not end with /.well-known/security.txt, which is where the file is expected to live.`,
          )
        }
      }
      output.push(`${field}: ${value}`)
    }
  }

  const languages = form.preferredLanguages.trim()
  if (languages) {
    const tags = languages.split(",").map((tag) => tag.trim())
    if (tags.some((tag) => !/^[a-zA-Z]{2,3}(-[a-zA-Z0-9]{2,8})*$/.test(tag))) {
      errors.push(
        "Preferred-Languages must be comma-separated language tags such as en, fr, de-DE.",
      )
    } else {
      output.push(`Preferred-Languages: ${tags.join(", ")}`)
    }
  }

  const singleValueFields: { key: keyof FormState; field: string }[] = [
    { key: "policy", field: "Policy" },
    { key: "hiring", field: "Hiring" },
    { key: "csaf", field: "CSAF" },
  ]

  for (const { key, field } of singleValueFields) {
    const value = form[key].trim()
    if (!value) continue
    if (!isAbsoluteUri(value)) {
      errors.push(`${field} "${value}" is not a valid absolute URI.`)
      continue
    }
    if (field === "CSAF" && !value.endsWith("provider-metadata.json")) {
      warnings.push("CSAF should point at the provider-metadata.json file itself.")
    }
    output.push(`${field}: ${value}`)
  }

  return { output: output.length ? `${output.join("\n")}\n` : "", errors, warnings }
}

export default function SecurityTxtGenerator() {
  const [form, setForm] = useState<FormState>({
    contact: "",
    expires: oneYearFromToday(),
    encryption: "",
    acknowledgments: "",
    preferredLanguages: "",
    canonical: "",
    policy: "",
    hiring: "",
    csaf: "",
  })

  const result = useMemo(() => build(form), [form])

  function update(key: keyof FormState, value: string) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="security-txt-contact">
          Contact<span className="text-destructive"> *</span>
        </Label>
        <Textarea
          id="security-txt-contact"
          name="contact"
          value={form.contact}
          onChange={(event) => update("contact", event.target.value)}
          placeholder={"mailto:security@example.com\nhttps://example.com/report"}
          className="mt-1.5 min-h-24 resize-y font-mono text-sm"
          spellCheck={false}
        />
        <p className="text-muted-foreground mt-1 text-xs">
          One URI per line, in order of preference. Email addresses need the mailto:
          prefix.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="security-txt-expires">
            Expires<span className="text-destructive"> *</span>
          </Label>
          <Input
            id="security-txt-expires"
            name="expires"
            type="date"
            value={form.expires}
            onChange={(event) => update("expires", event.target.value)}
            className="mt-1.5"
          />
          <p className="text-muted-foreground mt-1 text-xs">
            Written into the file as the end of that day in UTC.
          </p>
        </div>

        <div>
          <Label htmlFor="security-txt-languages">Preferred languages</Label>
          <Input
            id="security-txt-languages"
            name="preferredLanguages"
            value={form.preferredLanguages}
            onChange={(event) => update("preferredLanguages", event.target.value)}
            placeholder="en, fr, de-DE"
            className="mt-1.5"
            spellCheck={false}
          />
          <p className="text-muted-foreground mt-1 text-xs">
            The languages your security team can read reports in.
          </p>
        </div>
      </div>

      <div>
        <Label htmlFor="security-txt-canonical">Canonical URLs</Label>
        <Textarea
          id="security-txt-canonical"
          name="canonical"
          value={form.canonical}
          onChange={(event) => update("canonical", event.target.value)}
          placeholder="https://example.com/.well-known/security.txt"
          className="mt-1.5 min-h-20 resize-y font-mono text-sm"
          spellCheck={false}
        />
        <p className="text-muted-foreground mt-1 text-xs">
          Every location this file is published at. One per line.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="security-txt-encryption">Encryption keys</Label>
          <Textarea
            id="security-txt-encryption"
            name="encryption"
            value={form.encryption}
            onChange={(event) => update("encryption", event.target.value)}
            placeholder="https://example.com/pgp-key.txt"
            className="mt-1.5 min-h-20 resize-y font-mono text-sm"
            spellCheck={false}
          />
        </div>
        <div>
          <Label htmlFor="security-txt-acknowledgments">Acknowledgements pages</Label>
          <Textarea
            id="security-txt-acknowledgments"
            name="acknowledgments"
            value={form.acknowledgments}
            onChange={(event) => update("acknowledgments", event.target.value)}
            placeholder="https://example.com/hall-of-fame"
            className="mt-1.5 min-h-20 resize-y font-mono text-sm"
            spellCheck={false}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <Label htmlFor="security-txt-policy">Policy URL</Label>
          <Input
            id="security-txt-policy"
            name="policy"
            value={form.policy}
            onChange={(event) => update("policy", event.target.value)}
            placeholder="https://example.com/disclosure-policy"
            className="mt-1.5 font-mono text-sm"
            spellCheck={false}
          />
        </div>
        <div>
          <Label htmlFor="security-txt-hiring">Hiring URL</Label>
          <Input
            id="security-txt-hiring"
            name="hiring"
            value={form.hiring}
            onChange={(event) => update("hiring", event.target.value)}
            placeholder="https://example.com/careers/security"
            className="mt-1.5 font-mono text-sm"
            spellCheck={false}
          />
        </div>
        <div>
          <Label htmlFor="security-txt-csaf">CSAF provider metadata</Label>
          <Input
            id="security-txt-csaf"
            name="csaf"
            value={form.csaf}
            onChange={(event) => update("csaf", event.target.value)}
            placeholder="https://example.com/.well-known/csaf/provider-metadata.json"
            className="mt-1.5 font-mono text-sm"
            spellCheck={false}
          />
        </div>
      </div>

      {result.errors.length > 0 && (
        <div className="border-destructive/30 bg-destructive/10 text-destructive flex items-start gap-2 rounded-lg border p-3 text-sm">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <ul className="space-y-1">
            {result.errors.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {result.warnings.length > 0 && (
        <div className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-700 dark:text-amber-400">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <ul className="space-y-1">
            {result.warnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        </div>
      )}

      <div>
        <Label htmlFor="security-txt-output">security.txt</Label>
        <Textarea
          id="security-txt-output"
          name="output"
          value={result.output}
          readOnly
          placeholder="Add at least one contact to generate the file."
          className="mt-1.5 min-h-40 resize-y font-mono text-sm"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <CopyButton value={result.output} label="Copy file" />
        <DownloadButton
          getBlob={() => new Blob([result.output], { type: "text/plain" })}
          filename="security.txt"
          disabled={result.errors.length > 0 || !result.output}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() =>
            setForm({
              contact: "",
              expires: oneYearFromToday(),
              encryption: "",
              acknowledgments: "",
              preferredLanguages: "",
              canonical: "",
              policy: "",
              hiring: "",
              csaf: "",
            })
          }
        >
          Reset
        </Button>
      </div>

      <p className="text-muted-foreground text-sm">
        Upload the file to /.well-known/security.txt on your domain and serve it as plain
        text over HTTPS.
      </p>
    </div>
  )
}
