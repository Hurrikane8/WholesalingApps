"use client";

import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from "react";
import { trackEvent } from "@/lib/analytics";
import { EXAMPLE, netSheet, parseAmount, type NetSheetInput, type Path } from "@/lib/net-sheet";
import { months, summaryText, validate, type FieldKey } from "@/components/calculator/copy";
import { Button } from "@/components/ui/Button";
import { FieldError, FieldHint, FieldLabel, describedBy } from "@/components/ui/Field";
import { Ledger } from "@/components/ui/Ledger";
import { NetBars } from "@/components/ui/NetBars";

/**
 * The net proceeds calculator (spec 5.8): repair then list, list as-is, or a
 * cash sale, with the seller's own numbers. The math lives in
 * src/lib/net-sheet.ts (unit-tested); this is only the form around it.
 *
 * `legalCovered` comes from the server: legal fees drop out of the cash path
 * only once Kane has confirmed he pays them.
 */

type MoneyKey = "arv" | "asIsPrice" | "repairs" | "monthly" | "legal" | "repairCredit" | "asIsCut" | "cashOffer";
type MonthKey = "monthsRepairList" | "monthsAsIs";
type Key = FieldKey;
type Values = Record<Key, string>;

const thousands = new Intl.NumberFormat("en-CA", { maximumFractionDigits: 2 });

const DEFAULTS: Values = {
  arv: thousands.format(EXAMPLE.arv),
  asIsPrice: thousands.format(EXAMPLE.asIsPrice),
  repairs: thousands.format(EXAMPLE.repairs),
  monthly: thousands.format(EXAMPLE.monthly),
  monthsRepairList: String(EXAMPLE.monthsRepairList),
  monthsAsIs: String(EXAMPLE.monthsAsIs),
  legal: thousands.format(EXAMPLE.legal),
  repairCredit: thousands.format(EXAMPLE.repairCredit),
  asIsCut: thousands.format(EXAMPLE.asIsCut),
  cashOffer: "",
  rate: "4",
};

const MONEY: { key: MoneyKey; label: string; hint?: string; optional?: boolean }[][] = [
  [
    { key: "arv", label: "Likely sale price after repairs" },
    { key: "asIsPrice", label: "Likely sale price as-is, listed" },
    { key: "repairs", label: "Repairs to get the top price" },
  ],
  [{ key: "monthly", label: "Monthly carrying costs", hint: "Mortgage interest, property taxes, condo fees, insurance and utilities." }],
  [
    { key: "legal", label: "Legal fees and mortgage discharge" },
    { key: "repairCredit", label: "Credit to the buyer after inspection (repaired home)" },
    { key: "asIsCut", label: "Price cut after inspection (as-is)" },
  ],
];

const MONTHS: { key: MonthKey; label: string }[] = [
  { key: "monthsRepairList", label: "Months to repair and sell" },
  { key: "monthsAsIs", label: "Months to sell as-is" },
];

export function NetProceedsCalculator({ legalCovered }: { legalCovered: boolean }) {
  const uid = useId();
  const [values, setValues] = useState<Values>(DEFAULTS);
  const [kind, setKind] = useState<"structure" | "flat">("structure");
  const [gst, setGst] = useState(true);
  const [touched, setTouched] = useState<Partial<Record<Key, boolean>>>({});
  const [announcement, setAnnouncement] = useState("");
  const interacted = useRef(false);
  const offerTracked = useRef(false);

  const errors = useMemo(() => {
    const out: Partial<Record<Key, string>> = {};
    for (const key of Object.keys(values) as Key[]) {
      if (key === "rate" && kind !== "flat") continue;
      const error = validate(key, values[key]);
      if (error) out[key] = error;
    }
    return out;
  }, [values, kind]);

  const input: NetSheetInput | undefined = useMemo(() => {
    if (Object.keys(errors).length) return undefined;
    const n = (key: Key) => parseAmount(values[key]) ?? 0;
    return {
      arv: n("arv"),
      asIsPrice: n("asIsPrice"),
      repairs: n("repairs"),
      monthly: n("monthly"),
      monthsRepairList: n("monthsRepairList"),
      monthsAsIs: n("monthsAsIs"),
      commission: kind === "structure" ? { kind: "structure" } : { kind: "flat", rate: n("rate"), gst },
      legal: n("legal"),
      repairCredit: n("repairCredit"),
      asIsCut: n("asIsCut"),
      cashOffer: parseAmount(values.cashOffer),
    };
  }, [errors, values, kind, gst]);

  const sheet = input ? netSheet(input, legalCovered) : undefined;
  const summary = sheet ? summaryText(sheet.repairList, sheet.asIs, sheet.cash, sheet.breakEven) : "";

  // Announce the result once typing pauses (not on every keystroke), and never before the visitor has changed anything.
  const flagged = (Object.keys(errors) as Key[]).some((key) => touched[key]);
  const status = sheet ? summary : flagged ? "Fix the highlighted amount to see your numbers." : "Fill in every amount to see your numbers.";
  useEffect(() => {
    if (!interacted.current) return;
    const timer = setTimeout(() => setAnnouncement(status), 900);
    return () => clearTimeout(timer);
  }, [status]);

  const noteChange = () => {
    if (!interacted.current) {
      interacted.current = true;
      trackEvent("calculator_interact", { page_type: "comparison" });
    }
  };

  const set = (key: Key, value: string) => {
    setValues((v) => ({ ...v, [key]: value }));
    noteChange();
  };

  const onBlur = (key: Key) => {
    setTouched((t) => ({ ...t, [key]: true }));
    const n = parseAmount(values[key]);
    if (n !== undefined && key !== "rate" && !key.startsWith("months")) setValues((v) => ({ ...v, [key]: thousands.format(n) }));
    if (key === "cashOffer" && n && n > 0 && !offerTracked.current) {
      offerTracked.current = true;
      trackEvent("calculator_offer_entered", { page_type: "comparison" });
    }
  };

  const reset = () => {
    setValues(DEFAULTS);
    setKind("structure");
    setGst(true);
    setTouched({});
    noteChange();
  };

  const errorFor = (key: Key) => (touched[key] ? errors[key] : undefined);

  const money = (f: { key: MoneyKey; label: string; hint?: string; optional?: boolean }) => (
    <MoneyInput
      key={f.key}
      id={`${uid}-${f.key}`}
      label={f.label}
      hint={f.hint}
      optional={f.optional}
      value={values[f.key]}
      error={errorFor(f.key)}
      onChange={(v) => set(f.key, v)}
      onBlur={() => onBlur(f.key)}
    />
  );

  return (
    <div className="grid gap-y-10 lg:grid-cols-12 lg:gap-x-12">
      <form className="space-y-8 lg:col-span-7" onSubmit={(e) => e.preventDefault()} noValidate aria-label="Net proceeds calculator">
        <fieldset className="space-y-5">
          <legend className="type-h3 mb-4">Your home</legend>
          {MONEY[0].map(money)}
        </fieldset>

        <fieldset className="space-y-5">
          <legend className="type-h3 mb-4">Time and carrying costs</legend>
          {MONEY[1].map(money)}
          <div className="grid gap-5 sm:grid-cols-2">
            {MONTHS.map((f) => (
              <NumberInput
                key={f.key}
                id={`${uid}-${f.key}`}
                label={f.label}
                value={values[f.key]}
                error={errorFor(f.key)}
                onChange={(v) => set(f.key, v)}
                onBlur={() => onBlur(f.key)}
              />
            ))}
          </div>
        </fieldset>

        <fieldset className="space-y-5">
          <legend className="type-h3 mb-4">Selling costs</legend>
          <fieldset>
            <legend className="type-small mb-2 font-semibold text-ink">Commission</legend>
            <div className="space-y-1">
              <Radio
                id={`${uid}-structure`}
                name={`${uid}-commission`}
                checked={kind === "structure"}
                onChange={() => {
                  setKind("structure");
                  noteChange();
                }}
              >
                Common Alberta structure: 7% on the first $100,000 and 3% on the rest, plus GST
              </Radio>
              <Radio
                id={`${uid}-flat`}
                name={`${uid}-commission`}
                checked={kind === "flat"}
                onChange={() => {
                  setKind("flat");
                  noteChange();
                }}
              >
                A flat rate
              </Radio>
            </div>
            {kind === "flat" && (
              <div className="mt-3 grid gap-4 border-l-4 border-mist pl-4 sm:grid-cols-[12rem_minmax(0,1fr)] sm:items-end">
                <NumberInput
                  id={`${uid}-rate`}
                  label="Commission rate"
                  suffix="%"
                  value={values.rate}
                  error={errorFor("rate")}
                  onChange={(v) => set("rate", v)}
                  onBlur={() => onBlur("rate")}
                  decimal
                />
                <label htmlFor={`${uid}-gst`} className="type-small flex min-h-13 cursor-pointer items-center gap-3 text-ink">
                  <input
                    id={`${uid}-gst`}
                    type="checkbox"
                    checked={gst}
                    onChange={(e) => {
                      setGst(e.target.checked);
                      noteChange();
                    }}
                    className="size-6 shrink-0 cursor-pointer accent-pine"
                  />
                  Add GST (5%) on the commission
                </label>
              </div>
            )}
          </fieldset>
          {MONEY[2].map(money)}
        </fieldset>

        <fieldset className="space-y-5">
          <legend className="type-h3 mb-4">A cash offer</legend>
          {money({ key: "cashOffer", label: "A cash offer you have", optional: true, hint: "Leave it blank to see what an offer would need to beat." })}
        </fieldset>

        <div className="flex flex-wrap items-center gap-4">
          <Button variant="secondary" onClick={reset}>
            Reset to the example
          </Button>
        </div>
      </form>

      <div className="lg:col-span-5 lg:sticky lg:top-24 lg:self-start">
        <section aria-labelledby={`${uid}-results`} className="rounded-ledger border border-t-[3px] border-mist border-t-ink bg-white px-5 py-5 sm:px-6">
          <h3 id={`${uid}-results`} className="type-h3">
            What you&apos;d walk away with
          </h3>
          {sheet ? (
            <>
              <NetBars
                className="mt-5"
                bars={[
                  { label: "Repair, then list", amount: sheet.repairList.net, note: months(sheet.repairList.months) },
                  { label: "List as-is", amount: sheet.asIs.net, note: months(sheet.asIs.months) },
                  ...(sheet.cash ? [{ label: "Your cash offer", amount: sheet.cash.net, note: months(sheet.cash.months) }] : []),
                ]}
              />
              <p className="mt-6 text-ink">{summary}</p>
            </>
          ) : (
            <p className="mt-4 text-ink-2">{status}</p>
          )}
          <p className="type-fine mt-5 border-t border-mist pt-4 text-ink-3">
            Nets are before your mortgage payout. An estimate for comparing options, not financial or legal advice.
          </p>
        </section>
        {/* One polite announcement after each pause in typing. */}
        <p className="sr-only" aria-live="polite">
          {announcement}
        </p>
      </div>

      {sheet && (
        <details className="group lg:col-span-12">
          <summary className="type-small inline-flex min-h-11 cursor-pointer items-center font-semibold text-ink underline underline-offset-3 hover:text-pine">
            <span className="group-open:hidden">Show each line</span>
            <span className="hidden group-open:inline">Hide each line</span>
          </summary>
          <div className="mt-4 grid gap-6 lg:grid-cols-3 lg:items-start">
            <PathLedger title="Repair, then list" path={sheet.repairList} />
            <PathLedger title="List as-is" path={sheet.asIs} />
            {sheet.cash && <PathLedger title="Your cash offer" path={sheet.cash} />}
          </div>
        </details>
      )}
    </div>
  );
}

function PathLedger({ title, path }: { title: string; path: Path }) {
  const [price, ...costs] = path.rows;
  return (
    <Ledger
      title={title}
      headingLevel={4}
      rows={[price, ...costs.filter((r) => r.amount !== 0)].map((r) => ({ label: r.label, amount: r.amount }))}
      total={{ label: "Net", amount: path.net, note: `${months(path.months)}. Before your mortgage payout.` }}
    />
  );
}

type InputProps = {
  id: string;
  label: string;
  hint?: string;
  optional?: boolean;
  value: string;
  error?: string;
  onChange: (value: string) => void;
  onBlur: () => void;
};

/** A dollar amount: numeric keyboard, "$" in front, thousands separators on blur. */
function MoneyInput({ id, label, hint, optional, value, error, onChange, onBlur }: InputProps) {
  return (
    <div>
      <FieldLabel htmlFor={id} optional={optional}>
        {label}
      </FieldLabel>
      <FieldHint id={id}>{hint}</FieldHint>
      <div className="relative">
        <span aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-ink-2">
          $
        </span>
        <input
          id={id}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(id, { hint, error })}
          className="field-control nums pl-8"
        />
      </div>
      <FieldError id={id}>{error}</FieldError>
    </div>
  );
}

/** Months or a rate: a plain number, with an optional unit after it. */
function NumberInput({ id, label, value, error, onChange, onBlur, suffix, decimal = false }: InputProps & { suffix?: string; decimal?: boolean }) {
  return (
    <div>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <div className="relative">
        <input
          id={id}
          type="text"
          inputMode={decimal ? "decimal" : "numeric"}
          autoComplete="off"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(id, { error })}
          className={`field-control nums ${suffix ? "pr-10" : ""}`}
        />
        {suffix && (
          <span aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-ink-2">
            {suffix}
          </span>
        )}
      </div>
      <FieldError id={id}>{error}</FieldError>
    </div>
  );
}

function Radio({ id, name, checked, onChange, children }: { id: string; name: string; checked: boolean; onChange: () => void; children: ReactNode }) {
  return (
    <label htmlFor={id} className="type-small flex min-h-11 cursor-pointer items-start gap-3 py-2 text-ink">
      <input id={id} type="radio" name={name} checked={checked} onChange={onChange} className="mt-0.5 size-6 shrink-0 cursor-pointer accent-pine" />
      <span>{children}</span>
    </label>
  );
}
