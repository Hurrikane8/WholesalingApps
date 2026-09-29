import { site } from "@/config/site";
import { Mark } from "./Mark";

/**
 * Lockups (spec 3.5). Full: the mark, the name in Overpass 800 and
 * "Edmonton, Alberta" underneath. Below 360px wide the place line drops
 * (the compact lockup). The place line is 14px, the smallest text the site
 * allows, rather than the 13px in the brief.
 */
export function Logo({ tone = "ink", compact = false, className = "" }: { tone?: "ink" | "snow"; compact?: boolean; className?: string }) {
  const night = tone === "snow";
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <Mark tone={tone} className="size-10 shrink-0" />
      <span className="flex flex-col">
        <span className={`font-display text-[1.0625rem] leading-tight font-extrabold tracking-[-0.005em] sm:text-[1.1875rem] ${night ? "text-snow" : "text-ink"}`}>
          {site.name}
        </span>
        {!compact && (
          <span className={`type-fine leading-tight max-[359px]:hidden ${night ? "text-night-ink-2" : "text-ink-2"}`}>
            {site.market.name}, {site.market.province}
          </span>
        )}
      </span>
    </span>
  );
}
