import { Monitor } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "dead-pixel-tester",
  title: "Dead Pixel Tester",
  description:
    "Fill the screen with solid test colours to find dead, stuck, and hot pixels on a monitor or phone.",
  longDescription:
    "A dead pixel stays black on every colour, a stuck pixel stays lit on one colour, and a hot pixel stays white. None of them are visible against ordinary content, which is why a screen has to be filled edge to edge with one flat colour at a time to find them. This fills the screen with black, white, and the primary and secondary colours in turn, using the Fullscreen API so no browser chrome covers any part of the panel. Step through the colours with a click, the arrow keys, or the space bar, and leave with Escape. It is worth running on a new monitor or phone while the return window is still open, since most manufacturers set a minimum number of faulty pixels before they will replace a panel.",
  category: "browser",
  keywords: [
    "dead pixel test",
    "stuck pixel checker",
    "monitor test full screen colours",
    "check new monitor for faulty pixels",
    "screen pixel test online",
  ],
  tags: ["monitor", "screen", "display", "hardware", "test", "pixels"],
  icon: Monitor,
  isNew: true,
  features: [
    "Nine full-screen test colours including black, white, and mid grey",
    "True full screen through the Fullscreen API, with no browser chrome in the way",
    "Click, arrow keys, or space bar to step through colours",
    "Escape leaves the test at any point",
    "Works on a phone or tablet screen as well as a desktop monitor",
  ],
  faqs: [
    {
      question: "What is the difference between a dead pixel and a stuck pixel?",
      answer:
        "A dead pixel receives no power, so it stays black on every test colour, including white. A stuck pixel is powered but fixed on one subpixel value, so it shows as a persistent red, green, blue, cyan, magenta, or yellow dot, most obvious against black. A hot pixel is the opposite, staying white on every colour.",
    },
    {
      question: "Can a stuck pixel be fixed?",
      answer:
        "Sometimes. Cycling colours rapidly for several minutes, or applying very gentle pressure through a soft cloth on a powered-off screen, occasionally frees one. A genuinely dead pixel cannot be revived, since the problem is that the cell gets no power at all.",
    },
    {
      question: "Why did the test not go full screen?",
      answer:
        "Some browsers block the Fullscreen API in embedded contexts or when a page has no direct user interaction. The test still fills the browser window, which is enough to check most of the panel, but pressing F11 first gives you the whole screen.",
    },
    {
      question: "Does this send anything about my display anywhere?",
      answer:
        "No. The page only paints colours; it reads nothing about your hardware and makes no network request while the test runs.",
    },
  ],
}

export default meta
