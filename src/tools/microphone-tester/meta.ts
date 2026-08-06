import { Mic } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "microphone-tester",
  title: "Microphone Tester",
  description:
    "Check that your microphone works, see its live input level, and pick between connected devices.",
  longDescription:
    "Before a call or a recording, the question is simply whether the right microphone is selected and whether it is picking anything up. Grant access and you get a live level meter, a peak reading that holds so a brief clip is visible after it happens, and a waveform that makes the difference between silence and a very quiet signal obvious. Every input device the browser can see is listed, so you can confirm the headset is being used rather than the laptop's built-in microphone. The audio is analysed by the Web Audio API in your browser and is never recorded, stored, or sent anywhere, which is the difference between this and a site that asks you to upload a sample.",
  category: "browser",
  keywords: [
    "microphone test",
    "mic test online",
    "check if microphone is working",
    "audio input level meter",
    "test headset mic in browser",
  ],
  tags: ["microphone", "audio", "hardware", "test", "browser", "input"],
  icon: Mic,
  features: [
    "Live input level meter with a holding peak reading",
    "Waveform display that makes a quiet signal visible",
    "Device picker listing every microphone the browser can see",
    "Reports the sample rate and channel count actually in use",
    "Nothing is recorded, stored, or transmitted",
  ],
  faqs: [
    {
      question: "Is my voice recorded or uploaded?",
      answer:
        "No. The audio stream is analysed frame by frame by the Web Audio API and discarded immediately. Nothing is written to disk and nothing is sent over the network. Stopping the test releases the microphone.",
    },
    {
      question: "Why does the browser ask for permission?",
      answer:
        "Reading a microphone requires explicit consent, which is a browser security rule rather than something this page controls. Access ends as soon as you stop the test or close the tab.",
    },
    {
      question: "Why is the device list showing unnamed devices?",
      answer:
        "Browsers hide device labels until microphone permission has been granted at least once. Start the test, allow access, and the list fills in with real device names.",
    },
    {
      question: "The meter moves but the other person cannot hear me. What now?",
      answer:
        "If the meter responds, the microphone and the browser are working, so the problem is downstream: the wrong input selected inside the call application, that application muted, or the operating system's own input volume set very low.",
    },
  ],
  isNew: true,
}

export default meta
