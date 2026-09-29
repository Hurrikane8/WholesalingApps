/** Validation and sentences for the net proceeds calculator (spec 5.8). Pure, so they're unit-tested. */
import { formatMoney, roundTo } from "@/lib/format";
import { CASH_MONTHS, parseAmount, type Path } from "@/lib/net-sheet";

export type FieldKey =
  | "arv"
  | "asIsPrice"
  | "repairs"
  | "monthly"
  | "legal"
  | "repairCredit"
  | "asIsCut"
  | "cashOffer"
  | "monthsRepairList"
  | "monthsAsIs"
  | "rate";

const thousands = new Intl.NumberFormat("en-CA", { maximumFractionDigits: 2 });

/** Checks one field; returns an error message, or nothing when it's fine. */
export function validate(key: FieldKey, raw: string): string | undefined {
  if (key === "cashOffer" && !raw.trim()) return undefined;
  const n = parseAmount(raw);
  if (n === undefined) return key === "rate" ? "Enter a rate, like 4" : key.startsWith("months") ? "Enter a number of months, like 4" : "Enter an amount, like 350,000";
  if (key === "rate" && n > 20) return "Enter a rate between 0 and 20";
  if (key.startsWith("months") && n > 60) return "Enter up to 60 months";
  return undefined;
}

export const months = (n: number) => (n === CASH_MONTHS ? "About two weeks" : `About ${thousands.format(n)} ${n === 1 ? "month" : "months"}`);

/** "about $37,500 more than listing as-is" */
export function compared(cash: number, other: number, label: string): string {
  const diff = roundTo(cash - other, 100);
  if (Math.abs(diff) < 500) return `about the same as ${label}`;
  return `about ${formatMoney(Math.abs(diff))} ${diff > 0 ? "more" : "less"} than ${label}`;
}

/** The sentence under the bars: the break-even with no offer, or how the offer compares. */
export function summaryText(repairList: Path, asIs: Path, cash: Path | undefined, breakEven: number): string {
  const nets = `Repairing and listing nets about ${formatMoney(repairList.net)}; listing as-is, about ${formatMoney(asIs.net)}.`;
  if (!cash) return `${nets} In this scenario, a cash offer above ${formatMoney(breakEven)} would beat listing as-is.`;
  return `Your cash offer nets about ${formatMoney(cash.net)}: ${compared(cash.net, asIs.net, "listing as-is")}, and ${compared(cash.net, repairList.net, "repairing and listing")}.`;
}

