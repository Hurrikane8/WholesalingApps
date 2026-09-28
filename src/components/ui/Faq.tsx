import { ChevronDown } from "lucide-react";
import type { Faq as FaqItem } from "@/content/faqs";
import { faqSchema } from "@/lib/schema";
import { JsonLd } from "@/components/JsonLd";
import { Unconfirmed } from "@/components/preview";

/**
 * Questions and answers as details/summary (no JavaScript), with a chevron
 * that turns on open. FAQPage structured data only where `withSchema` is set
 * (the /faq page, spec 7.3).
 */
export function Faq({ items, withSchema = false, headingLevel = 3, className = "" }: { items: FaqItem[]; withSchema?: boolean; headingLevel?: 2 | 3; className?: string }) {
  const Heading = `h${headingLevel}` as "h2" | "h3";
  return (
    <div className={`divide-y divide-mist border-y border-mist ${className}`}>
      {withSchema && <JsonLd data={faqSchema(items)} />}
      {items.map((item) => (
        <details key={item.question} className="group">
          <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 py-4 [&::-webkit-details-marker]:hidden">
            <Heading className="font-display text-[1.1875rem] leading-snug font-bold text-ink">{item.question}</Heading>
            <ChevronDown className="size-5 shrink-0 text-ink-2 transition-transform duration-150 group-open:rotate-180" aria-hidden="true" />
          </summary>
          <p className="measure pb-5 text-ink-2">
            {item.answer}
            <Unconfirmed show={item.unconfirmed ?? false} />
          </p>
        </details>
      ))}
    </div>
  );
}
