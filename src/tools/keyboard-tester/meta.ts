import { Keyboard } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "keyboard-tester",
  title: "Keyboard Tester",
  description:
    "Press every key to check which ones register, with live key codes and stuck-key detection.",
  longDescription:
    "Check a keyboard key by key before you buy it, after a spill, or when one letter has started dropping out. Every key you press lights up on the on-screen layout and stays marked as tested, so you can work across the whole board and see at a glance what never responded. The panel below shows the exact key, code, and location the browser reported, which is what you need when a key registers as the wrong character rather than not at all. Nothing is recorded or sent anywhere: the page only reads keyboard events while it is open, and closing the tab discards everything.",
  category: "browser",
  keywords: [
    "keyboard tester",
    "test keyboard keys online",
    "check for stuck keys",
    "key code viewer",
    "keyboard not working test",
  ],
  tags: ["keyboard", "hardware", "test", "keycode", "input"],
  icon: Keyboard,
  isNew: true,
  features: [
    "Full layout that marks every key as you press it",
    "Live key, code, keyCode, and left or right location readout",
    "Running list of the last keys pressed",
    "Stuck-key detection for keys that never release",
    "Counts how many distinct keys have been tested",
  ],
  faqs: [
    {
      question: "Why do some keys not light up when I press them?",
      answer:
        "A few keys never reach the page. Fn is handled inside the keyboard itself, and the operating system intercepts combinations such as Alt+Tab, Command+Tab, and the Windows key before the browser sees them. Media and brightness keys are usually handled by the system too. If an ordinary letter, number, or arrow key does not light up, that is a genuine fault.",
    },
    {
      question: "Does this tool block browser shortcuts while it is open?",
      answer:
        "No. The tester listens for key events but never cancels them, so Tab still moves focus and Ctrl+T still opens a tab. That keeps the page usable with a keyboard, at the cost of not being able to test shortcuts the browser claims for itself.",
    },
    {
      question: "What does the stuck-key warning mean?",
      answer:
        "It means the browser reported a key going down but never reported it coming back up. That usually points at a physical switch that is not releasing, though it can also happen if you press a key and then switch windows before letting go.",
    },
    {
      question: "Is anything I type recorded?",
      answer:
        "No. Key events are held in the page's memory to draw the layout and the recent-key list, and they are discarded when you close or reload the tab. Nothing is written to storage and nothing is sent to a server.",
    },
  ],
}

export default meta
