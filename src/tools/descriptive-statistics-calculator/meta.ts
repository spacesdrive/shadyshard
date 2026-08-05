import { Sigma } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "descriptive-statistics-calculator",
  title: "Descriptive Statistics Calculator",
  description:
    "Paste a list of numbers to get mean, median, mode, standard deviation, quartiles, and outliers.",
  longDescription:
    "Paste numbers separated by commas, spaces, tabs, or line breaks and get the full descriptive summary in one pass: central tendency, spread, quartiles, and the values that fall outside the usual outlier fences. Sample and population figures are shown side by side, because picking the wrong one is the mistake that most often makes a standard deviation look wrong. Anything in the input that is not a number is listed separately rather than silently dropped, so a stray header or currency symbol cannot quietly change your results. The whole calculation runs in your browser, which is worth knowing if the numbers are survey responses or revenue figures.",
  category: "math",
  keywords: [
    "descriptive statistics calculator",
    "mean median mode calculator",
    "standard deviation calculator",
    "quartile and iqr calculator",
    "outlier detection calculator",
  ],
  tags: ["statistics", "mean", "median", "standard deviation", "outliers"],
  icon: Sigma,
  features: [
    "Mean, median, mode, range, minimum, and maximum",
    "Sample and population variance and standard deviation",
    "Quartiles, interquartile range, and outlier fences",
    "Lists the values flagged as outliers",
    "Reports any input it could not read as a number",
  ],
  faqs: [
    {
      question: "Should I use the sample or the population figures?",
      answer:
        "Use the sample figures when your numbers are a subset drawn from a larger group, which is the usual case. Use the population figures only when the list is the entire group you care about. The sample calculation divides by one less than the count, which makes it slightly larger.",
    },
    {
      question: "Which quartile method does this use?",
      answer:
        "It uses linear interpolation between the closest ranks, the same method as Excel's QUARTILE.INC and the default in most spreadsheets. Other methods exist and can produce slightly different quartiles for small lists.",
    },
    {
      question: "How are outliers decided?",
      answer:
        "A value is flagged when it falls more than 1.5 times the interquartile range below the first quartile or above the third quartile. This is the standard rule behind a box plot's whiskers. It is a starting point for investigation, not proof that a value is wrong.",
    },
    {
      question: "What happens to text mixed in with my numbers?",
      answer:
        "Anything that cannot be read as a number is listed under unreadable values and left out of the calculation. Column headers, currency symbols, and units are the usual culprits.",
    },
  ],
}

export default meta
