import { Scale } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "unit-converter",
  title: "Unit Converter",
  description:
    "Convert length, weight, temperature, area, volume, speed, pressure, and energy units.",
  longDescription:
    "Pick what you are measuring, enter an amount, and see it converted into the unit you need plus every other unit in the same category at once. Conversion factors are the exact internationally defined values, so an inch is 0.0254 metres and a pound is 0.45359237 kilograms rather than a rounded approximation, and US and imperial units that share a name but not a size, such as the pint and the gallon, are listed separately. Temperature is handled as the affine conversion it actually is rather than a simple multiplication. Everything is calculated in your browser, with no tracking on what you convert.",
  category: "converters",
  keywords: [
    "unit converter",
    "metric to imperial converter",
    "length weight temperature converter",
    "convert units online",
    "measurement converter",
  ],
  tags: ["units", "convert", "metric", "imperial", "length", "weight", "temperature"],
  icon: Scale,
  features: [
    "Eight categories covering length, mass, temperature, area, volume, speed, pressure, and energy",
    "Shows the result in every unit of the category, not just the one selected",
    "Exact internationally defined conversion factors",
    "Separate US and imperial units where the two differ",
    "Copy the converted value with one click",
  ],
  faqs: [
    {
      question: "Why are US and imperial pints listed separately?",
      answer:
        "Because they are different volumes. A US liquid pint is about 473 millilitres and an imperial pint is about 568 millilitres, a difference of roughly twenty percent. The same applies to gallons, quarts, and fluid ounces. Recipes and fuel figures frequently get this wrong, so both are listed with the system named.",
    },
    {
      question: "Why is temperature handled differently from the other categories?",
      answer:
        "Every other category converts by multiplying against a base unit, because zero means the same thing in all of them. Temperature scales have different zero points, so Celsius to Fahrenheit needs both a multiplication and an offset. That is also why a negative value is allowed for temperature and rejected elsewhere.",
    },
    {
      question: "How accurate are the conversions?",
      answer:
        "The factors are the exact internationally agreed definitions rather than rounded values, so results are accurate to the limits of double precision floating point arithmetic. Very large and very small results switch to scientific notation rather than being truncated, so no significant digits are lost silently.",
    },
    {
      question: "Does the page track what I convert?",
      answer:
        "No. The conversion is arithmetic in your browser, with no request sent for each calculation and no record kept of the values you enter. Unit converters are a common place for ad and analytics scripts to sit, which is a reason to prefer one that does the arithmetic locally.",
    },
  ],
}

export default meta
