import { site } from "@/config/site";

export type ComparisonRow = { label: string; us: string; listing: string };

const { promises } = site;

/** Selling to us vs. listing with an agent. Used on the home page, city pages and /cash-offer-vs-realtor. */
export const comparisonRows: ComparisonRow[] = [
  {
    label: "Commissions & fees",
    us: "None",
    listing: "Agent commissions, commonly 5–6% of the price in total (negotiable)",
  },
  {
    label: "Closing costs",
    us: promises.paysClosingCosts ? "We pay the normal seller closing costs" : "Standard seller closing costs only",
    listing: "Often 1–3% of the sale price, paid by you",
  },
  {
    label: "Repairs & updates",
    us: "None. We buy as-is",
    listing: "Usually expected before listing, plus repair requests after inspection",
  },
  {
    label: "Showings & open houses",
    us: "None. One walkthrough",
    listing: "Keep the house show-ready, often on short notice",
  },
  {
    label: "Time to close",
    us: `As little as ${promises.closeInDays} days, or the date you choose`,
    listing: "Time on market, then often 30–60 days to close",
  },
  {
    label: "Financing risk",
    us: "No mortgage approval or appraisal needed",
    listing: "Deals can fall through over financing, appraisal or inspection",
  },
  {
    label: "Holding costs",
    us: "End on the closing date you pick",
    listing: "Keep paying mortgage, taxes, insurance and utilities until it sells",
  },
  {
    label: "Clean-out",
    us: "Take what you want, leave the rest",
    listing: "Empty and clean the house yourself",
  },
];
