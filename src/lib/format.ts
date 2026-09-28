/** Money and number formatting shared by ledgers, net sheets and the calculator. */

const CAD = new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD", maximumFractionDigits: 0 });

/** "$425,000"; negatives use a true minus sign: "−$62,000". */
export function formatMoney(amount: number): string {
  const text = CAD.format(Math.abs(Math.round(amount)));
  return amount < 0 && Math.round(amount) !== 0 ? `−${text}` : text;
}

/** Rounds to the nearest `step` (e.g. $500) for prose like "about $12,500 more". */
export function roundTo(amount: number, step: number): number {
  return Math.round(amount / step) * step;
}
