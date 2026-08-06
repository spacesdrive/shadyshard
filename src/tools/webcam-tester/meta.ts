import { Camera } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "webcam-tester",
  title: "Webcam Tester",
  description:
    "Check your camera works, see its live preview, and read the resolution and frame rate it is actually delivering.",
  longDescription:
    "Grant access and the camera's live picture appears along with the resolution, frame rate, and device name the browser is actually negotiating, which is often not the maximum the camera is advertised as supporting. Every camera the browser can see is listed, so a laptop with a built-in camera and an external one can be checked separately, and the preview can be mirrored the way most video call applications show it. The video stream stays inside the page: no frame is recorded, uploaded, or kept, and stopping the test releases the camera and turns its indicator light off.",
  category: "browser",
  keywords: [
    "webcam test",
    "camera test online",
    "check if webcam is working",
    "test camera in browser",
    "webcam resolution and fps check",
  ],
  tags: ["webcam", "camera", "video", "hardware", "test", "browser"],
  icon: Camera,
  features: [
    "Live preview with an optional mirrored view",
    "Reports the negotiated resolution, frame rate, and device name",
    "Device picker for switching between connected cameras",
    "Clear messages for denied permission, a missing camera, or one already in use",
    "No frame is ever recorded, stored, or transmitted",
  ],
  faqs: [
    {
      question: "Is any video recorded or uploaded?",
      answer:
        "No. The stream is passed straight to a video element on this page and nothing else. No frame is captured to disk and nothing is sent over the network. Stopping the test releases the camera.",
    },
    {
      question: "Why is the resolution lower than my camera supports?",
      answer:
        "Browsers negotiate a stream rather than always taking the maximum. Lighting, the camera's driver, and whatever another application already requested can all reduce it. The figures shown are what your browser is genuinely receiving right now.",
    },
    {
      question: "It says the camera is already in use. What does that mean?",
      answer:
        "On most systems only one application can hold the camera at a time. Close the video call, streaming, or recording software that has it open and start the test again.",
    },
    {
      question: "Why are my cameras listed without names?",
      answer:
        "Browsers withhold device labels until camera permission has been granted at least once. Start the test, allow access, and the list fills in with real names.",
    },
  ],
}

export default meta
