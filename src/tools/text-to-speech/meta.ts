import { Volume2 } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "text-to-speech",
  title: "Text to Speech Reader",
  description:
    "Read any text aloud using the voices installed on your device, with no character limit or account.",
  longDescription:
    "Paste text and have it read back using the speech voices already installed on your computer or phone, controlled through the browser's Web Speech API. Because the synthesis happens on your device rather than on a server, there is no character cap, no monthly quota, no sign-up, and the text itself is never transmitted anywhere. Which voices are available depends on your operating system, so the list differs between Windows, macOS, Android, and iOS. The one thing local synthesis cannot do is hand you a file: browsers do not expose the generated audio to a page, so this reads aloud rather than exports.",
  category: "text",
  keywords: [
    "text to speech online",
    "read text aloud",
    "free tts no limit",
    "browser text to speech",
    "listen to article",
  ],
  tags: ["speech", "tts", "audio", "accessibility", "reading", "voice"],
  icon: Volume2,
  isNew: true,
  features: [
    "No character limit, no account, and no usage quota",
    "Choose any speech voice installed on your device",
    "Adjustable speed from 0.5x to 2x and adjustable pitch",
    "Pause, resume, and stop controls",
    "Word count with an estimated listening time at the current speed",
  ],
  faqs: [
    {
      question: "Why is there no character limit here?",
      answer:
        "Because no server is doing the work. Hosted text to speech services meter usage because every request costs them compute, which is why free tiers commonly stop at a few hundred characters. This page hands the text to a speech engine already installed on your device, so the only limit is your own patience.",
    },
    {
      question: "Can I download the audio as an MP3 or WAV file?",
      answer:
        "No. Browsers deliberately do not expose the audio produced by speech synthesis to the page, so there is nothing for a web tool to capture or encode. If you need a file, use a desktop application or an operating system feature that can record system audio. Everything else about this tool works without that capability.",
    },
    {
      question: "Which voices will I see?",
      answer:
        "The ones your operating system and browser provide, which is why the list is different on Windows, macOS, Android, and iOS, and why some entries sound noticeably better than others. You can usually install more language packs or higher quality voices through your operating system's accessibility or language settings, and they appear here after a page refresh.",
    },
    {
      question: "Is my text sent to a server?",
      answer:
        "No. The text stays in the page and is passed directly to the local speech engine. Nothing is uploaded, stored, or logged, which is a real difference from hosted services where pasted text reaches a third party.",
    },
  ],
}

export default meta
