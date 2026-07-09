import {
  FileText,
  Image as ImageIcon,
  FileCode2,
  Calculator,
  Palette,
  KeyRound,
  FileJson,
  Ruler,
  QrCode,
  Clock,
  Paintbrush,
  Search,
  Globe,
  GraduationCap,
} from "lucide-react"
import type { ToolCategory } from "@/types/tool"

export const categories: ToolCategory[] = [
  {
    slug: "text",
    title: "Text Tools",
    description: "Count, format, transform, and clean up text instantly.",
    icon: FileText,
  },
  {
    slug: "image",
    title: "Image Tools",
    description: "Resize, convert, compress, and edit images in your browser.",
    icon: ImageIcon,
  },
  {
    slug: "pdf",
    title: "PDF Tools",
    description: "Merge, split, compress, and convert PDF files locally.",
    icon: FileCode2,
  },
  {
    slug: "converters",
    title: "Converters",
    description: "Convert between units, formats, and data types.",
    icon: Ruler,
  },
  {
    slug: "generators",
    title: "Generators",
    description: "Generate passwords, UUIDs, QR codes, and more.",
    icon: QrCode,
  },
  {
    slug: "developer",
    title: "Developer Tools",
    description: "Format, validate, and debug code and data structures.",
    icon: FileJson,
  },
  {
    slug: "math",
    title: "Math & Calculators",
    description: "Calculators for everyday and specialized math.",
    icon: Calculator,
  },
  {
    slug: "color",
    title: "Color Tools",
    description: "Pick, convert, and build palettes with color tools.",
    icon: Palette,
  },
  {
    slug: "security",
    title: "Security & Privacy",
    description: "Hash, encode, and inspect data securely offline.",
    icon: KeyRound,
  },
  {
    slug: "time",
    title: "Time & Date",
    description: "Convert timestamps, time zones, and durations.",
    icon: Clock,
  },
  {
    slug: "css",
    title: "CSS Generators",
    description: "Generate and preview CSS for shadows, borders, grids, and flexbox.",
    icon: Paintbrush,
  },
  {
    slug: "seo",
    title: "SEO Tools",
    description:
      "Generate meta tags, sitemaps, and preview how pages appear in search and social.",
    icon: Search,
  },
  {
    slug: "qr",
    title: "QR Code Tools",
    description: "Generate and scan QR codes.",
    icon: QrCode,
  },
  {
    slug: "browser",
    title: "Browser & System Info",
    description: "Inspect your browser, device, and clipboard.",
    icon: Globe,
  },
  {
    slug: "student",
    title: "Student Tools",
    description: "CGPA, credit, and planning calculators for IITM BS students.",
    icon: GraduationCap,
  },
]

export const categoryMap: Record<string, ToolCategory> = Object.fromEntries(
  categories.map((c) => [c.slug, c]),
)

export function getCategory(slug: string): ToolCategory | undefined {
  return categoryMap[slug]
}
