import { useMemo, useState } from "react"
import { Plus, Trash2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { CopyButton } from "@/components/tool/CopyButton"
import { DownloadButton } from "@/components/tool/DownloadButton"

interface Rule {
  id: number
  find: string
  replace: string
  regex: boolean
  caseSensitive: boolean
}

interface RuleOutcome {
  id: number
  replacements: number
  error: string | null
}

function escapeForRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

function applyRules(
  text: string,
  rules: Rule[],
): { output: string; outcomes: RuleOutcome[] } {
  let current = text
  const outcomes: RuleOutcome[] = []

  for (const rule of rules) {
    if (!rule.find) {
      outcomes.push({ id: rule.id, replacements: 0, error: null })
      continue
    }

    let pattern: RegExp
    try {
      pattern = new RegExp(
        rule.regex ? rule.find : escapeForRegex(rule.find),
        rule.caseSensitive ? "g" : "gi",
      )
    } catch (error) {
      outcomes.push({
        id: rule.id,
        replacements: 0,
        error: error instanceof Error ? error.message : "This pattern is not valid.",
      })
      continue
    }

    const replacements = current.match(pattern)?.length ?? 0
    // In plain mode the replacement is inserted literally, so "$" has to be
    // escaped or JavaScript would read "$&" and friends as group references.
    const replacement = rule.regex ? rule.replace : rule.replace.replace(/\$/g, "$$$$")
    current = current.replace(pattern, replacement)
    outcomes.push({ id: rule.id, replacements, error: null })
  }

  return { output: current, outcomes }
}

export default function BulkFindReplace() {
  const [text, setText] = useState("")
  const [rules, setRules] = useState<Rule[]>([
    { id: 1, find: "", replace: "", regex: false, caseSensitive: false },
  ])
  const [nextId, setNextId] = useState(2)

  const { output, outcomes } = useMemo(() => applyRules(text, rules), [text, rules])
  const totalReplacements = outcomes.reduce(
    (total, outcome) => total + outcome.replacements,
    0,
  )

  function updateRule(id: number, patch: Partial<Rule>) {
    setRules((current) =>
      current.map((rule) => (rule.id === id ? { ...rule, ...patch } : rule)),
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="bulk-replace-input">Text</Label>
        <Textarea
          id="bulk-replace-input"
          name="text"
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Paste the text you want to run the rules over."
          className="mt-1.5 min-h-40 resize-y text-sm"
        />
      </div>

      <div className="space-y-3">
        {rules.map((rule, index) => {
          const outcome = outcomes.find((entry) => entry.id === rule.id)
          return (
            <div key={rule.id} className="border-border/60 rounded-lg border p-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <Label htmlFor={`bulk-find-${rule.id}`}>Find</Label>
                  <Input
                    id={`bulk-find-${rule.id}`}
                    name={`find-${rule.id}`}
                    value={rule.find}
                    onChange={(event) =>
                      updateRule(rule.id, { find: event.target.value })
                    }
                    placeholder={rule.regex ? "\\bcolour\\b" : "colour"}
                    className="mt-1.5 font-mono text-sm"
                    spellCheck={false}
                    aria-invalid={outcome?.error ? true : undefined}
                  />
                </div>
                <div>
                  <Label htmlFor={`bulk-replace-${rule.id}`}>Replace with</Label>
                  <Input
                    id={`bulk-replace-${rule.id}`}
                    name={`replace-${rule.id}`}
                    value={rule.replace}
                    onChange={(event) =>
                      updateRule(rule.id, { replace: event.target.value })
                    }
                    placeholder="color"
                    className="mt-1.5 font-mono text-sm"
                    spellCheck={false}
                  />
                </div>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2">
                <div className="flex items-center gap-2">
                  <Switch
                    id={`bulk-regex-${rule.id}`}
                    name={`regex-${rule.id}`}
                    checked={rule.regex}
                    onCheckedChange={(checked) => updateRule(rule.id, { regex: checked })}
                  />
                  <Label htmlFor={`bulk-regex-${rule.id}`} className="font-normal">
                    Regular expression
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    id={`bulk-case-${rule.id}`}
                    name={`case-${rule.id}`}
                    checked={rule.caseSensitive}
                    onCheckedChange={(checked) =>
                      updateRule(rule.id, { caseSensitive: checked })
                    }
                  />
                  <Label htmlFor={`bulk-case-${rule.id}`} className="font-normal">
                    Match case
                  </Label>
                </div>
                <span className="text-muted-foreground text-sm tabular-nums">
                  {outcome?.replacements ?? 0} replacement
                  {(outcome?.replacements ?? 0) === 1 ? "" : "s"}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="ml-auto"
                  aria-label={`Remove rule ${index + 1}`}
                  disabled={rules.length === 1}
                  onClick={() =>
                    setRules((current) => current.filter((entry) => entry.id !== rule.id))
                  }
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>

              {outcome?.error && (
                <p className="text-destructive mt-2 text-sm">
                  Rule {index + 1} was skipped: {outcome.error}
                </p>
              )}
            </div>
          )
        })}
      </div>

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => {
          setRules((current) => [
            ...current,
            { id: nextId, find: "", replace: "", regex: false, caseSensitive: false },
          ])
          setNextId((current) => current + 1)
        }}
      >
        <Plus className="size-4" />
        Add rule
      </Button>

      <p className="text-muted-foreground text-sm tabular-nums">
        {totalReplacements} replacement{totalReplacements === 1 ? "" : "s"} across{" "}
        {rules.length} rule{rules.length === 1 ? "" : "s"}.
      </p>

      <div>
        <Label htmlFor="bulk-replace-output">Result</Label>
        <Textarea
          id="bulk-replace-output"
          name="output"
          value={output}
          readOnly
          placeholder="The rewritten text will appear here."
          className="mt-1.5 min-h-40 resize-y text-sm"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <CopyButton value={output} label="Copy result" />
        <DownloadButton
          getBlob={() => new Blob([output], { type: "text/plain" })}
          filename="replaced.txt"
          disabled={!output}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            setText("")
            setRules([
              { id: nextId, find: "", replace: "", regex: false, caseSensitive: false },
            ])
            setNextId((current) => current + 1)
          }}
        >
          Reset
        </Button>
      </div>
    </div>
  )
}
