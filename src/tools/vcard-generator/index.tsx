import { useMemo, useState } from "react"
import { AlertCircle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CopyButton } from "@/components/tool/CopyButton"
import { DownloadButton } from "@/components/tool/DownloadButton"

interface ContactFields {
  firstName: string
  lastName: string
  organization: string
  jobTitle: string
  workPhone: string
  mobilePhone: string
  email: string
  website: string
  street: string
  city: string
  region: string
  postalCode: string
  country: string
  note: string
}

const EMPTY: ContactFields = {
  firstName: "",
  lastName: "",
  organization: "",
  jobTitle: "",
  workPhone: "",
  mobilePhone: "",
  email: "",
  website: "",
  street: "",
  city: "",
  region: "",
  postalCode: "",
  country: "",
  note: "",
}

function escapeValue(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n")
}

function buildVCard(fields: ContactFields, version: "3.0" | "4.0"): string {
  const escaped = (key: keyof ContactFields) => escapeValue(fields[key].trim())

  const fullName = [fields.firstName.trim(), fields.lastName.trim()]
    .filter(Boolean)
    .join(" ")

  const lines = [
    "BEGIN:VCARD",
    `VERSION:${version}`,
    `N:${escaped("lastName")};${escaped("firstName")};;;`,
    `FN:${escapeValue(fullName)}`,
  ]

  if (escaped("organization")) lines.push(`ORG:${escaped("organization")}`)
  if (escaped("jobTitle")) lines.push(`TITLE:${escaped("jobTitle")}`)

  if (escaped("workPhone")) {
    lines.push(
      version === "4.0"
        ? `TEL;TYPE=work,voice;VALUE=uri:tel:${escaped("workPhone")}`
        : `TEL;TYPE=WORK,VOICE:${escaped("workPhone")}`,
    )
  }
  if (escaped("mobilePhone")) {
    lines.push(
      version === "4.0"
        ? `TEL;TYPE=cell,voice;VALUE=uri:tel:${escaped("mobilePhone")}`
        : `TEL;TYPE=CELL,VOICE:${escaped("mobilePhone")}`,
    )
  }
  if (escaped("email")) {
    lines.push(
      version === "4.0"
        ? `EMAIL:${escaped("email")}`
        : `EMAIL;TYPE=INTERNET:${escaped("email")}`,
    )
  }
  if (escaped("website")) lines.push(`URL:${escaped("website")}`)

  const hasAddress = [
    fields.street,
    fields.city,
    fields.region,
    fields.postalCode,
    fields.country,
  ].some((value) => value.trim())

  if (hasAddress) {
    lines.push(
      `ADR;TYPE=WORK:;;${escaped("street")};${escaped("city")};${escaped("region")};${escaped("postalCode")};${escaped("country")}`,
    )
  }
  if (escaped("note")) lines.push(`NOTE:${escaped("note")}`)

  lines.push("END:VCARD")
  return lines.join("\r\n")
}

const TEXT_FIELDS: { key: keyof ContactFields; label: string; placeholder: string }[] = [
  { key: "firstName", label: "First name", placeholder: "Ada" },
  { key: "lastName", label: "Last name", placeholder: "Lovelace" },
  { key: "organization", label: "Organization", placeholder: "Analytical Engines Ltd" },
  { key: "jobTitle", label: "Job title", placeholder: "Head of Computing" },
  { key: "workPhone", label: "Work phone", placeholder: "+44 20 7946 0000" },
  { key: "mobilePhone", label: "Mobile phone", placeholder: "+44 7700 900000" },
  { key: "email", label: "Email", placeholder: "ada@example.com" },
  { key: "website", label: "Website", placeholder: "https://example.com" },
  { key: "street", label: "Street", placeholder: "12 Marylebone Road" },
  { key: "city", label: "City", placeholder: "London" },
  { key: "region", label: "Region or state", placeholder: "Greater London" },
  { key: "postalCode", label: "Postal code", placeholder: "NW1 5LS" },
  { key: "country", label: "Country", placeholder: "United Kingdom" },
]

export default function VcardGenerator() {
  const [fields, setFields] = useState<ContactFields>(EMPTY)
  const [version, setVersion] = useState<"3.0" | "4.0">("3.0")

  function update(key: keyof ContactFields, value: string) {
    setFields((current) => ({ ...current, [key]: value }))
  }

  const { vcard, error } = useMemo(() => {
    if (!fields.firstName.trim() && !fields.lastName.trim()) {
      return { vcard: "", error: "Enter at least a first or last name." }
    }
    if (fields.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email.trim())) {
      return {
        vcard: "",
        error: `"${fields.email.trim()}" is not a valid email address.`,
      }
    }
    return { vcard: buildVCard(fields, version), error: null }
  }, [fields, version])

  const filename = `${
    [fields.firstName, fields.lastName]
      .join("-")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "contact"
  }.vcf`

  return (
    <div className="space-y-4">
      <div className="w-44">
        <Label htmlFor="vcard-version">vCard version</Label>
        <Select
          value={version}
          onValueChange={(value) => value && setVersion(value as "3.0" | "4.0")}
        >
          <SelectTrigger id="vcard-version" className="mt-1.5 w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="3.0">3.0 (most compatible)</SelectItem>
            <SelectItem value="4.0">4.0</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {TEXT_FIELDS.map((field) => (
          <div key={field.key}>
            <Label htmlFor={`vcard-${field.key}`}>{field.label}</Label>
            <Input
              id={`vcard-${field.key}`}
              name={field.key}
              value={fields[field.key]}
              onChange={(e) => update(field.key, e.target.value)}
              placeholder={field.placeholder}
              className="mt-1.5"
            />
          </div>
        ))}
      </div>

      <div>
        <Label htmlFor="vcard-note">Note</Label>
        <Textarea
          id="vcard-note"
          name="note"
          value={fields.note}
          onChange={(e) => update("note", e.target.value)}
          placeholder="Anything else worth storing with the contact"
          className="mt-1.5 min-h-20 resize-y text-sm"
        />
      </div>

      {error && (
        <div className="border-destructive/30 bg-destructive/10 text-destructive flex items-start gap-2 rounded-lg border p-3 text-sm">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <DownloadButton
          getBlob={() => new Blob([vcard], { type: "text/vcard" })}
          filename={filename}
          label="Download .vcf"
          disabled={!vcard}
        />
        <CopyButton value={vcard} label="Copy vCard" />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setFields(EMPTY)}
        >
          Reset fields
        </Button>
      </div>

      <div>
        <Label htmlFor="vcard-output">vCard</Label>
        <Textarea
          id="vcard-output"
          name="vcard"
          value={vcard}
          readOnly
          className="mt-1.5 min-h-48 resize-y font-mono text-xs"
        />
      </div>
    </div>
  )
}
