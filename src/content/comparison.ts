import { closingPhrase, isShown, isUnconfirmed } from "@/lib/claims";

/** One row of "What each path costs you" (spec 5.8): plain text in every cell, no winner column. */
export type ComparisonRow = { label: string; repairList: string; asIs: string; cash: string; unconfirmed?: boolean };

export const COMPARISON_PATHS = [
  { key: "repairList", label: "Repair, then list" },
  { key: "asIs", label: "List as-is" },
  { key: "cash", label: "Sell to a cash buyer" },
] as const;

const sentenceStart = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

/**
 * The three ways to sell, side by side, for /cash-offer-vs-realtor. Neutral:
 * each path's costs in plain words. Built from claims, so the cash column
 * only promises what's confirmed.
 */
export function getComparisonRows(): ComparisonRow[] {
  const legalCovered = isShown("coversLegalFees");
  return [
    {
      label: "The price you get",
      repairList: "The highest, once the work is done and a buyer's financing comes through",
      asIs: "Lower: buyers price in the repairs, and often ask for more off after the inspection",
      cash: "Lower again: the buyer takes on the repairs, the costs and the risk",
    },
    {
      label: "Repairs",
      repairList: "You pay for them up front and manage the work",
      asIs: "None before listing, but a price cut or credit after the inspection is common",
      cash: "None. The home is sold as-is",
    },
    {
      label: "Commission and GST",
      repairList: "Often 7% on the first $100,000 and 3% on the rest, plus GST. Negotiable",
      asIs: "The same structure, on a lower price",
      cash: "None",
    },
    {
      label: "Legal fees",
      repairList: "Your lawyer's fees and the mortgage discharge",
      asIs: "Your lawyer's fees and the mortgage discharge",
      cash: legalCovered ? "I pay your standard legal fees" : "Your lawyer's fees and the mortgage discharge",
      unconfirmed: isUnconfirmed("coversLegalFees"),
    },
    {
      label: "Carrying costs",
      repairList: "Mortgage, taxes, condo fees, insurance and utilities through the repairs and the sale",
      asIs: "The same, for the months on the market",
      cash: "Until the closing date you choose",
    },
    {
      label: "Conditions and risk",
      repairList: "Financing, inspection and condo document conditions can end a deal",
      asIs: "The same, and as-is homes tend to draw harder renegotiation",
      cash: "No mortgage approval or appraisal. The contract sets out any conditions and the dates they come off",
    },
    {
      label: "Time",
      repairList: "The repairs, then time on the market, then often 30 to 60 days to possession",
      asIs: "Time on the market, then often 30 to 60 days to possession",
      cash: sentenceStart(closingPhrase()),
      unconfirmed: isUnconfirmed("closeInDays"),
    },
    {
      label: "Your effort",
      repairList: "Contractors, staging, showings and negotiating",
      asIs: "Showings, negotiating and inspection requests",
      cash: "One visit, then the paperwork with your lawyer",
    },
  ];
}
