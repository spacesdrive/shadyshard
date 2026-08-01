import { Captions } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "subtitle-converter",
  title: "Subtitle Converter",
  description:
    "Convert subtitles between SRT and WebVTT, or strip the timings to get a plain transcript.",
  longDescription:
    "Drop in an SRT or WebVTT file, or paste its contents, and convert it to the other format or to a plain-text transcript. The two formats differ in small ways that are easy to get wrong by hand: WebVTT needs its header line, uses a dot before the milliseconds, and treats cue numbers as optional, while SRT numbers every cue and uses a comma. The file is parsed and rewritten in your browser, so a rough cut of an unreleased video or a client's transcript never leaves your machine.",
  category: "converters",
  keywords: [
    "srt to vtt converter",
    "vtt to srt",
    "subtitle converter",
    "webvtt converter",
    "subtitle to text transcript",
  ],
  tags: ["subtitle", "srt", "vtt", "webvtt", "captions", "video", "transcript"],
  icon: Captions,
  features: [
    "Converts SRT to WebVTT and WebVTT to SRT",
    "Exports a plain-text transcript with the timings removed",
    "Accepts a dropped file or pasted subtitle text",
    "Reports the cue count and total subtitle duration",
    "Copy the result or download it with the right file extension",
  ],
  faqs: [
    {
      question: "What is the difference between SRT and WebVTT?",
      answer:
        "WebVTT is the caption format HTML5 video uses, and it requires a WEBVTT header line and a dot before the milliseconds (00:00:01.000). SRT is the older format used by most desktop players, which numbers every cue and uses a comma instead (00:00:01,000). The cue text itself is usually identical, which is why converting between them is safe.",
    },
    {
      question: "Is my subtitle file uploaded anywhere?",
      answer:
        "No. The file is read with the browser File API and parsed in JavaScript on your device. Nothing is sent to a server, which matters when the subtitles belong to a video that has not been published yet.",
    },
    {
      question: "Will my cue positioning and styling survive the conversion?",
      answer:
        "Cue text is preserved exactly, including line breaks in multi-line cues. WebVTT positioning settings that appear after the end timestamp are dropped, because SRT has no equivalent for them.",
    },
    {
      question: "Can I get just the words without any timestamps?",
      answer:
        "Yes. Choose the plain text output to get one line per cue with all numbering and timings removed, which is a usable starting point for show notes, a blog post, or a translation.",
    },
  ],
}

export default meta
