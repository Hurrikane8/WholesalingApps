import type { ReactNode } from "react";
import { formatMoney } from "@/lib/format";

/** A money amount, or a symbol ("−", "=") when the ledger shows a formula rather than figures. */
export type LedgerRow = { label: ReactNode; amount: number | string; note?: ReactNode };

/**
 * A written offer or net sheet, set as a document (spec 3.7): white, 6px
 * corners, a 1px mist border and a 3px ink rule across the top. Labels and
 * amounts are joined by dotted leaders; amounts are right-aligned tabular
 * figures, and negatives get a true minus sign, never red.
 */
export function Ledger({
  title,
  rows,
  total,
  sample = false,
  caption,
  headingLevel = 3,
  notesFromSm = false,
  className = "",
}: {
  title: ReactNode;
  rows: LedgerRow[];
  total: LedgerRow;
  /** Illustrative figures: shows a "Sample" tag in the header. */
  sample?: boolean;
  caption?: ReactNode;
  headingLevel?: 2 | 3 | 4;
  /** Hide the row notes below 640px (the total's note stays). */
  notesFromSm?: boolean;
  className?: string;
}) {
  const Heading = `h${headingLevel}` as "h2" | "h3" | "h4";
  return (
    <figure className={`rounded-ledger border border-t-[3px] border-mist border-t-ink bg-white ${className}`}>
      <div className="flex items-start justify-between gap-4 px-5 pt-4 pb-3 sm:px-6">
        <Heading className="font-display text-[1.125rem] leading-snug font-bold text-ink">{title}</Heading>
        {sample && (
          <span className="type-fine shrink-0 rounded-[4px] border border-line px-2 py-0.5 font-semibold text-ink-2">Sample</span>
        )}
      </div>
      <dl className="px-5 pb-5 sm:px-6">
        {rows.map((row, i) => (
          <LedgerLine key={i} row={row} hideNoteOnPhones={notesFromSm} />
        ))}
        <LedgerLine row={total} total />
      </dl>
      {caption && <figcaption className="type-fine border-t border-mist px-5 py-3 text-ink-3 sm:px-6">{caption}</figcaption>}
    </figure>
  );
}

/** One dt/dd group, laid out as a grid so the dl stays valid: label and leader, amount, then an optional note. */
function LedgerLine({ row, total = false, hideNoteOnPhones = false }: { row: LedgerRow; total?: boolean; hideNoteOnPhones?: boolean }) {
  return (
    <div className={`grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-2 ${total ? "mt-3 border-t-2 border-ink pt-3" : "py-1.5"}`}>
      <dt className={`flex min-w-0 items-baseline gap-2 ${total ? "font-display text-[1.375rem] font-extrabold" : ""} text-ink`}>
        <span>{row.label}</span>
        <span aria-hidden="true" className="min-w-6 flex-1 -translate-y-[0.3em] border-b-2 border-dotted border-mist" />
      </dt>
      <dd className={`nums text-right font-display ${total ? "text-[1.375rem] font-extrabold" : "text-[1.125rem] font-semibold"} text-ink`}>
        {typeof row.amount === "number" ? formatMoney(row.amount) : row.amount}
      </dd>
      {row.note && <dd className={`type-fine col-span-2 mt-0.5 max-w-[34rem] text-ink-2 ${hideNoteOnPhones ? "max-sm:hidden" : ""}`}>{row.note}</dd>}
    </div>
  );
}
