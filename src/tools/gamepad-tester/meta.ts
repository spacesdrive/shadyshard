import { Gamepad2 } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "gamepad-tester",
  title: "Gamepad Tester",
  description:
    "Test every button, trigger, and stick on a connected controller, and measure analogue stick drift.",
  longDescription:
    "Connect a controller over USB or Bluetooth and see exactly what the browser receives from it: which buttons register, how far each trigger travels, and where the sticks sit at rest. The drift test is the part most people come for. Put the controller down, start the test, and the tool records the largest stick movement it sees while nothing is touching it, which is the measurement that tells you whether a stick is genuinely drifting or just noisy. Everything is read through the browser's Gamepad API and stays on your device, with no driver, extension, or account involved.",
  category: "browser",
  keywords: [
    "gamepad tester",
    "controller test online",
    "stick drift test",
    "test xbox controller",
    "check playstation controller buttons",
  ],
  tags: ["gamepad", "controller", "hardware", "test", "drift"],
  icon: Gamepad2,
  isNew: true,
  features: [
    "Live button, trigger, and axis readings for any connected controller",
    "Left and right stick position visualisers",
    "Timed drift test that records the largest resting stick movement",
    "Rumble test where the controller and browser support it",
    "Handles several controllers connected at once",
  ],
  faqs: [
    {
      question:
        "Why does the page say no controller is connected when one is plugged in?",
      answer:
        "Browsers deliberately hide gamepads until the page has seen input from them, so a controller stays invisible until you press a button or move a stick on it. Press any button once and it will appear.",
    },
    {
      question: "How much stick drift is a problem?",
      answer:
        "A resting reading under about 0.05 is normal and games will filter it out with their own deadzone. Between 0.05 and 0.15 you may notice slow movement in menus. Above 0.15 the stick is drifting enough to affect aiming, and the stick module or its potentiometers are usually the cause.",
    },
    {
      question: "Why do the button numbers not match the labels on my controller?",
      answer:
        "The Gamepad API reports buttons by index. When the browser recognises a controller it maps those indexes to the standard layout, which is shown as the mapping value. If the mapping reads as unmapped, the indexes come straight from the device and will not line up with any particular controller's printed labels.",
    },
    {
      question: "Does the rumble test work everywhere?",
      answer:
        "No. Vibration needs both the browser and the controller to support the gamepad haptics API, which in practice means a Chromium-based browser and a controller connected over USB or a supported Bluetooth profile. The button is hidden when the connected controller does not expose an actuator.",
    },
  ],
}

export default meta
