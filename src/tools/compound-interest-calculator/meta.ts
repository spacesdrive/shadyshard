import { TrendingUp } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "compound-interest-calculator",
  title: "Compound Interest Calculator",
  description:
    "Project savings growth from a lump sum and regular contributions, year by year.",
  longDescription:
    "Enter a starting amount, a regular contribution, an expected annual return, and a time horizon to see what the balance becomes and how much of it is interest rather than money you put in. The year-by-year table is the part most calculators leave out, and it is what shows the shape of compounding: contributions dominate the early years and returns take over later. Compounding frequency and whether you contribute at the start or the end of each period are both adjustable, since both change the result. Everything is calculated in your browser, so no figures about your finances are sent anywhere.",
  category: "math",
  keywords: [
    "compound interest calculator",
    "investment growth calculator",
    "sip return calculator",
    "savings projection with monthly contributions",
    "future value calculator",
  ],
  tags: ["compound interest", "investment", "savings", "finance", "sip", "returns"],
  icon: TrendingUp,
  features: [
    "Lump sum plus recurring monthly, quarterly, or yearly contributions",
    "Monthly, quarterly, half-yearly, or annual compounding",
    "Contributions at the start or the end of each period",
    "Year-by-year table of contributions, interest, and closing balance",
    "Rupee, dollar, euro, and pound formatting",
  ],
  faqs: [
    {
      question: "How is compound interest calculated here?",
      answer:
        "The annual rate is divided by the number of compounding periods in a year, and the balance grows by that rate each period. Contributions are added on the same schedule, either before interest is applied for the period or after, depending on the timing option.",
    },
    {
      question: "Does a higher compounding frequency really matter?",
      answer:
        "Less than people expect. At a 12 percent annual rate over 20 years, monthly rather than annual compounding adds a few percent to the final balance. Contribution amount and time horizon move the result far more than frequency does.",
    },
    {
      question: "Is this the same as a SIP calculator?",
      answer:
        "The arithmetic is the same. A systematic investment plan is a fixed contribution at a fixed interval into a fund, which is what the recurring contribution field models. Set the contribution to monthly and the expected return to the rate you are assuming.",
    },
    {
      question: "Does this account for inflation, tax, or fees?",
      answer:
        "No. It projects a nominal balance at a constant rate. Real returns vary year to year, and tax and fund charges reduce what you keep, so treat the result as an illustration of compounding rather than a forecast.",
    },
  ],
}

export default meta
