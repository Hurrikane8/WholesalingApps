import type { ReactNode } from "react";

/**
 * A straight answer at the top of situation, property-type and guide pages
 * (spec 3.7, 6.4): frost, a 4px pine rule on the left, the question as an H2
 * and a 40–60 word answer.
 */
export function StraightAnswer({ question, children, className = "" }: { question: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={`border-l-4 border-pine bg-frost px-5 py-5 sm:px-7 sm:py-6 ${className}`}>
      <h2 className="type-h3 text-ink">{question}</h2>
      <div className="measure mt-2 text-ink">{children}</div>
    </section>
  );
}
