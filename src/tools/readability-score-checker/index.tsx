import { useMemo, useState } from "react"
import { Trash2 } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { CopyButton } from "@/components/tool/CopyButton"

/**
 * Vowel-group syllable heuristic. Every mainstream readability tool uses some
 * variant of it, since a dictionary lookup is not available offline.
 */
function countSyllables(word: string): number {
  const letters = word.toLowerCase().replace(/[^a-z]/g, "")
  if (!letters) return 0
  if (letters.length <= 3) return 1

  const trimmed = letters.replace(/(?:[^laeiouy]es|[^laeiouy]e)$/, "").replace(/^y/, "")
  const groups = trimmed.match(/[aeiouy]{1,2}/g)
  return groups ? groups.length : 1
}

interface Analysis {
  words: number
  sentences: number
  syllables: number
  letters: number
  complexWords: number
  fleschReadingEase: number
  fleschKincaidGrade: number
  gunningFog: number
  smog: number
  colemanLiau: number
  automatedReadability: number
  longSentences: { text: string; words: number }[]
}

function analyze(text: string): Analysis | null {
  const sentenceParts = (text.match(/[^.!?]+[.!?]*/g) ?? [])
    .map((part) => part.trim())
    .filter((part) => /[a-z0-9]/i.test(part))
  const wordList = text.match(/[A-Za-z']+(?:-[A-Za-z']+)*/g) ?? []

  if (wordList.length < 10 || sentenceParts.length === 0) return null

  const words = wordList.length
  const sentences = sentenceParts.length
  const syllablesPerWord = wordList.map(countSyllables)
  const syllables = syllablesPerWord.reduce((total, count) => total + count, 0)
  const complexWords = syllablesPerWord.filter((count) => count >= 3).length
  const letters = wordList.join("").replace(/[^A-Za-z]/g, "").length

  const wordsPerSentence = words / sentences
  const syllablesPerWordAverage = syllables / words
  const lettersPer100Words = (letters / words) * 100
  const sentencesPer100Words = (sentences / words) * 100

  const longSentences = sentenceParts
    .map((part) => ({
      text: part,
      words: (part.match(/[A-Za-z']+(?:-[A-Za-z']+)*/g) ?? []).length,
    }))
    .filter((sentence) => sentence.words >= 25)
    .sort((a, b) => b.words - a.words)
    .slice(0, 5)

  return {
    words,
    sentences,
    syllables,
    letters,
    complexWords,
    fleschReadingEase:
      206.835 - 1.015 * wordsPerSentence - 84.6 * syllablesPerWordAverage,
    fleschKincaidGrade: 0.39 * wordsPerSentence + 11.8 * syllablesPerWordAverage - 15.59,
    gunningFog: 0.4 * (wordsPerSentence + 100 * (complexWords / words)),
    smog: 1.043 * Math.sqrt(complexWords * (30 / sentences)) + 3.1291,
    colemanLiau: 0.0588 * lettersPer100Words - 0.296 * sentencesPer100Words - 15.8,
    automatedReadability: 4.71 * (letters / words) + 0.5 * wordsPerSentence - 21.43,
    longSentences,
  }
}

const EASE_BANDS: { min: number; label: string }[] = [
  { min: 90, label: "Very easy, around a 5th grade reading level" },
  { min: 80, label: "Easy, around a 6th grade reading level" },
  { min: 70, label: "Fairly easy, around a 7th grade reading level" },
  { min: 60, label: "Plain English, around an 8th to 9th grade reading level" },
  { min: 50, label: "Fairly difficult, around a 10th to 12th grade reading level" },
  { min: 30, label: "Difficult, around a university reading level" },
  { min: -Infinity, label: "Very difficult, around a graduate reading level" },
]

function easeBand(score: number): string {
  return EASE_BANDS.find((band) => score >= band.min)?.label ?? EASE_BANDS[0].label
}

function round(value: number): string {
  return value.toFixed(1)
}

const SAMPLE = `Readability formulas do not measure whether writing is good. They measure how much work a sentence asks a reader to do, using sentence length and word length as a stand-in for effort.

That makes them useful as a quick check on a draft, and misleading as a target to optimise. A page of two-word sentences scores well and reads badly. Use the score to find the paragraph that drifted, then fix the paragraph.`

export default function ReadabilityScoreChecker() {
  const [text, setText] = useState(SAMPLE)
  const analysis = useMemo(() => analyze(text), [text])

  const grades = analysis
    ? [
        { label: "Flesch-Kincaid grade", value: analysis.fleschKincaidGrade },
        { label: "Gunning Fog index", value: analysis.gunningFog },
        { label: "SMOG index", value: analysis.smog },
        { label: "Coleman-Liau index", value: analysis.colemanLiau },
        { label: "Automated readability index", value: analysis.automatedReadability },
      ]
    : []

  const report = analysis
    ? [
        `Flesch Reading Ease: ${round(analysis.fleschReadingEase)} (${easeBand(analysis.fleschReadingEase)})`,
        ...grades.map((grade) => `${grade.label}: ${round(grade.value)}`),
        `Words: ${analysis.words}`,
        `Sentences: ${analysis.sentences}`,
        `Syllables: ${analysis.syllables}`,
        `Words of 3+ syllables: ${analysis.complexWords}`,
        `Average words per sentence: ${round(analysis.words / analysis.sentences)}`,
      ].join("\n")
    : ""

  return (
    <div className="space-y-5">
      <Textarea
        id="readability-input"
        name="text"
        value={text}
        onChange={(event) => setText(event.target.value)}
        placeholder="Paste the draft you want to score..."
        className="min-h-56 resize-y text-sm"
        aria-label="Text to score"
      />

      <div className="flex flex-wrap gap-2">
        <CopyButton value={report} label="Copy report" />
        <Button variant="outline" size="sm" onClick={() => setText("")} disabled={!text}>
          <Trash2 className="size-4" />
          Clear
        </Button>
      </div>

      {!analysis && (
        <p className="text-muted-foreground text-sm">
          Enter at least ten words and one complete sentence to calculate a score.
          Readability formulas are unstable on very short passages.
        </p>
      )}

      {analysis && (
        <>
          <div className="border-border/60 rounded-xl border p-4">
            <p className="text-muted-foreground text-xs">Flesch Reading Ease</p>
            <p className="mt-1 text-4xl font-semibold tabular-nums">
              {round(analysis.fleschReadingEase)}
            </p>
            <p className="text-muted-foreground mt-1 text-sm">
              {easeBand(analysis.fleschReadingEase)}
            </p>
            <div className="bg-muted mt-3 h-1.5 overflow-hidden rounded-full">
              <div
                className="bg-primary h-full"
                style={{
                  width: `${Math.min(100, Math.max(0, analysis.fleschReadingEase))}%`,
                }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {grades.map((grade) => (
              <div
                key={grade.label}
                className="border-border/60 rounded-lg border p-3 text-center"
              >
                <p className="text-2xl font-semibold tabular-nums">
                  {round(grade.value)}
                </p>
                <p className="text-muted-foreground mt-1 text-xs">{grade.label}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: "Words", value: analysis.words },
              { label: "Sentences", value: analysis.sentences },
              { label: "Syllables", value: analysis.syllables },
              { label: "Words of 3+ syllables", value: analysis.complexWords },
            ].map((stat) => (
              <div key={stat.label} className="bg-muted/40 rounded-lg p-3 text-center">
                <p className="text-lg font-semibold tabular-nums">{stat.value}</p>
                <p className="text-muted-foreground mt-1 text-xs">{stat.label}</p>
              </div>
            ))}
          </div>

          {analysis.longSentences.length > 0 && (
            <div>
              <h3 className="text-sm font-medium">
                Longest sentences ({analysis.longSentences.length} of 25 words or more)
              </h3>
              <ul className="mt-2 space-y-2">
                {analysis.longSentences.map((sentence) => (
                  <li
                    key={sentence.text}
                    className="border-border/60 rounded-lg border p-3 text-sm"
                  >
                    <span className="text-muted-foreground mr-2 text-xs tabular-nums">
                      {sentence.words} words
                    </span>
                    {sentence.text}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  )
}
