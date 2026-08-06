import { Binary } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "ieee-754-converter",
  title: "IEEE 754 Floating Point Converter",
  description:
    "Convert a decimal number to its IEEE 754 sign, exponent, and mantissa bits, or decode bits back to a number.",
  longDescription:
    "Enter a decimal value to see exactly how a 32-bit or 64-bit float stores it: the sign bit, the biased and unbiased exponent, the mantissa bits, the hexadecimal word, and the exact decimal value those bits actually represent. Enter a hex or binary word instead and it decodes the other way. The exact stored value is computed with integer arithmetic rather than printed through the usual rounding, which is what makes it possible to see that 0.1 is really 0.1000000000000000055511151231257827021181583404541015625 and understand where a drifting sum in a test came from. Everything is computed in your browser.",
  category: "developer",
  keywords: [
    "ieee 754 converter",
    "float to hex converter",
    "floating point binary representation",
    "decode float bits",
    "single and double precision converter",
  ],
  tags: ["ieee754", "float", "binary", "hex", "developer", "numbers"],
  icon: Binary,
  features: [
    "Single precision (binary32) and double precision (binary64)",
    "Sign, exponent, and mantissa shown as separate labelled bit fields",
    "Exact decimal expansion of the stored value, not a rounded print",
    "Rounding error between what you typed and what gets stored",
    "Decodes a hexadecimal or binary word back to a number",
  ],
  faqs: [
    {
      question: "Why does the stored value differ from the number I typed?",
      answer:
        "Most decimal fractions cannot be represented exactly in binary. The converter shows the nearest representable value and the difference between it and your input, which is the rounding error that accumulates in floating point arithmetic.",
    },
    {
      question: "Is half precision (binary16) supported?",
      answer:
        "No. Only binary32 and binary64 are supported, because those are the two formats browsers can encode natively and exactly. Adding 16-bit formats would mean hand-rolling the encoding, which is exactly where a subtle bug would be hardest to notice.",
    },
    {
      question: "What do denormal and NaN inputs show?",
      answer:
        "Subnormal numbers are labelled as such and their exponent is shown as the fixed minimum rather than a decoded field. Infinity and NaN are recognised from their all-ones exponent and reported by name.",
    },
    {
      question: "Does anything I enter get sent to a server?",
      answer:
        "No. The encoding and decoding both run in your browser using a DataView and integer arithmetic. Nothing is transmitted.",
    },
  ],
}

export default meta
