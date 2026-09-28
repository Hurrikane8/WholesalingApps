import { closingPhrase, isShown } from "@/lib/claims";

export type ComparisonRow = { label: string; us: string; listing: string };

const sentenceStart = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

/**
 * Selling to me vs. listing with an agent. Used on the home page, city pages
 * and /cash-offer-vs-realtor. Built from claims, so it only promises what's confirmed.
 */
export function getComparisonRows(): ComparisonRow[] {
  return [
    {
      label: "Commissions",
      us: "None",
      listing: "Often a tiered percentage of the price (for example 7% on the first $100,000 and 3% on the rest), plus GST. Negotiable",
    },
    {
      label: "Legal & closing costs",
      us: isShown("coversLegalFees") ? "I pay your standard legal fees" : "Your usual legal fees only",
      listing: "Your lawyer's fees, mortgage discharge costs and any condo document fees",
    },
    {
      label: "Repairs & updates",
      us: "None. I buy as-is",
      listing: "Usually expected before listing, plus requests after the buyer's inspection",
    },
    {
      label: "Showings & open houses",
      us: "None. One walkthrough",
      listing: "Keep the home show-ready, often on short notice",
    },
    {
      label: "Time to close",
      us: sentenceStart(closingPhrase()),
      listing: "Time on market, then commonly 30–60 days to possession",
    },
    {
      label: "Conditions",
      us: "No mortgage approval or appraisal needed",
      listing: "Deals can collapse if financing, inspection or condo document conditions aren't met",
    },
    {
      label: "Holding costs",
      us: "End on the closing date you pick",
      listing: "Keep paying mortgage, property taxes, condo fees, insurance and utilities until it sells",
    },
  ];
}
