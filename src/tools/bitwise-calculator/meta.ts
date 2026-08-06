import { Calculator } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "bitwise-calculator",
  title: "Bitwise Calculator",
  description:
    "Apply AND, OR, XOR, NOT, and shifts to two integers and see the result in binary, hex, and decimal.",
  longDescription:
    "Enter two operands in decimal, hexadecimal, octal, or binary, pick an operator, and see the operation laid out bit by bit alongside the result in every base. Width matters for bitwise work, so you choose 8, 16, 32, or 64 bits and the calculator truncates and sign-interprets accordingly, which is what makes it usable for checking a permission mask, a flag register, or a hash mixing step rather than only for textbook examples. Arithmetic is done with BigInt, so 64-bit values stay exact instead of losing low bits the way a double would. Everything is calculated in your browser.",
  category: "developer",
  keywords: [
    "bitwise calculator",
    "bitwise and or xor online",
    "bit shift calculator",
    "binary hex bitwise operations",
    "bitmask calculator",
  ],
  tags: ["bitwise", "binary", "hex", "bitmask", "developer", "calculator"],
  icon: Calculator,
  features: [
    "AND, OR, XOR, NOT, left shift, and both right shifts",
    "Operands accepted in decimal, hexadecimal, octal, or binary",
    "Selectable 8, 16, 32, and 64-bit widths with signed and unsigned readings",
    "Bit-by-bit alignment of both operands and the result",
    "Exact 64-bit arithmetic using BigInt rather than doubles",
  ],
  faqs: [
    {
      question: "How do I enter a hexadecimal or binary operand?",
      answer:
        "Use the usual prefixes: 0x for hexadecimal, 0b for binary, and 0o for octal. A value with no prefix is read as decimal.",
    },
    {
      question: "What is the difference between the two right shifts?",
      answer:
        "The arithmetic right shift copies the sign bit into the vacated positions, so a negative number stays negative. The logical right shift fills with zeros, which is what unsigned values need. Getting these two confused is a common source of sign bugs, so both are shown.",
    },
    {
      question: "Why does the result change when I change the width?",
      answer:
        "Bitwise operations are defined over a fixed number of bits. NOT of 5 is -6 in 32 bits and 250 read as an unsigned 8-bit value, so the width has to be part of the question rather than an afterthought.",
    },
    {
      question: "Does anything leave my browser?",
      answer:
        "No. All arithmetic is done locally with JavaScript BigInt values, and no operand is transmitted anywhere.",
    },
  ],
}

export default meta
