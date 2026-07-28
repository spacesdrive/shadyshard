import { useState } from "react"
import { AlertCircle, Plus, RefreshCw, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CopyButton } from "@/components/tool/CopyButton"
import { DownloadButton } from "@/components/tool/DownloadButton"
import { secureRandomInt } from "@/lib/secure-random"

const FIRST_NAMES = [
  "Ada",
  "Grace",
  "Alan",
  "Linus",
  "Rita",
  "Hedy",
  "Ken",
  "Barbara",
  "Tim",
  "Radia",
  "Guido",
  "Anita",
  "Bjarne",
  "Frances",
  "Dennis",
  "Margaret",
  "Yukihiro",
  "Shafi",
  "James",
  "Karen",
]
const LAST_NAMES = [
  "Lovelace",
  "Hopper",
  "Turing",
  "Torvalds",
  "Levy",
  "Lamarr",
  "Thompson",
  "Liskov",
  "Berners-Lee",
  "Perlman",
  "Rossum",
  "Borg",
  "Stroustrup",
  "Allen",
  "Ritchie",
  "Hamilton",
  "Matsumoto",
  "Goldwasser",
  "Gosling",
  "Sparck",
]
const CITIES = [
  "Lisbon",
  "Osaka",
  "Nairobi",
  "Bogota",
  "Helsinki",
  "Chennai",
  "Toronto",
  "Perth",
  "Krakow",
  "Medellin",
  "Busan",
  "Porto",
  "Tallinn",
  "Cebu",
  "Bergen",
]
const COUNTRIES = [
  "Portugal",
  "Japan",
  "Kenya",
  "Colombia",
  "Finland",
  "India",
  "Canada",
  "Australia",
  "Poland",
  "South Korea",
  "Estonia",
  "Philippines",
  "Norway",
  "Chile",
  "Ireland",
]
const STREETS = [
  "Maple",
  "Cedar",
  "Harbour",
  "Kingfisher",
  "Willow",
  "Orchard",
  "Foundry",
  "Quarry",
  "Lantern",
  "Meadow",
  "Bramble",
  "Copper",
]
const STREET_TYPES = ["Street", "Avenue", "Lane", "Road", "Way", "Terrace"]
const COMPANIES = [
  "Northwind",
  "Bluepeak",
  "Ironleaf",
  "Latchkey",
  "Baskerville",
  "Cobalt Row",
  "Driftwood",
  "Halcyon",
  "Kestrel",
  "Marlowe",
  "Overtone",
  "Pinegate",
]
const COMPANY_SUFFIXES = ["Labs", "Systems", "Works", "Group", "Studio", "Collective"]
const JOB_TITLES = [
  "Backend Engineer",
  "Product Designer",
  "Data Analyst",
  "Support Lead",
  "Site Reliability Engineer",
  "Technical Writer",
  "QA Engineer",
  "Account Manager",
  "Research Scientist",
  "Operations Coordinator",
]
const WORDS = [
  "signal",
  "ledger",
  "harbour",
  "quiet",
  "amber",
  "drift",
  "cobble",
  "lantern",
  "thicket",
  "marble",
  "hollow",
  "beacon",
  "cinder",
  "fathom",
  "gable",
  "juniper",
  "kettle",
  "meridian",
  "nettle",
  "onyx",
  "plume",
  "quartz",
  "ripple",
  "saffron",
]
const DOMAINS = ["example.com", "example.org", "example.net", "test.example"]

function pick<T>(items: T[]): T {
  return items[secureRandomInt(items.length)]
}

function words(count: number): string[] {
  return Array.from({ length: count }, () => pick(WORDS))
}

function sentence(): string {
  const body = words(secureRandomInt(6) + 5).join(" ")
  return `${body.charAt(0).toUpperCase()}${body.slice(1)}.`
}

function isoDate(): string {
  const year = 2015 + secureRandomInt(11)
  const month = String(secureRandomInt(12) + 1).padStart(2, "0")
  const day = String(secureRandomInt(28) + 1).padStart(2, "0")
  return `${year}-${month}-${day}`
}

const FIELD_TYPES = {
  "first-name": { label: "First name", generate: () => pick(FIRST_NAMES) },
  "last-name": { label: "Last name", generate: () => pick(LAST_NAMES) },
  "full-name": {
    label: "Full name",
    generate: () => `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`,
  },
  email: {
    label: "Email",
    generate: () =>
      `${pick(FIRST_NAMES).toLowerCase()}.${pick(LAST_NAMES)
        .toLowerCase()
        .replace(/[^a-z]/g, "")}@${pick(DOMAINS)}`,
  },
  username: {
    label: "Username",
    generate: () => `${pick(WORDS)}_${pick(WORDS)}${secureRandomInt(100)}`,
  },
  phone: {
    label: "Phone",
    generate: () =>
      `+1-${200 + secureRandomInt(700)}-${String(secureRandomInt(1000)).padStart(3, "0")}-${String(secureRandomInt(10000)).padStart(4, "0")}`,
  },
  "street-address": {
    label: "Street address",
    generate: () => `${1 + secureRandomInt(999)} ${pick(STREETS)} ${pick(STREET_TYPES)}`,
  },
  city: { label: "City", generate: () => pick(CITIES) },
  country: { label: "Country", generate: () => pick(COUNTRIES) },
  company: {
    label: "Company",
    generate: () => `${pick(COMPANIES)} ${pick(COMPANY_SUFFIXES)}`,
  },
  "job-title": { label: "Job title", generate: () => pick(JOB_TITLES) },
  date: { label: "Date", generate: isoDate },
  datetime: {
    label: "Date and time",
    generate: () =>
      `${isoDate()}T${String(secureRandomInt(24)).padStart(2, "0")}:${String(secureRandomInt(60)).padStart(2, "0")}:00Z`,
  },
  integer: { label: "Integer", generate: () => secureRandomInt(10000) },
  decimal: {
    label: "Decimal",
    generate: () => Number((secureRandomInt(1000000) / 100).toFixed(2)),
  },
  boolean: { label: "Boolean", generate: () => secureRandomInt(2) === 1 },
  uuid: { label: "UUID", generate: () => crypto.randomUUID() },
  url: {
    label: "URL",
    generate: () => `https://${pick(DOMAINS)}/${pick(WORDS)}/${pick(WORDS)}`,
  },
  "ip-address": {
    label: "IP address",
    generate: () =>
      `${secureRandomInt(224)}.${secureRandomInt(256)}.${secureRandomInt(256)}.${1 + secureRandomInt(254)}`,
  },
  sentence: { label: "Sentence", generate: sentence },
} as const

type FieldType = keyof typeof FIELD_TYPES
type Value = string | number | boolean

interface Field {
  id: number
  name: string
  type: FieldType
}

type Format = "json" | "csv" | "sql"

function csvCell(value: Value): string {
  const text = String(value)
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text
}

function sqlLiteral(value: Value): string {
  if (typeof value === "number") return String(value)
  if (typeof value === "boolean") return value ? "TRUE" : "FALSE"
  return `'${value.replaceAll("'", "''")}'`
}

function serialize(
  rows: Record<string, Value>[],
  fields: Field[],
  format: Format,
  table: string,
): string {
  if (format === "json") return JSON.stringify(rows, null, 2)

  const columns = fields.map((field) => field.name)
  if (format === "csv") {
    return [
      columns.map(csvCell).join(","),
      ...rows.map((row) => columns.map((column) => csvCell(row[column])).join(",")),
    ].join("\n")
  }

  return rows
    .map(
      (row) =>
        `INSERT INTO ${table} (${columns.join(", ")}) VALUES (${columns
          .map((column) => sqlLiteral(row[column]))
          .join(", ")});`,
    )
    .join("\n")
}

export default function MockDataGenerator() {
  const [fields, setFields] = useState<Field[]>([
    { id: 1, name: "id", type: "uuid" },
    { id: 2, name: "full_name", type: "full-name" },
    { id: 3, name: "email", type: "email" },
    { id: 4, name: "signed_up_at", type: "date" },
  ])
  const [nextId, setNextId] = useState(5)
  const [rowCount, setRowCount] = useState("10")
  const [format, setFormat] = useState<Format>("json")
  const [table, setTable] = useState("users")
  const [output, setOutput] = useState("")
  const [error, setError] = useState<string | null>(null)

  function validate(): string | null {
    const count = Number(rowCount)
    if (!Number.isInteger(count) || count < 1)
      return "Row count must be a whole number of at least 1."
    if (count > 50000) return "Row count is capped at 50000 to keep the page responsive."
    if (fields.length === 0) return "Add at least one field."
    const names = fields.map((field) => field.name.trim())
    if (names.some((name) => name === "")) return "Every field needs a name."
    if (new Set(names).size !== names.length) return "Field names must be unique."
    if (format === "sql" && !/^[A-Za-z_][A-Za-z0-9_]*$/.test(table.trim())) {
      return "Table name must start with a letter or underscore and contain only letters, numbers, and underscores."
    }
    return null
  }

  function generate() {
    const problem = validate()
    setError(problem)
    if (problem) {
      setOutput("")
      return
    }

    const count = Number(rowCount)
    const rows = Array.from({ length: count }, () => {
      const row: Record<string, Value> = {}
      for (const field of fields) {
        row[field.name.trim()] = FIELD_TYPES[field.type].generate()
      }
      return row
    })
    setOutput(
      serialize(
        rows,
        fields.map((f) => ({ ...f, name: f.name.trim() })),
        format,
        table.trim(),
      ),
    )
  }

  function updateField(id: number, patch: Partial<Field>) {
    setFields((current) =>
      current.map((field) => (field.id === id ? { ...field, ...patch } : field)),
    )
  }

  const extension = format === "json" ? "json" : format === "csv" ? "csv" : "sql"

  return (
    <div className="space-y-5">
      <div className="space-y-3">
        <span className="text-sm font-medium">Fields</span>
        {fields.map((field, index) => (
          <div key={field.id} className="flex flex-wrap items-end gap-2">
            <div className="min-w-40 flex-1">
              <Label htmlFor={`mock-name-${field.id}`} className="sr-only">
                Field {index + 1} name
              </Label>
              <Input
                id={`mock-name-${field.id}`}
                name={`fieldName-${field.id}`}
                value={field.name}
                onChange={(event) => updateField(field.id, { name: event.target.value })}
                placeholder="field_name"
                className="font-mono text-sm"
              />
            </div>
            <div className="min-w-44 flex-1">
              <Label htmlFor={`mock-type-${field.id}`} className="sr-only">
                Field {index + 1} type
              </Label>
              <Select
                value={field.type}
                onValueChange={(next) =>
                  next && updateField(field.id, { type: next as FieldType })
                }
              >
                <SelectTrigger id={`mock-type-${field.id}`} className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(FIELD_TYPES).map(([value, definition]) => (
                    <SelectItem key={value} value={value}>
                      {definition.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={`Remove field ${index + 1}`}
              disabled={fields.length === 1}
              onClick={() =>
                setFields((current) => current.filter((item) => item.id !== field.id))
              }
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            setFields((current) => [
              ...current,
              { id: nextId, name: `field_${current.length + 1}`, type: "sentence" },
            ])
            setNextId((id) => id + 1)
          }}
        >
          <Plus className="size-4" />
          Add field
        </Button>
      </div>

      <div className="flex flex-wrap items-end gap-4">
        <div className="w-32">
          <Label htmlFor="mock-rows">Rows</Label>
          <Input
            id="mock-rows"
            name="rows"
            type="number"
            inputMode="numeric"
            value={rowCount}
            onChange={(event) => setRowCount(event.target.value)}
            className="mt-1.5 text-sm"
          />
        </div>
        {format === "sql" && (
          <div className="w-48">
            <Label htmlFor="mock-table">Table name</Label>
            <Input
              id="mock-table"
              name="table"
              value={table}
              onChange={(event) => setTable(event.target.value)}
              className="mt-1.5 font-mono text-sm"
            />
          </div>
        )}
      </div>

      <Tabs value={format} onValueChange={(value) => setFormat(value as Format)}>
        <TabsList>
          <TabsTrigger value="json">JSON</TabsTrigger>
          <TabsTrigger value="csv">CSV</TabsTrigger>
          <TabsTrigger value="sql">SQL</TabsTrigger>
        </TabsList>
      </Tabs>

      {error && (
        <div className="border-destructive/30 bg-destructive/10 text-destructive flex items-start gap-2 rounded-lg border p-3 text-sm">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <Button type="button" size="sm" onClick={generate}>
          <RefreshCw className="size-4" />
          Generate
        </Button>
        <CopyButton value={output} label="Copy data" />
        <DownloadButton
          getBlob={() => (output ? new Blob([output], { type: "text/plain" }) : null)}
          filename={`mock-data.${extension}`}
          disabled={!output}
        />
      </div>

      {output && (
        <pre className="border-border/60 bg-muted/30 max-h-96 overflow-auto rounded-lg border p-3 font-mono text-xs">
          {output}
        </pre>
      )}
    </div>
  )
}
