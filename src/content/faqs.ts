import { shownPropertyTypes, site } from "@/config/site";
import {
  closingPhrase,
  founderDisplayName,
  isShown,
  isUnconfirmed,
  legalFeesSentence,
  offerMathClause,
  offerTimingPhrase,
} from "@/lib/claims";

export type Faq = {
  question: string;
  answer: string;
  /** Preview builds only: the answer includes a claim Kane hasn't confirmed yet. */
  unconfirmed?: boolean;
};

/** "a, b and c" */
function joinList(items: string[]): string {
  return items.length < 2 ? items.join("") : `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}

/**
 * General FAQs, shown on /faq (all of them) and on the home and offer pages
 * (the first few). Built from claims, so they only promise what's confirmed.
 */
export function getFaqs(): Faq[] {
  const { market, name } = site;
  const legalFees = legalFeesSentence();
  const [focus, ...otherTypes] = shownPropertyTypes();

  return [
    {
      question: "How does selling my house for cash work?",
      answer: `Tell me about the place through the form or by phone. I'll ask a few questions, see the home (in person or by video), and send you a written, no-obligation cash offer ${offerTimingPhrase()}${offerMathClause()}. If you accept, we sign a simple purchase contract, real estate lawyers handle the paperwork, and you're paid through your lawyer on the closing date you choose.`,
      unconfirmed: isUnconfirmed("offerWithinHours"),
    },
    {
      question: "How fast can you close?",
      answer: `I close ${closingPhrase()}, once the title is clear and the lawyers have what they need. If you need time to move or settle an estate, pick a later date.`,
      unconfirmed: isUnconfirmed("closeInDays"),
    },
    {
      question: "Are there any fees or commissions?",
      answer: `No. There's no fee to talk, no fee for an offer, no agent commission and no obligation to accept.${legalFees ? ` ${legalFees}` : ""} Your mortgage payout (including any prepayment penalty), liens and property tax arrears come out of the sale price at closing, as in any sale.`,
      unconfirmed: isUnconfirmed("coversLegalFees"),
    },
    {
      question: "Do you buy condos and townhouses?",
      answer: focus
        ? `Yes. ${focus.plural} are my current focus${focus.value === "Condo townhouse" ? ", including units in complexes with high condo fees, a special assessment or big repairs coming up" : ""}.${otherTypes.length ? ` I also buy ${joinList(otherTypes.map((t) => t.plural.toLowerCase()))}.` : ""}`
        : "Yes. Tell me about the place and I'll tell you whether it's something I buy.",
    },
    {
      question: "Do I need to make repairs or clean the house?",
      answer:
        "No. I buy as-is: foundation cracks, roof leaks, Poly-B plumbing, dated kitchens, fire or water damage, a house full of belongings. You don't need to fix, clean or empty anything first; we agree in the contract on what stays.",
    },
    {
      question: "How do you calculate your offer?",
      answer: `I start with what the home would likely sell for after it's fully repaired, based on recent sales of comparable homes nearby. Then I subtract the repairs, the costs of buying, holding and reselling it, and my profit.${isShown("explainsOfferMath") ? " Your offer comes with those numbers, so you can check my work." : ""}`,
      unconfirmed: isUnconfirmed("explainsOfferMath"),
    },
    {
      question: "Will your offer be lower than listing with a realtor?",
      answer: `Usually, yes: my price is lower than what a fully repaired home might sell for on the open market. But when you list, you typically pay commission plus GST, repairs, and months of mortgage payments, condo fees, taxes and utilities while you wait, so the gap can be smaller than it looks.${isShown("tellsWhenListingWins") ? " If listing would likely put more money in your pocket, I'll tell you." : ""}`,
      unconfirmed: isUnconfirmed("tellsWhenListingWins"),
    },
    {
      question: "Is there any obligation if I request an offer?",
      answer: "None. Offers are free and carry no obligation. If mine doesn't work for you, just say no.",
    },
    {
      question: "Will you actually buy my house, or assign the contract?",
      answer: `I'll be upfront about it. ${site.disclosure}`,
    },
    {
      question: "Can you buy a house that's in foreclosure?",
      answer:
        "Often, yes. In Alberta, foreclosure goes through the courts and takes time, and until the court process ends you can usually still sell. A sale pays out your mortgage and the lender's costs at closing. The sooner you reach out, the more options you have. Talk to a lawyer and a non-profit credit counsellor about every option, too.",
    },
    {
      question: "Can I sell a house I inherited or that's part of an estate?",
      answer:
        "Yes. I work with the personal representative (executor) and the estate's lawyer. In many cases we can sign a purchase contract while the grant of probate is being processed, and close once the personal representative has authority to sell.",
    },
    {
      question: "What if I still have tenants in the property?",
      answer:
        "That's fine. I buy rentals with tenants in place, including tenants who are behind on rent. The tenancy carries over to the new owner, so you don't need to end anyone's lease to sell.",
    },
    {
      question: "What areas do you buy in?",
      answer: `${market.region}: Edmonton plus St. Albert, Sherwood Park, Spruce Grove, Stony Plain, Leduc, Beaumont and Fort Saskatchewan. Send me the address and I'll tell you whether it's an area I buy in.`,
    },
    {
      question: `Who is ${name}?`,
      answer: `I'm ${founderDisplayName()}, and ${name} is my business. I buy houses, townhouses, duplexes and condos directly from owners across ${market.region}${isShown("explainsOfferMath") ? ", and every offer comes with the math behind it" : ""}.`,
    },
    {
      question: "Is my information kept private?",
      answer:
        "Yes. I use your information only to respond about your property. I never sell it, and your mobile number is never shared with third parties for their marketing. See the Privacy Policy for details.",
    },
  ];
}
