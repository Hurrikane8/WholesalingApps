/**
 * The only place copy may get a promise from (spec 2.5).
 *
 * Every speed, fee or process promise is gated by a flag in site.verified.
 * A claim renders when its flag is true. In preview builds with
 * NEXT_PUBLIC_PREVIEW_UNCONFIRMED=true it also renders when the flag is off,
 * and isUnconfirmed(flag) tells the page to tag it "Unconfirmed". Production
 * never shows an unconfirmed claim.
 *
 * Server-side only (reads the deploy environment): call from server
 * components and pass plain strings down to client components.
 */
import { site, type VerifiedFlag } from "../config/site";
import { showUnconfirmed } from "./env";
import type { Sample, SampleRow } from "../content/samples";

export type { VerifiedFlag };

/** Kane has confirmed this claim. */
export function isVerified(flag: VerifiedFlag): boolean {
  return site.verified[flag];
}

/** The claim renders: verified, or unconfirmed in a preview build. */
export function isShown(flag: VerifiedFlag): boolean {
  return site.verified[flag] || showUnconfirmed();
}

/** The claim renders only because this is a preview build: tag it "Unconfirmed". */
export function isUnconfirmed(flag: VerifiedFlag): boolean {
  return !site.verified[flag] && showUnconfirmed();
}

/** "as soon as 7 days, or on the date you choose" / "on the date you choose" */
export function closingPhrase(): string {
  return isShown("closeInDays") ? `as soon as ${site.promises.closeInDays} days, or on the date you choose` : "on the date you choose";
}

/** "Close in 7 days", for short headings, or null. */
export function closeInDaysTitle(): string | null {
  return isShown("closeInDays") ? `Close in ${site.promises.closeInDays} days` : null;
}

/**
 * "within 24 hours of seeing the place" / "after I see the place".
 * (Present tense on purpose: the track-record patterns in tests/banned-phrases.mjs reject the past-tense form.)
 */
export function offerTimingPhrase(): string {
  return isShown("offerWithinHours") ? `within ${site.promises.offerWithinHours} hours of seeing the place` : "after I see the place";
}

/** ", with the math laid out" when offers come with the math; otherwise nothing. */
export function offerMathClause(): string {
  return isShown("explainsOfferMath") ? ", with the math laid out" : "";
}

/** "I pay your standard legal fees." or null. */
export function legalFeesSentence(): string | null {
  return isShown("coversLegalFees") ? "I pay your standard legal fees." : null;
}

/** "I reply within 2 hours during business hours (Mon–Sat, 8am–8pm)." or null. */
export function responseLine(): string | null {
  const within = site.responsePromise.duringHours.trim();
  return within ? `I reply ${within} during business hours (${site.hours.label}).` : null;
}

/** "My offer stays open for N days, …" or null. */
export function offerOpenSentence(): string | null {
  const days = site.offerStaysOpenDays;
  return days ? `My offer stays open for ${days} days, so you have time to think and get advice.` : null;
}

export type PromiseItem = { flag: VerifiedFlag; title: string; sentence: string; unconfirmed: boolean };

/** The commitments (spec 5.10), in order, filtered by their flags. */
export function promiseItems(): PromiseItem[] {
  const items: Omit<PromiseItem, "unconfirmed">[] = [
    {
      flag: "explainsOfferMath",
      title: "You see the math",
      sentence: isShown("showsMarginInWriting")
        ? "Your written offer lists the after-repair value, the repairs, my costs and my profit, line by line."
        : "Your offer comes with the after-repair value, the repair estimate and my costs, so you can check my work.",
    },
    {
      flag: "tellsWhenListingWins",
      title: "You hear it when listing wins",
      sentence: "If you'd likely net more by listing with an agent, I'll tell you, and show you the comparison.",
    },
    {
      flag: "assignmentDisclosedBeforeSigning",
      title: "You know who's buying",
      sentence: "I either buy your home myself or assign my contract to another investor. Either way, you'll know in writing before you sign.",
    },
    {
      flag: "noRetrades",
      title: "The price holds",
      sentence:
        "Once we agree on a price, I don't cut it unless something new and material turns up that neither of us knew about, and I'll show you what it is.",
    },
  ];
  return items
    .filter((item) => isShown(item.flag))
    .map((item) => ({
      ...item,
      unconfirmed: isUnconfirmed(item.flag) || (item.flag === "explainsOfferMath" && isUnconfirmed("showsMarginInWriting") && isShown("showsMarginInWriting")),
    }));
}

/** The home page H1. */
export function heroHeadline(): string {
  return isShown("explainsOfferMath")
    ? `Sell your ${site.market.name} home as-is. See the math first.`
    : `Sell your ${site.market.name} home as-is, to a real person.`;
}

export const COMBINED_COST_LABEL = "Buying, holding and resale costs, and profit";
export const COMBINED_COST_NOTE = "What it costs to buy, carry and resell the home, and the profit that makes it worth doing.";

/**
 * A sample's ledger rows. The profit line is itemized only when written offers
 * itemize it (showsMarginInWriting); otherwise buying, holding and resale
 * costs and the profit are combined into one line.
 */
export function sampleOfferRows(sample: Sample): SampleRow[] {
  if (isShown("showsMarginInWriting")) return sample.rows;
  const combined = sample.rows.filter((r) => r.kind === "cost" || r.kind === "profit");
  const rest = sample.rows.filter((r) => r.kind !== "cost" && r.kind !== "profit");
  return [
    ...rest,
    { kind: "cost", label: COMBINED_COST_LABEL, amount: combined.reduce((sum, r) => sum + r.amount, 0), note: COMBINED_COST_NOTE },
  ];
}

/** "Kane" or "Kane Lastname". */
export function founderDisplayName(): string {
  const { firstName, lastName } = site.founder;
  return lastName.trim() ? `${firstName} ${lastName.trim()}` : firstName;
}

/**
 * The site-wide description (spec 5.3): each clause appears only when its
 * claim is shown. With neither, a plain line keeps it a useful length.
 */
export function siteDescription(): string {
  const clauses = [
    isShown("explainsOfferMath") && "shows you the math behind the offer",
    isShown("tellsWhenListingWins") && "tells you when listing would net more",
  ].filter(Boolean);
  const base = `Sell your ${site.market.name} house, townhouse or condo as-is to a local buyer`;
  return clauses.length ? `${base} who ${clauses.join(" and ")}.` : `${base}. No repairs, no showings and no agent commission.`;
}
