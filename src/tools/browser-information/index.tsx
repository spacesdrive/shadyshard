import { useEffect, useState } from "react"
import { CopyButton } from "@/components/tool/CopyButton"

interface ExtendedNavigator extends Navigator {
  deviceMemory?: number
  connection?: { effectiveType?: string }
}

function collectInfo() {
  const nav = navigator as ExtendedNavigator
  return {
    "User agent": nav.userAgent,
    Platform: nav.platform || "Unavailable",
    Language: nav.language,
    Languages: nav.languages?.join(", ") ?? "Unavailable",
    "Cookies enabled": nav.cookieEnabled ? "Yes" : "No",
    Online: nav.onLine ? "Yes" : "No",
    "CPU cores": nav.hardwareConcurrency?.toString() ?? "Unavailable",
    "Device memory": nav.deviceMemory ? `${nav.deviceMemory} GB` : "Unavailable",
    "Connection type": nav.connection?.effectiveType ?? "Unavailable",
    "Screen resolution": `${screen.width} x ${screen.height}`,
    "Viewport size": `${window.innerWidth} x ${window.innerHeight}`,
    "Color depth": `${screen.colorDepth}-bit`,
    "Pixel ratio": window.devicePixelRatio.toString(),
    "Time zone": Intl.DateTimeFormat().resolvedOptions().timeZone,
  }
}

export default function BrowserInformation() {
  const [info, setInfo] = useState(collectInfo)

  useEffect(() => {
    const update = () => setInfo(collectInfo())
    window.addEventListener("resize", update)
    window.addEventListener("online", update)
    window.addEventListener("offline", update)
    return () => {
      window.removeEventListener("resize", update)
      window.removeEventListener("online", update)
      window.removeEventListener("offline", update)
    }
  }, [])

  const asText = Object.entries(info)
    .map(([label, value]) => `${label}: ${value}`)
    .join("\n")

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <CopyButton value={asText} label="Copy all" />
      </div>
      <dl className="divide-border/60 border-border/60 divide-y rounded-lg border">
        {Object.entries(info).map(([label, value]) => (
          <div
            key={label}
            className="flex items-center justify-between gap-4 px-4 py-2.5 text-sm"
          >
            <dt className="text-muted-foreground">{label}</dt>
            <dd className="truncate text-right font-mono text-xs">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
