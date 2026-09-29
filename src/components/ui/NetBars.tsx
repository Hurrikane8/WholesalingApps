import type { ReactNode } from "react";
import { formatMoney } from "@/lib/format";

export type NetBar = { label: ReactNode; amount: number; note?: ReactNode };

/**
 * Net proceeds side by side (spec 3.7): plain CSS widths, with the label and
 * amount in text so colour never carries the meaning.
 */
export function NetBars({
  bars,
  tone = "light",
  notesFromSm = false,
  className = "",
}: {
  bars: NetBar[];
  tone?: "light" | "night";
  /** Show the notes from 640px up only. */
  notesFromSm?: boolean;
  className?: string;
}) {
  const max = Math.max(...bars.map((b) => b.amount), 1);
  const night = tone === "night";
  return (
    <ul className={`space-y-5 ${className}`}>
      {bars.map((bar, i) => (
        <li key={i}>
          <div className="flex items-baseline justify-between gap-4">
            <span className={night ? "text-snow" : "text-ink"}>{bar.label}</span>
            <span className={`nums font-display text-[1.125rem] font-bold ${night ? "text-snow" : "text-ink"}`}>{formatMoney(bar.amount)}</span>
          </div>
          <div className={`mt-2 h-3 rounded-full ${night ? "bg-white/15" : "bg-frost"}`}>
            <div className={`h-3 rounded-full ${night ? "bg-snow" : "bg-ink"}`} style={{ width: `${Math.max(0, (bar.amount / max) * 100).toFixed(1)}%` }} />
          </div>
          {bar.note && <p className={`type-fine mt-1.5 ${night ? "text-night-ink-2" : "text-ink-2"} ${notesFromSm ? "max-sm:hidden" : ""}`}>{bar.note}</p>}
        </li>
      ))}
    </ul>
  );
}
