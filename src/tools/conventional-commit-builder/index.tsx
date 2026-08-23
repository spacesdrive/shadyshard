import { useMemo, useState } from "react"
import { AlertCircle, RotateCcw } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CopyButton } from "@/components/tool/CopyButton"

const TYPES = [
  { value: "feat", hint: "A new feature" },
  { value: "fix", hint: "A bug fix" },
  { value: "docs", hint: "Documentation only" },
  { value: "style", hint: "Formatting, no code change" },
  { value: "refactor", hint: "Neither fixes a bug nor adds a feature" },
  { value: "perf", hint: "Improves performance" },
  { value: "test", hint: "Adds or corrects tests" },
  { value: "build", hint: "Build system or dependencies" },
  { value: "ci", hint: "CI configuration or scripts" },
  { value: "chore", hint: "Maintenance with no source change" },
  { value: "revert", hint: "Reverts an earlier commit" },
]

const SUBJECT_LIMIT = 72

interface Problem {
  field: string
  message: string
}

function build(
  type: string,
  scope: string,
  subject: string,
  body: string,
  breaking: boolean,
  breakingDescription: string,
  references: string,
): string {
  const trimmedScope = scope.trim()
  const header = `${type}${trimmedScope ? `(${trimmedScope})` : ""}${breaking ? "!" : ""}: ${subject.trim()}`

  const footers: string[] = []
  if (breaking) {
    footers.push(
      `BREAKING CHANGE: ${breakingDescription.trim() || "describe what breaks and how to migrate"}`,
    )
  }
  const trimmedReferences = references.trim()
  if (trimmedReferences) footers.push(trimmedReferences)

  const sections = [header]
  if (body.trim()) sections.push(body.trim())
  if (footers.length > 0) sections.push(footers.join("\n"))
  return `${sections.join("\n\n")}\n`
}

export default function ConventionalCommitBuilder() {
  const [type, setType] = useState("feat")
  const [scope, setScope] = useState("")
  const [subject, setSubject] = useState("")
  const [body, setBody] = useState("")
  const [breaking, setBreaking] = useState(false)
  const [breakingDescription, setBreakingDescription] = useState("")
  const [references, setReferences] = useState("")

  const problems = useMemo(() => {
    const found: Problem[] = []
    const trimmedSubject = subject.trim()
    if (trimmedSubject === "") {
      found.push({ field: "Subject", message: "A subject is required." })
    } else {
      if (trimmedSubject.endsWith(".")) {
        found.push({
          field: "Subject",
          message: "Drop the trailing period. A commit subject is not a sentence.",
        })
      }
      const headerLength =
        `${type}${scope.trim() ? `(${scope.trim()})` : ""}${breaking ? "!" : ""}: ${trimmedSubject}`
          .length
      if (headerLength > SUBJECT_LIMIT) {
        found.push({
          field: "Subject",
          message: `The header is ${headerLength} characters. Most tooling expects ${SUBJECT_LIMIT} or fewer.`,
        })
      }
    }
    if (scope.trim() && !/^[a-z0-9][a-z0-9._/-]*$/i.test(scope.trim())) {
      found.push({
        field: "Scope",
        message:
          "A scope should be a single word using letters, digits, dots, or hyphens.",
      })
    }
    if (breaking && breakingDescription.trim() === "") {
      found.push({
        field: "Breaking change",
        message: "Describe what breaks so the footer is useful to whoever reads it.",
      })
    }
    return found
  }, [type, scope, subject, breaking, breakingDescription])

  const message = useMemo(
    () => build(type, scope, subject, body, breaking, breakingDescription, references),
    [type, scope, subject, body, breaking, breakingDescription, references],
  )

  function reset() {
    setType("feat")
    setScope("")
    setSubject("")
    setBody("")
    setBreaking(false)
    setBreakingDescription("")
    setReferences("")
  }

  const selectedType = TYPES.find((entry) => entry.value === type)

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="commit-type">Type</Label>
          <Select
            value={type}
            onValueChange={(value) => value && setType(value as string)}
          >
            <SelectTrigger id="commit-type" className="mt-1.5 w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TYPES.map((entry) => (
                <SelectItem key={entry.value} value={entry.value}>
                  {entry.value}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedType && (
            <p className="text-muted-foreground mt-1.5 text-sm">{selectedType.hint}</p>
          )}
        </div>

        <div>
          <Label htmlFor="commit-scope">Scope (optional)</Label>
          <Input
            id="commit-scope"
            name="scope"
            value={scope}
            onChange={(event) => setScope(event.target.value)}
            placeholder="parser"
            className="mt-1.5"
            spellCheck={false}
          />
          <p className="text-muted-foreground mt-1.5 text-sm">
            The part of the codebase this touches.
          </p>
        </div>
      </div>

      <div>
        <Label htmlFor="commit-subject">Subject</Label>
        <Input
          id="commit-subject"
          name="subject"
          value={subject}
          onChange={(event) => setSubject(event.target.value)}
          placeholder="add retry handling to the upload queue"
          className="mt-1.5"
        />
        <p className="text-muted-foreground mt-1.5 text-sm">
          Present tense, no trailing period.
        </p>
      </div>

      <div>
        <Label htmlFor="commit-body">Body (optional)</Label>
        <Textarea
          id="commit-body"
          name="body"
          value={body}
          onChange={(event) => setBody(event.target.value)}
          placeholder="Explain why the change was needed, not what the diff already shows."
          className="mt-1.5 min-h-28 resize-y text-sm"
        />
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Switch
            id="commit-breaking"
            name="breaking"
            checked={breaking}
            onCheckedChange={setBreaking}
          />
          <Label htmlFor="commit-breaking" className="font-normal">
            This is a breaking change
          </Label>
        </div>
        {breaking && (
          <div>
            <Label htmlFor="commit-breaking-description">What breaks</Label>
            <Input
              id="commit-breaking-description"
              name="breakingDescription"
              value={breakingDescription}
              onChange={(event) => setBreakingDescription(event.target.value)}
              placeholder="upload() no longer accepts a callback, pass a promise handler instead"
              className="mt-1.5"
            />
          </div>
        )}
      </div>

      <div>
        <Label htmlFor="commit-references">Issue references (optional)</Label>
        <Input
          id="commit-references"
          name="references"
          value={references}
          onChange={(event) => setReferences(event.target.value)}
          placeholder="Closes #142"
          className="mt-1.5"
          spellCheck={false}
        />
      </div>

      {problems.length > 0 && (
        <div className="border-destructive/30 bg-destructive/10 text-destructive rounded-lg border p-3 text-sm">
          <p className="flex items-center gap-2 font-medium">
            <AlertCircle className="size-4 shrink-0" aria-hidden />
            Check these before committing
          </p>
          <ul className="mt-2 space-y-1.5">
            {problems.map((problem) => (
              <li key={`${problem.field}-${problem.message}`}>
                {problem.field}: {problem.message}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div>
        <Label htmlFor="commit-output">Commit message</Label>
        <Textarea
          id="commit-output"
          name="message"
          value={message}
          readOnly
          className="bg-muted/40 mt-1.5 min-h-32 resize-y font-mono text-sm"
          spellCheck={false}
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <CopyButton value={message} label="Copy message" />
        <Button variant="outline" size="sm" onClick={reset}>
          <RotateCcw className="size-4" />
          Reset
        </Button>
      </div>
    </div>
  )
}
