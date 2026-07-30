import { Landmark } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "loan-emi-calculator",
  title: "Loan EMI Calculator",
  description:
    "Calculate a loan's monthly instalment, total interest, and full amortisation schedule from the amount, rate, and term.",
  longDescription:
    "Enter the loan amount, the annual interest rate, and the term to get the equated monthly instalment along with the total interest paid over the life of the loan. The year by year amortisation table shows how the split between interest and principal shifts, which is the part a headline EMI figure hides, and the complete monthly schedule can be downloaded as CSV. The calculation runs in your browser, so no lender or broker sees the figures you are modelling.",
  category: "math",
  keywords: [
    "emi calculator",
    "loan repayment calculator",
    "monthly instalment calculator",
    "amortisation schedule",
    "home loan interest calculator",
  ],
  tags: ["loan", "emi", "finance", "calculator", "interest", "amortisation"],
  icon: Landmark,
  features: [
    "Monthly instalment, total interest, and total repayment",
    "Term entered in years or months",
    "Year by year amortisation table with the interest and principal split",
    "Full monthly schedule downloadable as CSV",
    "Currency formatting for several common currencies",
  ],
  faqs: [
    {
      question: "How is the monthly instalment calculated?",
      answer:
        "With the standard reducing balance formula: the instalment is the amount that repays the principal and all interest in equal payments over the term. Interest each month is charged on the remaining balance, so the interest share falls as the loan runs down.",
    },
    {
      question: "Why is so much of an early payment interest?",
      answer:
        "Because interest is charged on the outstanding balance, which is at its highest at the start. In the first years of a long loan most of each payment covers interest, which is why an overpayment early on saves far more than the same overpayment later.",
    },
    {
      question: "Will this match my lender's figure exactly?",
      answer:
        "It will be very close, but lenders add fees, insurance, and rounding conventions, and some charge interest daily rather than monthly. Treat the result as an accurate model of the loan rather than a quotation.",
    },
    {
      question: "Are my figures sent anywhere?",
      answer:
        "No. The calculation and the schedule are produced in your browser, and nothing is uploaded or stored.",
    },
  ],
  relatedTools: ["percentage-calculator", "gst-calculator", "date-difference-calculator"],
}

export default meta
