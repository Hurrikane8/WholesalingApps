import type { ReactNode } from "react";

export type Step = { title: ReactNode; text: ReactNode };

/**
 * A numbered sequence (spec 3.7). Phones: vertical, a 2px mist line joining
 * large Overpass numerals. Desktop: horizontal, the line running through the
 * numbers. `surface` matches the section background so the line reads as
 * passing behind each numeral.
 */
export function Steps({
  steps,
  surface = "snow",
  headingLevel = 3,
  className = "",
}: {
  steps: Step[];
  surface?: "snow" | "frost";
  headingLevel?: 3 | 4;
  className?: string;
}) {
  const Heading = `h${headingLevel}` as "h3" | "h4";
  const bg = surface === "frost" ? "bg-frost" : "bg-snow";
  const cols = { 2: "lg:grid-cols-2", 3: "lg:grid-cols-3", 4: "lg:grid-cols-4", 5: "lg:grid-cols-5" }[steps.length] ?? "lg:grid-cols-4";
  return (
    <ol className={`grid gap-y-8 lg:gap-x-8 ${cols} ${className}`}>
      {steps.map((step, i) => (
        <li
          key={i}
          className="relative grid grid-cols-[3rem_minmax(0,1fr)] gap-x-4 before:absolute before:top-12 before:bottom-[-2rem] before:left-[calc(1.5rem-1px)] before:w-0.5 before:bg-mist last:before:hidden lg:grid-cols-1 lg:before:top-[calc(1.5rem-1px)] lg:before:right-[-2rem] lg:before:bottom-auto lg:before:left-12 lg:before:h-0.5 lg:before:w-auto"
        >
          <span
            aria-hidden="true"
            className={`nums relative z-10 flex size-12 items-center justify-center font-display text-[2.5rem] leading-none font-extrabold text-ink ${bg}`}
          >
            {i + 1}
          </span>
          <div className="lg:mt-4">
            <Heading className="type-h3 text-ink">
              <span className="sr-only">Step {i + 1}: </span>
              {step.title}
            </Heading>
            <div className="mt-2 text-ink-2">{step.text}</div>
          </div>
        </li>
      ))}
    </ol>
  );
}
