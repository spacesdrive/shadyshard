import { Clock4 } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "subtitle-timing-shifter",
  title: "Subtitle Timing Shifter",
  description:
    "Shift every subtitle cue forward or backward by a fixed offset to resync captions with your video.",
  longDescription:
    "When subtitles run consistently early or late against a video, every cue needs the same correction. Load an SRT or WebVTT file, enter the offset in seconds and milliseconds, and every start and end timestamp moves by that amount. A preview of the first cues shows the old and new timings side by side so you can confirm the direction before downloading. Cues are never allowed to move below zero, and the file is rewritten in the format it came in. Everything runs in your browser with no upload.",
  category: "converters",
  keywords: [
    "shift subtitle timing",
    "resync subtitles",
    "srt delay fix",
    "subtitle offset tool",
    "subtitles out of sync",
  ],
  tags: ["subtitle", "srt", "vtt", "sync", "timing", "video", "offset"],
  icon: Clock4,
  isNew: true,
  features: [
    "Shifts every cue by a single offset, forward or backward",
    "Side-by-side preview of original and shifted timings",
    "Keeps the input format, SRT in gives SRT out",
    "Clamps negative results to zero so no cue starts before the video does",
    "Copy or download the corrected file",
  ],
  relatedTools: [
    "subtitle-converter",
    "time-duration-calculator",
    "unix-timestamp-converter",
  ],
  faqs: [
    {
      question: "Which direction should I shift the subtitles?",
      answer:
        "If the subtitles appear before the words are spoken they are early, so use a positive offset to push them later. If they appear after the dialogue they are late, so use a negative offset to pull them earlier.",
    },
    {
      question:
        "My subtitles drift further out of sync as the video plays. Will this fix it?",
      answer:
        "No. A fixed offset only corrects subtitles that are wrong by the same amount from start to finish. Progressive drift usually means the subtitle file was timed against a different frame rate, which needs the timings scaled rather than shifted.",
    },
    {
      question: "Does this work with WebVTT as well as SRT?",
      answer:
        "Yes. Both formats are parsed into the same cue list, and the shifted file is written back in whichever format you loaded, so a WebVTT file stays valid WebVTT with its header intact.",
    },
    {
      question: "Is the subtitle file sent to a server?",
      answer:
        "No. The file is read locally with the browser File API and all timestamp arithmetic happens in JavaScript on your device.",
    },
  ],
}

export default meta
