import { useCallback, useEffect, useState } from "react"
import { RefreshCw, Trash2 } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
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
import { secureRandomInt } from "@/lib/secure-random"

const WORDS = [
  "lorem",
  "ipsum",
  "dolor",
  "sit",
  "amet",
  "consectetur",
  "adipiscing",
  "elit",
  "sed",
  "do",
  "eiusmod",
  "tempor",
  "incididunt",
  "ut",
  "labore",
  "et",
  "dolore",
  "magna",
  "aliqua",
  "enim",
  "ad",
  "minim",
  "veniam",
  "quis",
  "nostrud",
  "exercitation",
  "ullamco",
  "laboris",
  "nisi",
  "aliquip",
  "ex",
  "ea",
  "commodo",
  "consequat",
  "duis",
  "aute",
  "irure",
  "in",
  "reprehenderit",
  "voluptate",
  "velit",
  "esse",
  "cillum",
  "eu",
  "fugiat",
  "nulla",
  "pariatur",
  "excepteur",
  "sint",
  "occaecat",
  "cupidatat",
  "non",
  "proident",
  "sunt",
  "culpa",
  "qui",
  "officia",
  "deserunt",
  "mollit",
  "anim",
  "id",
  "est",
  "laborum",
  "at",
  "vero",
  "eos",
  "accusamus",
  "iusto",
  "odio",
  "dignissimos",
  "ducimus",
  "blanditiis",
  "praesentium",
  "voluptatum",
  "deleniti",
  "atque",
  "corrupti",
  "quos",
  "quas",
  "molestias",
  "excepturi",
  "obcaecati",
  "cupiditate",
  "similique",
  "mollitia",
  "animi",
  "dolorum",
  "fuga",
  "harum",
  "quidem",
  "rerum",
  "facilis",
  "expedita",
  "distinctio",
  "nam",
  "libero",
  "tempore",
  "soluta",
  "nobis",
  "eligendi",
  "optio",
  "cumque",
  "impedit",
  "quo",
  "minus",
  "maxime",
  "placeat",
  "facere",
  "possimus",
  "omnis",
  "assumenda",
  "repellendus",
  "temporibus",
  "autem",
  "quibusdam",
  "officiis",
  "debitis",
  "necessitatibus",
  "saepe",
  "eveniet",
  "voluptates",
  "repudiandae",
  "recusandae",
  "itaque",
  "earum",
  "hic",
  "tenetur",
  "sapiente",
  "delectus",
  "reiciendis",
  "voluptatibus",
  "maiores",
  "alias",
  "perferendis",
  "doloribus",
  "asperiores",
  "repellat",
]

const OPENING = "Lorem ipsum dolor sit amet, consectetur adipiscing elit"

const UNITS = [
  { value: "paragraphs", label: "Paragraphs" },
  { value: "sentences", label: "Sentences" },
  { value: "words", label: "Words" },
  { value: "list", label: "List items" },
]

const OUTPUTS = [
  { value: "text", label: "Plain text" },
  { value: "html", label: "HTML paragraphs" },
  { value: "htmlList", label: "HTML list" },
]

const MAX_COUNT = 200

function randomWord(): string {
  return WORDS[secureRandomInt(WORDS.length)]
}

function randomWords(count: number): string {
  return Array.from({ length: count }, randomWord).join(" ")
}

function capitalise(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

function makeSentence(): string {
  const length = 6 + secureRandomInt(12)
  const words = randomWords(length)
  // A comma about half the time keeps the rhythm from reading as generated.
  const withComma =
    length > 9 && secureRandomInt(2) === 0
      ? words.replace(/^((?:\S+\s+){4}\S+)\s/, "$1, ")
      : words
  return `${capitalise(withComma)}.`
}

function makeParagraph(): string {
  const sentences = 3 + secureRandomInt(4)
  return Array.from({ length: sentences }, makeSentence).join(" ")
}

function escapeHtml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
}

function generate(unit: string, count: number, startWithLorem: boolean): string[] {
  if (unit === "words") {
    const words = Array.from({ length: count }, randomWord)
    if (startWithLorem) {
      const opening = OPENING.toLowerCase().replace(/,/g, "").split(" ")
      words.splice(0, Math.min(opening.length, words.length), ...opening.slice(0, count))
    }
    return [capitalise(words.slice(0, count).join(" ")) + "."]
  }

  if (unit === "sentences" || unit === "list") {
    const items = Array.from({ length: count }, makeSentence)
    if (startWithLorem && items.length) items[0] = `${OPENING}.`
    return items
  }

  const paragraphs = Array.from({ length: count }, makeParagraph)
  if (startWithLorem && paragraphs.length) {
    paragraphs[0] = `${OPENING}. ${paragraphs[0]}`
  }
  return paragraphs
}

function render(blocks: string[], unit: string, output: string): string {
  if (output === "html") {
    return blocks.map((block) => `<p>${escapeHtml(block)}</p>`).join("\n")
  }
  if (output === "htmlList") {
    const items = blocks.map((block) => `  <li>${escapeHtml(block)}</li>`).join("\n")
    return `<ul>\n${items}\n</ul>`
  }
  return blocks.join(unit === "list" ? "\n" : "\n\n")
}

export default function LoremIpsumGenerator() {
  const [unit, setUnit] = useState("paragraphs")
  const [count, setCount] = useState("3")
  const [startWithLorem, setStartWithLorem] = useState(true)
  const [output, setOutput] = useState("text")
  const [blocks, setBlocks] = useState<string[]>([])

  const numericCount = Number(count)
  const countValid =
    Number.isInteger(numericCount) && numericCount >= 1 && numericCount <= MAX_COUNT
  const countError = countValid
    ? null
    : `Enter a whole number between 1 and ${MAX_COUNT}.`

  const regenerate = useCallback(() => {
    if (!countValid) {
      setBlocks([])
      return
    }
    setBlocks(generate(unit, numericCount, startWithLorem))
  }, [countValid, unit, numericCount, startWithLorem])

  useEffect(regenerate, [regenerate])

  const text = render(blocks, unit, output)
  const wordCount = blocks.join(" ").split(/\s+/).filter(Boolean).length

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <Label htmlFor="lorem-unit">Generate</Label>
          <Select value={unit} onValueChange={(next) => next && setUnit(next as string)}>
            <SelectTrigger id="lorem-unit" className="mt-1.5 w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {UNITS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="lorem-count">How many</Label>
          <Input
            id="lorem-count"
            name="count"
            type="number"
            min={1}
            max={MAX_COUNT}
            value={count}
            onChange={(event) => setCount(event.target.value)}
            aria-invalid={countError ? true : undefined}
            className="mt-1.5"
          />
        </div>

        <div>
          <Label htmlFor="lorem-output">Output format</Label>
          <Select
            value={output}
            onValueChange={(next) => next && setOutput(next as string)}
          >
            <SelectTrigger id="lorem-output" className="mt-1.5 w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {OUTPUTS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {countError && <p className="text-destructive text-sm">{countError}</p>}

      <div className="flex items-center gap-2">
        <Switch
          id="lorem-opening"
          name="startWithLorem"
          checked={startWithLorem}
          onCheckedChange={setStartWithLorem}
        />
        <Label htmlFor="lorem-opening" className="font-normal">
          Start with the traditional opening line
        </Label>
      </div>

      <div>
        <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
          <Label htmlFor="lorem-output-text">
            Generated text
            <span className="text-muted-foreground ml-2 text-xs font-normal tabular-nums">
              {wordCount} {wordCount === 1 ? "word" : "words"}, {text.length} characters
            </span>
          </Label>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={regenerate}
              disabled={!countValid}
            >
              <RefreshCw className="size-4" />
              Regenerate
            </Button>
            <CopyButton value={text} label="Copy text" />
            <DownloadButton
              getBlob={() =>
                new Blob([text], {
                  type: output === "text" ? "text/plain" : "text/html",
                })
              }
              filename={output === "text" ? "lorem-ipsum.txt" : "lorem-ipsum.html"}
              disabled={!text}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setUnit("paragraphs")
                setCount("3")
                setStartWithLorem(true)
                setOutput("text")
              }}
            >
              <Trash2 className="size-4" />
              Reset
            </Button>
          </div>
        </div>
        <Textarea
          id="lorem-output-text"
          name="output"
          value={text}
          readOnly
          className="min-h-56 resize-y text-sm"
          placeholder="Generated placeholder text appears here"
        />
      </div>
    </div>
  )
}
