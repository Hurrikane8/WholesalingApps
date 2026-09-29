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

export type FaqGroup = { title: string; items: Faq[] };

/**
 * The /faq page (spec 5.17), in four groups. Answers are built from claims,
 * so they only promise what's confirmed. FAQPage markup is on /faq only.
 */
export function faqGroups(): FaqGroup[] {
  const { market, name } = site;
  const legalFees = legalFeesSentence();
  const [focus, ...otherTypes] = shownPropertyTypes();
  const math = isShown("explainsOfferMath");
  const listing = isShown("tellsWhenListingWins");

  return [
    {
      title: "Offers and money",
      items: [
        {
          question: "How do you work out your offer?",
          answer: `I start with what the home would likely sell for once it's fixed up, based on recent sales of similar homes nearby. Then I subtract the repairs, the costs of buying, holding and reselling it, and a profit.${math ? " Your written offer lays out each number, so you can check my work." : ""}`,
          unconfirmed: isUnconfirmed("explainsOfferMath"),
        },
        {
          question: "Will your offer be lower than listing with a realtor?",
          answer: `Usually, yes. A cash buyer takes on the repairs, the carrying costs and the risk. But when you list, you typically pay commission plus GST, repairs, and months of mortgage payments, condo fees, taxes and utilities while you wait, so the gap in what you take home can be smaller than it looks.${listing ? " If listing would likely net you more, I'll tell you." : ""}`,
          unconfirmed: isUnconfirmed("tellsWhenListingWins"),
        },
        {
          question: "Are there any fees or commissions?",
          answer: `No. There's no fee to talk, no fee for an offer, no commission and no obligation to accept.${legalFees ? ` ${legalFees}` : ""} Your mortgage payout (including any prepayment penalty), liens and property tax arrears come out of the sale price at closing, as in any sale.`,
          unconfirmed: isUnconfirmed("coversLegalFees"),
        },
        {
          question: "Is there any obligation if I ask for an offer?",
          answer: "None. Offers are free. If mine doesn't work for you, say no.",
        },
        {
          question: "How am I paid?",
          answer: "Through your lawyer's trust account on closing day, after your mortgage and anything else registered on title are paid out.",
        },
      ],
    },
    {
      title: "The process",
      items: [
        {
          question: "How does selling my house to you work?",
          answer: `Tell me about the place through the form or by phone. I'll ask a few questions, see the home once (in person or by video), and send you a written offer ${offerTimingPhrase()}${offerMathClause()}. If you accept, we sign a purchase contract, real estate lawyers handle the paperwork, and you're paid through your lawyer on the closing date you choose.`,
          unconfirmed: isUnconfirmed("offerWithinHours"),
        },
        {
          question: "How fast can you close?",
          answer: `We close ${closingPhrase()}, once the title is clear and the lawyers have what they need. If you need time to move or settle an estate, pick a later date.`,
          unconfirmed: isUnconfirmed("closeInDays"),
        },
        {
          question: "Do I need to make repairs or clean the house?",
          answer:
            "No. I buy as-is: foundation cracks, roof leaks, Poly-B plumbing, dated kitchens, fire or water damage, a house full of belongings. The condition sets the price. What stays in the house is agreed in the contract.",
        },
        {
          question: "Can I have a lawyer look at the contract first?",
          answer: "Yes, and I'd encourage it. Take the time you need, and show the offer to family, a lawyer or an agent before you decide.",
        },
      ],
    },
    {
      title: "Situations and property types",
      items: [
        {
          question: "Do you buy condos and townhouses?",
          answer: focus
            ? `Yes. ${focus.plural} are my current focus${focus.value === "Condo townhouse" ? ", including units in complexes with high condo fees, a special assessment or big repairs coming" : ""}.${otherTypes.length ? ` I also buy ${joinList(otherTypes.map((t) => t.plural.toLowerCase()))}.` : ""}`
            : "Yes. Tell me about the place and I'll tell you whether it's something I buy.",
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
            "That's fine. I buy rentals with tenants in place, including tenants who are behind on rent. The tenancy generally carries over to the new owner, so you don't need to end anyone's lease to sell.",
        },
        {
          question: "What areas do you buy in?",
          answer: `${market.region}: Edmonton, plus St. Albert, Sherwood Park, Spruce Grove, Stony Plain, Leduc, Beaumont and Fort Saskatchewan. Send me the address and I'll tell you whether it's an area I buy in.`,
        },
      ],
    },
    {
      title: "About me",
      items: [
        {
          question: "Who are you?",
          answer: `I'm ${founderDisplayName()}, and ${name} is my business. I buy houses, townhouses, duplexes and condos directly from owners across ${market.region}. When you call, you get me: the person who sees your home, runs the numbers and signs the offer.`,
        },
        {
          question: "Are you a realtor?",
          answer: `No. I'm not a realtor, and I don't list homes. I buy them, for my own account. If you'd like advice on listing, talk to a licensed realtor.${listing ? " I'll tell you if I think listing would serve you better." : ""}`,
          unconfirmed: isUnconfirmed("tellsWhenListingWins"),
        },
        {
          question: "Will you actually buy my house, or assign the contract?",
          answer: `Either. Sometimes I buy it myself; sometimes I assign my contract to another investor who buys it. You'll know which, in writing, before you sign. ${site.disclosure}`,
          unconfirmed: isUnconfirmed("assignmentDisclosedBeforeSigning"),
        },
        {
          question: "Is my information kept private?",
          answer:
            "Yes. I use your information only to respond about your property. I never sell it, and your mobile number is never shared with third parties for their marketing. The Privacy Policy has the details.",
        },
      ],
    },
  ];
}

/** Every /faq question, in order. */
export function getFaqs(): Faq[] {
  return faqGroups().flatMap((group) => group.items);
}

/**
 * The home page's five questions (spec 5.3 §8), answers built from claims.
 * The offer page shows the first four.
 */
export function homeFaqs(): Faq[] {
  const legalFees = legalFeesSentence();
  return [
    {
      question: "How do you work out your offer?",
      answer: `I start with what the home would likely sell for once it's fixed up, based on recent sales nearby. Then I subtract the repairs, the costs of buying, holding and reselling, and a profit.${isShown("explainsOfferMath") ? " I walk you through each number." : ""}`,
      unconfirmed: isUnconfirmed("explainsOfferMath"),
    },
    {
      question: "Will your offer be lower than listing?",
      answer: `Usually, yes. A cash buyer takes on the repairs, the carrying costs and the risk. What matters is what you walk away with, and how soon.${isShown("tellsWhenListingWins") ? " If listing would likely net you more, I'll tell you." : ""}`,
      unconfirmed: isUnconfirmed("tellsWhenListingWins"),
    },
    {
      question: "Does it cost anything to get an offer?",
      answer: `No. There's no fee to talk, no fee for an offer, no commission and no obligation to accept.${legalFees ? ` ${legalFees}` : ""}`,
      unconfirmed: isUnconfirmed("coversLegalFees"),
    },
    {
      question: "Do you buy the home yourself, or assign the contract?",
      answer: "Either. Sometimes I buy it myself; sometimes I assign my contract to another investor who buys it. You'll know which, in writing, before you sign.",
      unconfirmed: isUnconfirmed("assignmentDisclosedBeforeSigning"),
    },
    {
      question: "How fast can you close?",
      answer: `We close ${closingPhrase()}. Your lawyer handles the paperwork and the money.`,
      unconfirmed: isUnconfirmed("closeInDays"),
    },
  ];
}
