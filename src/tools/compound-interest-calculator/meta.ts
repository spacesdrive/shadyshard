import { TrendingUp } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "compound-interest-calculator",
  title: "Compound Interest Calculator",
  description:
    "Project how a lump sum or a regular monthly contribution grows, with a year-by-year breakdown.",
  longDescription:
    "Work out what an investment or savings balance becomes over time, either from a single starting amount or from a contribution paid in every month, quarter, or year. The regular contribution mode is the calculation behind a systematic investment plan or a monthly savings plan, treating each payment as made at the end of its period, which is the ordinary annuity convention. The result separates what you actually put in from what the growth added, and the year-by-year table shows when compounding starts to outweigh the contributions. No amounts you enter are transmitted or stored, which is worth having when the numbers are your own finances.",
  category: "math",
  keywords: [
    "compound interest calculator",
    "sip calculator",
    "investment growth calculator",
    "monthly savings calculator",
    "future value calculator",
  ],
  tags: ["compound", "interest", "investment", "sip", "savings", "finance", "growth"],
  icon: TrendingUp,
  features: [
    "One-off lump sum or regular contribution modes",
    "Yearly, half-yearly, quarterly, monthly, or daily compounding",
    "Separates total invested from total growth",
    "Year-by-year table of balance and gain",
    "Copy the summary, with a choice of currency symbol",
  ],
  faqs: [
    {
      question: "How is this different from a loan EMI calculator?",
      answer:
        "An EMI calculator works out what you pay on money you borrowed, splitting each instalment into interest and principal until the debt reaches zero. This works in the opposite direction, projecting what a balance grows to when returns are reinvested. Use the EMI calculator for a loan and this one for savings or an investment.",
    },
    {
      question: "Is this the same as a SIP calculator?",
      answer:
        "Yes, the regular contribution mode is the same calculation. A systematic investment plan is a fixed amount invested at a fixed interval, which is an ordinary annuity with compounding, and that is what this computes. Set the contribution frequency to monthly and enter the expected annual return to get the standard projection.",
    },
    {
      question: "Why does more frequent compounding produce a larger result?",
      answer:
        "Because interest starts earning interest sooner. At the same nominal annual rate, monthly compounding credits a twelfth of the rate twelve times a year, and each credit joins the balance the next month earns on. The difference is modest at low rates and over short periods, and grows with both.",
    },
    {
      question: "Does the projection account for inflation, tax, or fees?",
      answer:
        "No. It shows nominal growth at the rate you enter. Real purchasing power will be lower after inflation, and the actual outcome will be lower after tax and any fund charges. A practical approach is to enter a return you have already reduced for fees, then treat the result as being in today's money only if you also subtracted expected inflation from the rate.",
    },
  ],
}

export default meta
