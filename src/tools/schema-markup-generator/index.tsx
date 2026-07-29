import { useMemo, useState } from "react"
import { AlertCircle, Plus, Trash2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CopyButton } from "@/components/tool/CopyButton"
import { DownloadButton } from "@/components/tool/DownloadButton"

type SchemaType =
  "Article" | "FAQPage" | "Product" | "Organization" | "LocalBusiness" | "BreadcrumbList"

interface FieldDef {
  key: string
  label: string
  placeholder: string
  required?: boolean
  multiline?: boolean
  help?: string
}

const FIELDS: Record<SchemaType, FieldDef[]> = {
  Article: [
    {
      key: "headline",
      label: "Headline",
      placeholder: "How to write a title tag",
      required: true,
    },
    { key: "url", label: "Article URL", placeholder: "https://example.com/blog/post" },
    { key: "author", label: "Author name", placeholder: "Jordan Rivera", required: true },
    { key: "publisher", label: "Publisher name", placeholder: "Example Media" },
    { key: "image", label: "Image URL", placeholder: "https://example.com/cover.jpg" },
    {
      key: "datePublished",
      label: "Date published",
      placeholder: "2026-07-29",
      required: true,
    },
    { key: "dateModified", label: "Date modified", placeholder: "2026-07-29" },
    {
      key: "description",
      label: "Description",
      placeholder: "A short summary of the article.",
      multiline: true,
    },
  ],
  FAQPage: [],
  Product: [
    {
      key: "name",
      label: "Product name",
      placeholder: "Field Notes Notebook",
      required: true,
    },
    { key: "image", label: "Image URL", placeholder: "https://example.com/product.jpg" },
    {
      key: "description",
      label: "Description",
      placeholder: "What the product is.",
      multiline: true,
    },
    { key: "brand", label: "Brand", placeholder: "Example Co" },
    { key: "sku", label: "SKU", placeholder: "FN-001" },
    { key: "price", label: "Price", placeholder: "24.00", required: true },
    { key: "priceCurrency", label: "Currency code", placeholder: "USD", required: true },
    {
      key: "url",
      label: "Product URL",
      placeholder: "https://example.com/shop/notebook",
    },
    { key: "ratingValue", label: "Average rating", placeholder: "4.6" },
    { key: "reviewCount", label: "Review count", placeholder: "128" },
  ],
  Organization: [
    {
      key: "name",
      label: "Organization name",
      placeholder: "Example Co",
      required: true,
    },
    {
      key: "url",
      label: "Website URL",
      placeholder: "https://example.com",
      required: true,
    },
    { key: "logo", label: "Logo URL", placeholder: "https://example.com/logo.png" },
    {
      key: "description",
      label: "Description",
      placeholder: "What the organization does.",
      multiline: true,
    },
    { key: "telephone", label: "Telephone", placeholder: "+1-555-0100" },
    { key: "email", label: "Email", placeholder: "hello@example.com" },
    {
      key: "sameAs",
      label: "Profile URLs",
      placeholder: "https://x.com/example\nhttps://www.linkedin.com/company/example",
      multiline: true,
      help: "One URL per line.",
    },
  ],
  LocalBusiness: [
    {
      key: "name",
      label: "Business name",
      placeholder: "Example Coffee",
      required: true,
    },
    { key: "url", label: "Website URL", placeholder: "https://example.com" },
    { key: "telephone", label: "Telephone", placeholder: "+1-555-0100" },
    {
      key: "streetAddress",
      label: "Street address",
      placeholder: "18 Mill Lane",
      required: true,
    },
    { key: "addressLocality", label: "City", placeholder: "Bristol", required: true },
    { key: "addressRegion", label: "Region or state", placeholder: "England" },
    { key: "postalCode", label: "Postal code", placeholder: "BS1 4TR" },
    { key: "addressCountry", label: "Country code", placeholder: "GB", required: true },
    { key: "priceRange", label: "Price range", placeholder: "$$" },
    {
      key: "openingHours",
      label: "Opening hours",
      placeholder: "Mo-Fr 08:00-17:00\nSa 09:00-13:00",
      multiline: true,
      help: "One entry per line, in schema.org opening hours format.",
    },
  ],
  BreadcrumbList: [],
}

const AVAILABILITY = [
  "InStock",
  "OutOfStock",
  "PreOrder",
  "BackOrder",
  "Discontinued",
] as const

const SCHEMA_LABELS: Record<SchemaType, string> = {
  Article: "Article",
  FAQPage: "FAQ page",
  Product: "Product",
  Organization: "Organization",
  LocalBusiness: "Local business",
  BreadcrumbList: "Breadcrumb list",
}

interface PairItem {
  id: number
  first: string
  second: string
}

let nextPairId = 0
function newPair(): PairItem {
  nextPairId += 1
  return { id: nextPairId, first: "", second: "" }
}

function lines(value: string): string[] {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
}

type JsonValue = string | number | JsonObject | JsonValue[]
interface JsonObject {
  [key: string]: JsonValue
}

function put(target: JsonObject, key: string, value: string) {
  if (value.trim()) target[key] = value.trim()
}

function buildSchema(
  type: SchemaType,
  values: Record<string, string>,
  availability: string,
  faqItems: PairItem[],
  crumbItems: PairItem[],
): JsonObject {
  const schema: JsonObject = { "@context": "https://schema.org", "@type": type }

  if (type === "Article") {
    put(schema, "headline", values.headline ?? "")
    put(schema, "url", values.url ?? "")
    put(schema, "image", values.image ?? "")
    put(schema, "datePublished", values.datePublished ?? "")
    put(schema, "dateModified", values.dateModified ?? "")
    put(schema, "description", values.description ?? "")
    if (values.author?.trim()) {
      schema.author = { "@type": "Person", name: values.author.trim() }
    }
    if (values.publisher?.trim()) {
      schema.publisher = { "@type": "Organization", name: values.publisher.trim() }
    }
    return schema
  }

  if (type === "Product") {
    put(schema, "name", values.name ?? "")
    put(schema, "image", values.image ?? "")
    put(schema, "description", values.description ?? "")
    put(schema, "sku", values.sku ?? "")
    if (values.brand?.trim()) {
      schema.brand = { "@type": "Brand", name: values.brand.trim() }
    }
    const offers: JsonObject = { "@type": "Offer" }
    put(offers, "price", values.price ?? "")
    put(offers, "priceCurrency", values.priceCurrency ?? "")
    put(offers, "url", values.url ?? "")
    offers.availability = `https://schema.org/${availability}`
    schema.offers = offers
    if (values.ratingValue?.trim() && values.reviewCount?.trim()) {
      schema.aggregateRating = {
        "@type": "AggregateRating",
        ratingValue: values.ratingValue.trim(),
        reviewCount: values.reviewCount.trim(),
      }
    }
    return schema
  }

  if (type === "Organization") {
    put(schema, "name", values.name ?? "")
    put(schema, "url", values.url ?? "")
    put(schema, "logo", values.logo ?? "")
    put(schema, "description", values.description ?? "")
    put(schema, "telephone", values.telephone ?? "")
    put(schema, "email", values.email ?? "")
    const profiles = lines(values.sameAs ?? "")
    if (profiles.length) schema.sameAs = profiles
    return schema
  }

  if (type === "LocalBusiness") {
    put(schema, "name", values.name ?? "")
    put(schema, "url", values.url ?? "")
    put(schema, "telephone", values.telephone ?? "")
    put(schema, "priceRange", values.priceRange ?? "")
    const address: JsonObject = { "@type": "PostalAddress" }
    put(address, "streetAddress", values.streetAddress ?? "")
    put(address, "addressLocality", values.addressLocality ?? "")
    put(address, "addressRegion", values.addressRegion ?? "")
    put(address, "postalCode", values.postalCode ?? "")
    put(address, "addressCountry", values.addressCountry ?? "")
    schema.address = address
    const hours = lines(values.openingHours ?? "")
    if (hours.length) schema.openingHours = hours
    return schema
  }

  if (type === "FAQPage") {
    schema.mainEntity = faqItems
      .filter((item) => item.first.trim() && item.second.trim())
      .map((item) => ({
        "@type": "Question",
        name: item.first.trim(),
        acceptedAnswer: { "@type": "Answer", text: item.second.trim() },
      }))
    return schema
  }

  schema.itemListElement = crumbItems
    .filter((item) => item.first.trim())
    .map((item, index) => {
      const element: JsonObject = {
        "@type": "ListItem",
        position: index + 1,
        name: item.first.trim(),
      }
      put(element, "item", item.second)
      return element
    })
  return schema
}

function missingRequired(
  type: SchemaType,
  values: Record<string, string>,
  faqItems: PairItem[],
  crumbItems: PairItem[],
): string[] {
  if (type === "FAQPage") {
    const complete = faqItems.filter((item) => item.first.trim() && item.second.trim())
    return complete.length ? [] : ["at least one question and answer pair"]
  }
  if (type === "BreadcrumbList") {
    const complete = crumbItems.filter((item) => item.first.trim())
    return complete.length >= 2 ? [] : ["at least two breadcrumb items"]
  }
  return FIELDS[type]
    .filter((field) => field.required && !values[field.key]?.trim())
    .map((field) => field.label)
}

interface PairListProps {
  items: PairItem[]
  onChange: (items: PairItem[]) => void
  idPrefix: string
  firstLabel: string
  secondLabel: string
  firstPlaceholder: string
  secondPlaceholder: string
  secondMultiline: boolean
  addLabel: string
}

function PairList({
  items,
  onChange,
  idPrefix,
  firstLabel,
  secondLabel,
  firstPlaceholder,
  secondPlaceholder,
  secondMultiline,
  addLabel,
}: PairListProps) {
  function update(id: number, patch: Partial<PairItem>) {
    onChange(items.map((item) => (item.id === id ? { ...item, ...patch } : item)))
  }

  return (
    <div className="space-y-4">
      {items.map((item, index) => (
        <div key={item.id} className="border-border/60 space-y-3 rounded-lg border p-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Item {index + 1}</span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={`Remove item ${index + 1}`}
              disabled={items.length === 1}
              onClick={() => onChange(items.filter((entry) => entry.id !== item.id))}
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
          <div>
            <Label htmlFor={`${idPrefix}-first-${item.id}`}>{firstLabel}</Label>
            <Input
              id={`${idPrefix}-first-${item.id}`}
              name={`${idPrefix}-first-${item.id}`}
              value={item.first}
              onChange={(event) => update(item.id, { first: event.target.value })}
              placeholder={firstPlaceholder}
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor={`${idPrefix}-second-${item.id}`}>{secondLabel}</Label>
            {secondMultiline ? (
              <Textarea
                id={`${idPrefix}-second-${item.id}`}
                name={`${idPrefix}-second-${item.id}`}
                value={item.second}
                onChange={(event) => update(item.id, { second: event.target.value })}
                placeholder={secondPlaceholder}
                className="mt-1.5 min-h-20 resize-y"
              />
            ) : (
              <Input
                id={`${idPrefix}-second-${item.id}`}
                name={`${idPrefix}-second-${item.id}`}
                value={item.second}
                onChange={(event) => update(item.id, { second: event.target.value })}
                placeholder={secondPlaceholder}
                className="mt-1.5"
              />
            )}
          </div>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => onChange([...items, newPair()])}
      >
        <Plus className="size-4" />
        {addLabel}
      </Button>
    </div>
  )
}

export default function SchemaMarkupGenerator() {
  const [type, setType] = useState<SchemaType>("Article")
  const [values, setValues] = useState<Record<string, string>>({})
  const [availability, setAvailability] = useState<string>("InStock")
  const [faqItems, setFaqItems] = useState<PairItem[]>([newPair()])
  const [crumbItems, setCrumbItems] = useState<PairItem[]>([newPair(), newPair()])
  const [wrapInScript, setWrapInScript] = useState(true)

  const json = useMemo(
    () =>
      JSON.stringify(
        buildSchema(type, values, availability, faqItems, crumbItems),
        null,
        2,
      ),
    [type, values, availability, faqItems, crumbItems],
  )

  const missing = missingRequired(type, values, faqItems, crumbItems)
  const output = wrapInScript
    ? `<script type="application/ld+json">\n${json}\n</script>`
    : json

  function setValue(key: string, value: string) {
    setValues((current) => ({ ...current, [key]: value }))
  }

  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="schema-type">Schema type</Label>
        <Select
          value={type}
          onValueChange={(next) => next && setType(next as SchemaType)}
        >
          <SelectTrigger id="schema-type" className="mt-1.5 w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(Object.keys(FIELDS) as SchemaType[]).map((option) => (
              <SelectItem key={option} value={option}>
                {SCHEMA_LABELS[option]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {type === "FAQPage" && (
        <PairList
          items={faqItems}
          onChange={setFaqItems}
          idPrefix="schema-faq"
          firstLabel="Question"
          secondLabel="Answer"
          firstPlaceholder="Do you ship internationally?"
          secondPlaceholder="Yes, we ship to most countries within five working days."
          secondMultiline
          addLabel="Add question"
        />
      )}

      {type === "BreadcrumbList" && (
        <PairList
          items={crumbItems}
          onChange={setCrumbItems}
          idPrefix="schema-crumb"
          firstLabel="Name"
          secondLabel="URL"
          firstPlaceholder="Guides"
          secondPlaceholder="https://example.com/guides"
          secondMultiline={false}
          addLabel="Add breadcrumb"
        />
      )}

      {FIELDS[type].length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2">
          {FIELDS[type].map((field) => (
            <div
              key={field.key}
              className={field.multiline ? "sm:col-span-2" : undefined}
            >
              <Label htmlFor={`schema-${field.key}`}>
                {field.label}
                {field.required && <span className="text-destructive ml-1">*</span>}
              </Label>
              {field.multiline ? (
                <Textarea
                  id={`schema-${field.key}`}
                  name={field.key}
                  value={values[field.key] ?? ""}
                  onChange={(event) => setValue(field.key, event.target.value)}
                  placeholder={field.placeholder}
                  className="mt-1.5 min-h-20 resize-y"
                />
              ) : (
                <Input
                  id={`schema-${field.key}`}
                  name={field.key}
                  value={values[field.key] ?? ""}
                  onChange={(event) => setValue(field.key, event.target.value)}
                  placeholder={field.placeholder}
                  className="mt-1.5"
                />
              )}
              {field.help && (
                <p className="text-muted-foreground mt-1 text-xs">{field.help}</p>
              )}
            </div>
          ))}

          {type === "Product" && (
            <div>
              <Label htmlFor="schema-availability">Availability</Label>
              <Select
                value={availability}
                onValueChange={(next) => next && setAvailability(next as string)}
              >
                <SelectTrigger id="schema-availability" className="mt-1.5 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {AVAILABILITY.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      )}

      {missing.length > 0 && (
        <div className="border-destructive/30 bg-destructive/10 text-destructive flex items-start gap-2 rounded-lg border p-3 text-sm">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <span>Still missing: {missing.join(", ")}.</span>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <Switch
            id="schema-wrap"
            name="wrapInScript"
            checked={wrapInScript}
            onCheckedChange={setWrapInScript}
          />
          <Label htmlFor="schema-wrap" className="font-normal">
            Wrap in a script tag
          </Label>
        </div>
        <div className="ml-auto flex flex-wrap gap-2">
          <CopyButton value={output} label="Copy markup" />
          <DownloadButton
            getBlob={() =>
              new Blob([output], {
                type: wrapInScript ? "text/html" : "application/ld+json",
              })
            }
            filename={wrapInScript ? "schema-markup.html" : "schema-markup.json"}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="schema-output" className="sr-only">
          Generated JSON-LD
        </Label>
        <Textarea
          id="schema-output"
          name="output"
          value={output}
          readOnly
          className="min-h-72 resize-y font-mono text-sm"
        />
      </div>
    </div>
  )
}
