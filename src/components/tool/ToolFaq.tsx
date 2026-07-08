import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import type { ToolFaq } from "@/types/tool"

export function ToolFaqSection({ faqs }: { faqs: ToolFaq[] }) {
  if (!faqs.length) return null

  return (
    <section aria-labelledby="faq-heading" className="mt-12">
      <h2 id="faq-heading" className="text-xl font-semibold">
        Frequently asked questions
      </h2>
      <Accordion className="mt-4">
        {faqs.map((faq, index) => (
          <AccordionItem key={index} value={`faq-${index}`}>
            <AccordionTrigger>{faq.question}</AccordionTrigger>
            <AccordionContent>{faq.answer}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  )
}
