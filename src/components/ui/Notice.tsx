import { CircleCheck } from "lucide-react";
import type { ReactNode } from "react";

/**
 * A status message: success (with the one check glyph the brief allows) or
 * error. Announced to screen readers when it appears.
 */
export function Notice({ tone, title, children, className = "" }: { tone: "success" | "error"; title?: ReactNode; children?: ReactNode; className?: string }) {
  const success = tone === "success";
  return (
    <div
      role={success ? "status" : "alert"}
      className={`rounded-ledger border-l-4 px-4 py-3 ${success ? "border-pine bg-frost text-ink" : "border-error bg-white text-ink"} ${className}`}
    >
      <p className="type-small flex items-start gap-2 font-semibold">
        {success && <CircleCheck className="mt-0.5 size-5 shrink-0 text-pine" aria-hidden="true" />}
        <span className={success ? "" : "text-error"}>{title}</span>
      </p>
      {children && <div className="type-small mt-1 text-ink-2">{children}</div>}
    </div>
  );
}
