import { useMemo, useState } from "react"
import { CircleCheck, CircleX } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { CopyButton } from "@/components/tool/CopyButton"

/** Registered IBAN length and country name, from the SWIFT IBAN registry. */
const COUNTRIES: Record<string, { name: string; length: number }> = {
  AD: { name: "Andorra", length: 24 },
  AE: { name: "United Arab Emirates", length: 23 },
  AL: { name: "Albania", length: 28 },
  AT: { name: "Austria", length: 20 },
  AZ: { name: "Azerbaijan", length: 28 },
  BA: { name: "Bosnia and Herzegovina", length: 20 },
  BE: { name: "Belgium", length: 16 },
  BG: { name: "Bulgaria", length: 22 },
  BH: { name: "Bahrain", length: 22 },
  BI: { name: "Burundi", length: 27 },
  BR: { name: "Brazil", length: 29 },
  BY: { name: "Belarus", length: 28 },
  CH: { name: "Switzerland", length: 21 },
  CR: { name: "Costa Rica", length: 22 },
  CY: { name: "Cyprus", length: 28 },
  CZ: { name: "Czechia", length: 24 },
  DE: { name: "Germany", length: 22 },
  DJ: { name: "Djibouti", length: 27 },
  DK: { name: "Denmark", length: 18 },
  DO: { name: "Dominican Republic", length: 28 },
  EE: { name: "Estonia", length: 20 },
  EG: { name: "Egypt", length: 29 },
  ES: { name: "Spain", length: 24 },
  FI: { name: "Finland", length: 18 },
  FK: { name: "Falkland Islands", length: 18 },
  FO: { name: "Faroe Islands", length: 18 },
  FR: { name: "France", length: 27 },
  GB: { name: "United Kingdom", length: 22 },
  GE: { name: "Georgia", length: 22 },
  GI: { name: "Gibraltar", length: 23 },
  GL: { name: "Greenland", length: 18 },
  GR: { name: "Greece", length: 27 },
  GT: { name: "Guatemala", length: 28 },
  HN: { name: "Honduras", length: 28 },
  HR: { name: "Croatia", length: 21 },
  HU: { name: "Hungary", length: 28 },
  IE: { name: "Ireland", length: 22 },
  IL: { name: "Israel", length: 23 },
  IQ: { name: "Iraq", length: 23 },
  IS: { name: "Iceland", length: 26 },
  IT: { name: "Italy", length: 27 },
  JO: { name: "Jordan", length: 30 },
  KW: { name: "Kuwait", length: 30 },
  KZ: { name: "Kazakhstan", length: 20 },
  LB: { name: "Lebanon", length: 28 },
  LC: { name: "Saint Lucia", length: 32 },
  LI: { name: "Liechtenstein", length: 21 },
  LT: { name: "Lithuania", length: 20 },
  LU: { name: "Luxembourg", length: 20 },
  LV: { name: "Latvia", length: 21 },
  LY: { name: "Libya", length: 25 },
  MC: { name: "Monaco", length: 27 },
  MD: { name: "Moldova", length: 24 },
  ME: { name: "Montenegro", length: 22 },
  MK: { name: "North Macedonia", length: 19 },
  MN: { name: "Mongolia", length: 20 },
  MR: { name: "Mauritania", length: 27 },
  MT: { name: "Malta", length: 31 },
  MU: { name: "Mauritius", length: 30 },
  NI: { name: "Nicaragua", length: 28 },
  NL: { name: "Netherlands", length: 18 },
  NO: { name: "Norway", length: 15 },
  OM: { name: "Oman", length: 23 },
  PK: { name: "Pakistan", length: 24 },
  PL: { name: "Poland", length: 28 },
  PS: { name: "Palestine", length: 29 },
  PT: { name: "Portugal", length: 25 },
  QA: { name: "Qatar", length: 29 },
  RO: { name: "Romania", length: 24 },
  RS: { name: "Serbia", length: 22 },
  RU: { name: "Russia", length: 33 },
  SA: { name: "Saudi Arabia", length: 24 },
  SC: { name: "Seychelles", length: 31 },
  SD: { name: "Sudan", length: 18 },
  SE: { name: "Sweden", length: 24 },
  SI: { name: "Slovenia", length: 19 },
  SK: { name: "Slovakia", length: 24 },
  SM: { name: "San Marino", length: 27 },
  SO: { name: "Somalia", length: 23 },
  ST: { name: "Sao Tome and Principe", length: 25 },
  SV: { name: "El Salvador", length: 28 },
  TL: { name: "Timor-Leste", length: 23 },
  TN: { name: "Tunisia", length: 24 },
  TR: { name: "Turkey", length: 26 },
  UA: { name: "Ukraine", length: 29 },
  VA: { name: "Vatican City", length: 22 },
  VG: { name: "British Virgin Islands", length: 24 },
  XK: { name: "Kosovo", length: 20 },
  YE: { name: "Yemen", length: 30 },
}

/**
 * ISO 7064 mod 97-10 over a value far too large for a JavaScript number, so
 * the remainder is carried digit by digit across the string instead.
 */
function mod97(digits: string): number {
  let remainder = 0
  for (const character of digits) {
    remainder = (remainder * 10 + Number(character)) % 97
  }
  return remainder
}

function toNumeric(value: string): string {
  return value.replace(/[A-Z]/g, (letter) => String(letter.charCodeAt(0) - 55))
}

function rearrange(iban: string): string {
  return toNumeric(iban.slice(4) + iban.slice(0, 4))
}

interface Report {
  valid: boolean
  headline: string
  details: { label: string; value: string }[]
  problems: string[]
  electronic: string
  printed: string
}

function analyse(raw: string): Report | null {
  const iban = raw.replace(/[\s-]/g, "").toUpperCase()
  if (iban === "") return null

  const problems: string[] = []
  const details: { label: string; value: string }[] = []
  const printed = iban.replace(/(.{4})/g, "$1 ").trim()

  if (!/^[A-Z]{2}/.test(iban)) {
    problems.push("An IBAN starts with a two-letter country code.")
  }
  if (/[^A-Z0-9]/.test(iban)) {
    problems.push(
      "An IBAN contains only letters and digits. Spaces and hyphens are ignored, anything else is not allowed.",
    )
  }

  const countryCode = iban.slice(0, 2)
  const country = COUNTRIES[countryCode]
  if (/^[A-Z]{2}$/.test(countryCode)) {
    if (country) {
      details.push({ label: "Country", value: `${country.name} (${countryCode})` })
      if (iban.length !== country.length) {
        problems.push(
          `${country.name} uses ${country.length} characters, but this one has ${iban.length}.`,
        )
      }
    } else {
      problems.push(`${countryCode} is not a country code in the IBAN registry.`)
    }
  }

  if (!/^[A-Z]{2}[0-9]{2}/.test(iban)) {
    problems.push("The two characters after the country code must be the check digits.")
  } else {
    details.push({ label: "Check digits", value: iban.slice(2, 4) })
    details.push({
      label: "Account identifier (BBAN)",
      value: iban.slice(4) || "missing",
    })
  }

  const wellFormed =
    problems.length === 0 &&
    /^[A-Z]{2}[0-9]{2}[A-Z0-9]{1,30}$/.test(iban) &&
    Boolean(country)

  if (wellFormed) {
    if (mod97(rearrange(iban)) === 1) {
      return {
        valid: true,
        headline: "This IBAN passes every check.",
        details,
        problems: [],
        electronic: iban,
        printed,
      }
    }
    const suggested = 98 - mod97(toNumeric(`${iban.slice(4)}${countryCode}00`))
    problems.push(
      `The check digits do not match the rest of the number. For this account identifier they would be ${String(suggested).padStart(2, "0")}.`,
    )
  }

  return {
    valid: false,
    headline: "This IBAN did not pass.",
    details,
    problems,
    electronic: iban,
    printed,
  }
}

export default function IbanValidator() {
  const [input, setInput] = useState("")
  const report = useMemo(() => analyse(input), [input])

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="iban-input">IBAN</Label>
        <Input
          id="iban-input"
          name="iban"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="DE89 3704 0044 0532 0130 00"
          className="mt-1.5 font-mono"
          spellCheck={false}
          autoComplete="off"
          aria-invalid={report && !report.valid ? true : undefined}
        />
        <p className="text-muted-foreground mt-1.5 text-sm">
          Spaces and hyphens are ignored. Nothing you type is sent anywhere.
        </p>
      </div>

      {report && (
        <div className="space-y-4">
          <div
            className={
              report.valid
                ? "flex items-start gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-600 dark:text-emerald-400"
                : "border-destructive/30 bg-destructive/10 text-destructive flex items-start gap-2 rounded-lg border p-3 text-sm"
            }
          >
            {report.valid ? (
              <CircleCheck className="mt-0.5 size-4 shrink-0" aria-hidden />
            ) : (
              <CircleX className="mt-0.5 size-4 shrink-0" aria-hidden />
            )}
            <div>
              <p className="font-medium">{report.headline}</p>
              {report.problems.length > 0 && (
                <ul className="mt-2 space-y-1.5">
                  {report.problems.map((problem) => (
                    <li key={problem}>{problem}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {report.details.length > 0 && (
            <dl className="border-border/60 divide-border/60 divide-y rounded-xl border">
              {report.details.map((detail) => (
                <div key={detail.label} className="p-3">
                  <dt className="text-muted-foreground text-xs">{detail.label}</dt>
                  <dd className="mt-0.5 font-mono text-sm break-all">{detail.value}</dd>
                </div>
              ))}
            </dl>
          )}

          <div className="flex flex-wrap gap-2">
            <CopyButton value={report.printed} label="Copy printed format" />
            <CopyButton value={report.electronic} label="Copy electronic format" />
            <Button variant="outline" size="sm" onClick={() => setInput("")}>
              Clear
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
