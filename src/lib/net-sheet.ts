/**
 * Net proceeds for three ways to sell (spec 5.8): repair then list, list
 * as-is, or sell to a cash buyer. Pure functions, shared by the calculator,
 * the comparison page and the home page's night section, and unit-tested.
 * Illustrative only: an estimate for comparing options, not advice.
 */

export type CommissionInput =
  /** A common Alberta structure: 7% on the first $100,000 and 3% on the balance, plus GST. */
  | { kind: "structure" }
  /** A flat rate (e.g. 4), with or without GST. */
  | { kind: "flat"; rate: number; gst: boolean };

export type NetSheetInput = {
  /** Likely sale price after repairs. */
  arv: number;
  /** Likely sale price as-is, listed. */
  asIsPrice: number;
  /** Repairs to get the top price. */
  repairs: number;
  /** Monthly carrying costs: mortgage interest, property taxes, condo fees, insurance and utilities. */
  monthly: number;
  monthsRepairList: number;
  monthsAsIs: number;
  commission: CommissionInput;
  /** Legal fees and mortgage discharge. */
  legal: number;
  /** Credit to the buyer after inspection (repaired home). */
  repairCredit: number;
  /** Price cut after inspection (as-is). */
  asIsCut: number;
  /** A cash offer the seller has, if any. */
  cashOffer?: number;
};

/** The existing worked example: the calculator's defaults. */
export const EXAMPLE: NetSheetInput & { cashOffer: number } = {
  arv: 400_000,
  asIsPrice: 335_000,
  repairs: 45_000,
  monthly: 2_200,
  monthsRepairList: 5,
  monthsAsIs: 4,
  commission: { kind: "structure" },
  legal: 1_500,
  repairCredit: 4_000,
  asIsCut: 10_000,
  cashOffer: 265_000,
};

/** A cash sale closes in about two weeks. */
export const CASH_MONTHS = 0.5;
export const GST = 0.05;

export function commission(price: number, input: CommissionInput): number {
  if (price <= 0) return 0;
  if (input.kind === "structure") {
    const base = 0.07 * Math.min(price, 100_000) + 0.03 * Math.max(price - 100_000, 0);
    return Math.round(base * (1 + GST));
  }
  const base = price * (Math.max(0, input.rate) / 100);
  return Math.round(base * (input.gst ? 1 + GST : 1));
}

export type PathRow = { label: string; amount: number };
export type Path = { rows: PathRow[]; net: number; months: number };

const sum = (rows: PathRow[]) => rows.reduce((total, r) => total + r.amount, 0);

export function repairAndList(i: NetSheetInput): Path {
  const rows: PathRow[] = [
    { label: "Sale price after repairs", amount: i.arv },
    { label: "Repairs and updates", amount: -i.repairs },
    { label: "Commission and GST", amount: -commission(i.arv, i.commission) },
    { label: "Legal fees and mortgage discharge", amount: -i.legal },
    { label: `Carrying costs, ${i.monthsRepairList} months`, amount: -Math.round(i.monthly * i.monthsRepairList) },
    { label: "Credit to the buyer after inspection", amount: -i.repairCredit },
  ];
  return { rows, net: sum(rows), months: i.monthsRepairList };
}

export function listAsIs(i: NetSheetInput): Path {
  const rows: PathRow[] = [
    { label: "Sale price as-is", amount: i.asIsPrice },
    { label: "Commission and GST", amount: -commission(i.asIsPrice, i.commission) },
    { label: "Legal fees and mortgage discharge", amount: -i.legal },
    { label: `Carrying costs, ${i.monthsAsIs} months`, amount: -Math.round(i.monthly * i.monthsAsIs) },
    { label: "Price cut after inspection", amount: -i.asIsCut },
  ];
  return { rows, net: sum(rows), months: i.monthsAsIs };
}

/** The cash path. Legal fees drop out only when Kane has confirmed he pays them. */
export function cashSale(i: NetSheetInput, offer: number, legalCovered: boolean): Path {
  const rows: PathRow[] = [
    { label: "Cash offer", amount: offer },
    { label: "Legal fees and mortgage discharge", amount: legalCovered ? 0 : -i.legal },
    { label: "Carrying costs, about two weeks", amount: -Math.round(i.monthly * CASH_MONTHS) },
  ];
  return { rows, net: sum(rows), months: CASH_MONTHS };
}

/** The cash offer above which a cash sale nets more than listing as-is. */
export function breakEven(i: NetSheetInput, legalCovered: boolean): number {
  return listAsIs(i).net + (legalCovered ? 0 : i.legal) + Math.round(i.monthly * CASH_MONTHS);
}

export type NetSheet = { repairList: Path; asIs: Path; cash?: Path; breakEven: number };

export function netSheet(i: NetSheetInput, legalCovered: boolean): NetSheet {
  return {
    repairList: repairAndList(i),
    asIs: listAsIs(i),
    cash: i.cashOffer && i.cashOffer > 0 ? cashSale(i, i.cashOffer, legalCovered) : undefined,
    breakEven: breakEven(i, legalCovered),
  };
}

/** Parses "$350,000" or "350000" to 350000; blank or invalid gives undefined. */
export function parseAmount(value: string): number | undefined {
  const cleaned = value.replace(/[$,\s]/g, "");
  if (!cleaned) return undefined;
  const n = Number(cleaned);
  return Number.isFinite(n) && n >= 0 ? n : undefined;
}
