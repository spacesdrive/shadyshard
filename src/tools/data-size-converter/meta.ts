import { HardDrive } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "data-size-converter",
  title: "Data Size Converter",
  description:
    "Convert between bytes, KB, MB, GB and their binary counterparts KiB, MiB, GiB, with bits included.",
  longDescription:
    "Enter a size in any unit and see it in every other unit at once, with decimal units (KB, MB, GB, TB, based on 1000) and binary units (KiB, MiB, GiB, TiB, based on 1024) shown side by side rather than mixed together. This is the distinction behind the familiar complaint that a 1 TB drive shows up as 931 GB: the drive is sold in decimal terabytes and reported by the operating system in binary tebibytes. Bits are included too, which is what makes a bandwidth figure in megabits comparable to a file size in megabytes. All conversion is arithmetic done in your browser.",
  category: "converters",
  keywords: [
    "data size converter",
    "kb to kib converter",
    "gb vs gib",
    "bytes to megabytes",
    "megabits to megabytes",
  ],
  tags: ["bytes", "storage", "size", "binary", "decimal", "bits", "units"],
  icon: HardDrive,
  isNew: true,
  features: [
    "Decimal units (KB, MB, GB, TB, PB) and binary units (KiB, MiB, GiB, TiB, PiB) side by side",
    "Bits and bytes in the same table for bandwidth comparisons",
    "Live conversion from whichever unit you type in",
    "Exact byte count shown for the entered value",
    "Copy any converted value with one click",
  ],
  faqs: [
    {
      question: "What is the difference between KB and KiB?",
      answer:
        "A kilobyte (KB) is 1,000 bytes and a kibibyte (KiB) is 1,024 bytes. The binary units KiB, MiB, GiB and TiB were standardised in 1998 precisely to remove the ambiguity, but everyday usage still mixes them, which is why the same file can be described with two different numbers.",
    },
    {
      question: "Why does my 1 TB drive show as about 931 GB?",
      answer:
        "Drive manufacturers sell capacity in decimal terabytes, so 1 TB is 1,000,000,000,000 bytes. Windows reports that same capacity in binary tebibytes but labels them GB, and 1,000,000,000,000 bytes is about 931 GiB. No space is missing, the two numbers are the same capacity in different units.",
    },
    {
      question: "How do megabits relate to megabytes?",
      answer:
        "There are 8 bits in a byte, so 1 megabyte is 8 megabits. Internet speeds are quoted in megabits per second while download sizes are shown in megabytes, which is why a 100 Mbps connection downloads at roughly 12.5 MB per second at best.",
    },
    {
      question: "Is anything I type here sent anywhere?",
      answer:
        "No. The conversion is straightforward arithmetic performed in JavaScript in your browser, with no network request involved.",
    },
  ],
}

export default meta
