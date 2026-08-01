import { useEffect, useMemo, useRef, useState } from "react"
import { AlertCircle, Play, Square } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CopyButton } from "@/components/tool/CopyButton"

const MORSE: Record<string, string> = {
  A: ".-",
  B: "-...",
  C: "-.-.",
  D: "-..",
  E: ".",
  F: "..-.",
  G: "--.",
  H: "....",
  I: "..",
  J: ".---",
  K: "-.-",
  L: ".-..",
  M: "--",
  N: "-.",
  O: "---",
  P: ".--.",
  Q: "--.-",
  R: ".-.",
  S: "...",
  T: "-",
  U: "..-",
  V: "...-",
  W: ".--",
  X: "-..-",
  Y: "-.--",
  Z: "--..",
  "0": "-----",
  "1": ".----",
  "2": "..---",
  "3": "...--",
  "4": "....-",
  "5": ".....",
  "6": "-....",
  "7": "--...",
  "8": "---..",
  "9": "----.",
  ".": ".-.-.-",
  ",": "--..--",
  "?": "..--..",
  "'": ".----.",
  "!": "-.-.--",
  "/": "-..-.",
  "(": "-.--.",
  ")": "-.--.-",
  "&": ".-...",
  ":": "---...",
  ";": "-.-.-.",
  "=": "-...-",
  "+": ".-.-.",
  "-": "-....-",
  _: "..--.-",
  '"': ".-..-.",
  $: "...-..-",
  "@": ".--.-.",
}

const FROM_MORSE: Record<string, string> = Object.fromEntries(
  Object.entries(MORSE).map(([letter, code]) => [code, letter]),
)

interface TextToMorseResult {
  output: string
  unsupported: string[]
}

function textToMorse(text: string): TextToMorseResult {
  const unsupported = new Set<string>()

  const output = text
    .toUpperCase()
    .split(/(\s+)/)
    .map((chunk) => {
      if (/^\s*$/.test(chunk)) return chunk.includes("\n") ? "\n" : " / "
      return [...chunk]
        .map((char) => {
          const code = MORSE[char]
          if (!code) {
            unsupported.add(char)
            return ""
          }
          return code
        })
        .filter(Boolean)
        .join(" ")
    })
    .join("")
    .replace(/ {2,}/g, " ")
    .trim()

  return { output, unsupported: [...unsupported] }
}

interface MorseToTextResult {
  output: string
  unreadable: string[]
}

function morseToText(morse: string): MorseToTextResult {
  const unreadable = new Set<string>()

  const output = morse
    .trim()
    .split(/\s*\/\s*|\n/)
    .map((word) =>
      word
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .map((code) => {
          const letter = FROM_MORSE[code]
          if (!letter) {
            unreadable.add(code)
            return ""
          }
          return letter
        })
        .join(""),
    )
    .join(" ")
    .trim()

  return { output, unreadable: [...unreadable] }
}

/**
 * Schedules the whole message as gated oscillator segments up front. PARIS
 * timing: one dit is 1.2 seconds divided by the words-per-minute setting.
 */
function scheduleMorse(morse: string, wpm: number, frequency: number): AudioContext {
  const context = new AudioContext()
  const dit = 1.2 / wpm
  const oscillator = context.createOscillator()
  const gain = context.createGain()

  oscillator.type = "sine"
  oscillator.frequency.value = frequency
  gain.gain.setValueAtTime(0, context.currentTime)
  oscillator.connect(gain).connect(context.destination)

  let time = context.currentTime + 0.1

  for (const symbol of morse) {
    if (symbol === "." || symbol === "-") {
      const duration = symbol === "." ? dit : dit * 3
      gain.gain.setValueAtTime(0.25, time)
      gain.gain.setValueAtTime(0, time + duration)
      time += duration + dit
    } else if (symbol === " ") {
      time += dit * 2
    } else if (symbol === "/") {
      time += dit * 4
    }
  }

  oscillator.start()
  oscillator.stop(time + 0.1)
  return context
}

function ProblemNotice({ children }: { children: React.ReactNode }) {
  return (
    <div className="border-destructive/30 bg-destructive/10 text-destructive flex items-start gap-2 rounded-lg border p-3 text-sm">
      <AlertCircle className="mt-0.5 size-4 shrink-0" />
      <span>{children}</span>
    </div>
  )
}

export default function MorseCodeTranslator() {
  const [direction, setDirection] = useState("encode")
  const [text, setText] = useState("SOS help is on the way")
  const [morse, setMorse] = useState(".... . .-.. .-.. --- / .-- --- .-. .-.. -..")
  const [wpm, setWpm] = useState(15)
  const [playing, setPlaying] = useState(false)
  const contextRef = useRef<AudioContext | null>(null)

  const encoded = useMemo(() => textToMorse(text), [text])
  const decoded = useMemo(() => morseToText(morse), [morse])

  const morseForPlayback = direction === "encode" ? encoded.output : morse

  useEffect(() => {
    return () => {
      contextRef.current?.close()
    }
  }, [])

  function stop() {
    contextRef.current?.close()
    contextRef.current = null
    setPlaying(false)
  }

  function play() {
    stop()
    if (!morseForPlayback.trim()) return
    const context = scheduleMorse(morseForPlayback, wpm, 700)
    contextRef.current = context
    setPlaying(true)
    context.addEventListener("statechange", () => {
      if (context.state === "closed") setPlaying(false)
    })
  }

  return (
    <div className="space-y-5">
      <Tabs
        value={direction}
        onValueChange={(value) => {
          stop()
          setDirection(value as string)
        }}
      >
        <TabsList>
          <TabsTrigger value="encode">Text to Morse</TabsTrigger>
          <TabsTrigger value="decode">Morse to text</TabsTrigger>
        </TabsList>
      </Tabs>

      {direction === "encode" ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <div>
            <Label htmlFor="morse-text-input">Text</Label>
            <Textarea
              id="morse-text-input"
              name="text"
              value={text}
              onChange={(event) => setText(event.target.value)}
              placeholder="Type the message to encode."
              className="mt-1.5 min-h-40 resize-y text-sm"
            />
          </div>
          <div>
            <Label htmlFor="morse-code-output">Morse code</Label>
            <Textarea
              id="morse-code-output"
              name="morseResult"
              value={encoded.output}
              readOnly
              placeholder="The Morse code appears here."
              className="bg-muted/40 mt-1.5 min-h-40 resize-y font-mono text-sm"
              spellCheck={false}
            />
          </div>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          <div>
            <Label htmlFor="morse-code-input">Morse code</Label>
            <Textarea
              id="morse-code-input"
              name="morse"
              value={morse}
              onChange={(event) => setMorse(event.target.value)}
              placeholder="Use a space between letters and a slash between words."
              className="mt-1.5 min-h-40 resize-y font-mono text-sm"
              spellCheck={false}
            />
          </div>
          <div>
            <Label htmlFor="morse-text-output">Text</Label>
            <Textarea
              id="morse-text-output"
              name="textResult"
              value={decoded.output}
              readOnly
              placeholder="The decoded message appears here."
              className="bg-muted/40 mt-1.5 min-h-40 resize-y text-sm"
              spellCheck={false}
            />
          </div>
        </div>
      )}

      {direction === "encode" && encoded.unsupported.length > 0 && (
        <ProblemNotice>
          Morse has no code for{" "}
          {encoded.unsupported.map((char) => `"${char}"`).join(", ")}, so{" "}
          {encoded.unsupported.length === 1 ? "it was" : "they were"} left out of the
          output.
        </ProblemNotice>
      )}

      {direction === "decode" && decoded.unreadable.length > 0 && (
        <ProblemNotice>
          {decoded.unreadable.map((code) => `"${code}"`).join(", ")} did not match any
          Morse character. Letters are separated by a single space and words by a slash.
        </ProblemNotice>
      )}

      <div>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Playback speed</span>
          <span className="text-muted-foreground font-mono text-sm tabular-nums">
            {wpm} words per minute
          </span>
        </div>
        <Slider
          aria-label="Playback speed in words per minute"
          value={[wpm]}
          min={5}
          max={40}
          step={1}
          onValueChange={(value) => setWpm(Array.isArray(value) ? value[0] : value)}
          className="mt-3"
        />
        <p className="text-muted-foreground mt-2 text-xs">
          Timing follows the standard PARIS convention, where a dash is three dits long
          and the gap between words is seven.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button size="sm" onClick={play} disabled={!morseForPlayback.trim()}>
          <Play className="size-4" />
          Play as tone
        </Button>
        <Button variant="outline" size="sm" onClick={stop} disabled={!playing}>
          <Square className="size-4" />
          Stop
        </Button>
        <CopyButton
          value={direction === "encode" ? encoded.output : decoded.output}
          label="Copy result"
        />
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            stop()
            if (direction === "encode") setText("")
            else setMorse("")
          }}
        >
          Clear
        </Button>
      </div>
    </div>
  )
}
