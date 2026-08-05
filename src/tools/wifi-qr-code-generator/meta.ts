import { Wifi } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "wifi-qr-code-generator",
  title: "WiFi QR Code Generator",
  description:
    "Turn a network name and password into a scannable WiFi QR code that joins the network automatically.",
  longDescription:
    "Print one code for guests instead of reading a long password out loud. This tool builds the WIFI payload that Android and iOS cameras understand, escaping the characters that break most hand-built codes: semicolons, colons, commas, quotes, and backslashes in a password all have to be escaped or the phone reads a truncated password and silently fails to connect. It also handles hidden networks and passwords that look like hex strings, which need quoting to be read correctly. The code is drawn in your browser, so the network password is never uploaded, logged, or shortened through a redirect service.",
  category: "qr",
  keywords: [
    "wifi qr code generator",
    "share wifi password qr code",
    "guest wifi qr code",
    "wifi qr code for printing",
    "scan to connect wifi",
  ],
  tags: ["wifi", "qr", "network", "password", "guest"],
  icon: Wifi,
  isNew: true,
  features: [
    "Builds a standards-compliant WIFI payload for phone cameras",
    "Escapes special characters in network names and passwords",
    "WPA, WPA2, WPA3, WEP, and open-network support",
    "Hidden network flag for networks that do not broadcast an SSID",
    "Adjustable size and downloadable PNG for printing",
  ],
  faqs: [
    {
      question: "Which phones can scan a WiFi QR code?",
      answer:
        "The built-in camera app on iOS 11 and later and on Android 10 and later reads these codes and offers to join the network. Older Android versions can scan them from the WiFi settings screen instead of the camera.",
    },
    {
      question: "Is my WiFi password sent anywhere?",
      answer:
        "No. The payload is assembled and drawn to a canvas entirely inside your browser. Nothing is uploaded and no shortened link is created, which matters because a QR code stores the password in plain text and any service that generated it server-side would have seen it.",
    },
    {
      question: "Should I pick WPA or WPA3 for a WPA3 network?",
      answer:
        "Choose WPA unless you know every device scanning the code is recent. Most WPA3 routers still accept the WPA payload type, while the SAE payload type used for WPA3-only networks is not understood by older camera apps.",
    },
    {
      question: "Why does my password need escaping?",
      answer:
        "The WIFI payload separates fields with semicolons and colons, so a password containing one of those characters would end the field early. This tool escapes backslashes, semicolons, colons, commas, and double quotes automatically, which is the usual reason a hand-typed code connects to nothing. A password that reads as a raw hexadecimal key, such as a 26 or 64 character WEP or WPA key, is also wrapped in quotes so it is not decoded as bytes.",
    },
  ],
}

export default meta
