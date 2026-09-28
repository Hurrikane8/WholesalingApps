import { useId } from "react";
import { BRAND } from "./colors";
import { MarkShapes } from "./mark-shapes";

/** The brand mark, inline. Decorative: put the business name in text beside it. */
export function Mark({ className, tone = "ink" }: { className?: string; tone?: "ink" | "snow" }) {
  const gradientId = `mark-ribbon-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" focusable="false" className={className}>
      <MarkShapes gradientId={gradientId} ink={tone === "snow" ? BRAND.snow : BRAND.ink} />
    </svg>
  );
}
