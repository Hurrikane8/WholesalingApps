import type { ReactNode } from "react";
import { CircleCheck } from "lucide-react";
import { site } from "@/config/site";
import {
  closingPhrase,
  COMBINED_COST_LABEL,
  isShown,
  isUnconfirmed,
  legalFeesSentence,
  offerMathClause,
  offerTimingPhrase,
} from "@/lib/claims";
import { pageMetadata } from "@/lib/seo";
import { CtaBand, FaqSection, HowItWorks, PageHeader } from "@/components/sections";
import { Unconfirmed } from "@/components/preview";

const { market } = site;

export const metadata = pageMetadata({
  title: `How selling your home for cash works in ${market.name}`,
  description: `How selling your ${market.name} home to me works: the first call, one visit, a written offer ${offerTimingPhrase()}, and a closing date you choose.`,
  path: "/how-it-works",
});

function details(): { title: string; points: ReactNode[] }[] {
  const legalFees = legalFeesSentence();
  return [
    {
      title: "1. Tell me about the place",
      points: [
        "Fill in the short form or call me. I'll ask about the property, its condition and your timeline.",
        "There's no cost and no obligation, and you don't need to clean up or prepare anything.",
      ],
    },
    {
      title: "2. One visit",
      points: [
        "I set up one visit at a time that suits you (or a video walkthrough if you prefer) to see the condition first-hand.",
        "No open houses, and no strangers coming through for weeks.",
      ],
    },
    {
      title: "3. Your written cash offer",
      points: [
        <>
          I send a written offer {offerTimingPhrase()}
          {offerMathClause()}.
          <Unconfirmed flag="offerWithinHours" />
        </>,
        "Take your time. Compare it with your other options, and talk it over with family or a lawyer. No pressure.",
      ],
    },
    {
      title: "4. Sign and pick your closing date",
      points: [
        <>
          If you accept, we sign a purchase contract, and we close {closingPhrase()}.
          <Unconfirmed flag="closeInDays" />
        </>,
        <>
          Your real estate lawyer and mine handle the title search at Land Titles, the mortgage payout and the paperwork.
          {legalFees && (
            <>
              {" "}
              {legalFees}
              <Unconfirmed flag="coversLegalFees" />
            </>
          )}
        </>,
      ],
    },
    {
      title: "5. Close and get paid",
      points: [
        "Sign the documents with your lawyer, and the sale proceeds are paid out through your lawyer's trust account on closing day.",
        "Take what you want to keep. What stays behind is set out in the contract.",
      ],
    },
  ];
}

/** The offer formula. Profit gets its own line only when written offers itemize it (showsMarginInWriting). */
function formula(): [string, string][] {
  const costs: [string, string][] = isShown("showsMarginInWriting")
    ? [
        ["− Buying, holding and resale costs", "Legal fees, taxes, insurance, utilities, condo fees and financing while it's renovated, plus commission and GST when it's sold again."],
        ["− Profit", "My fee, plus the renovating investor's profit if I assign the contract."],
      ]
    : [
        [
          `− ${COMBINED_COST_LABEL}`,
          "Legal fees, taxes, insurance, utilities, condo fees and financing while it's renovated, commission and GST when it's sold again, and the profit that makes it worth doing.",
        ],
      ];
  return [
    ["After-repair value", "What the home would likely sell for once fully repaired, based on recent comparable sales nearby."],
    ["− Repairs", "My estimate of what it will cost to bring the place up to market condition."],
    ...costs,
    ["= Your offer", "The price you receive, before your mortgage payout and anything else registered on title."],
  ];
}

function offerFaqs() {
  const legalFees = legalFeesSentence();
  return [
    {
      question: "Why is a cash offer lower than full market value?",
      answer: `Market value assumes a home in great condition, sold after listing, showings and repairs. A cash buyer takes on the repairs, the costs of holding and reselling, and the risk, and you avoid commission, repairs and months of carrying costs.${isShown("explainsOfferMath") ? " You see my math with every offer." : ""}`,
    },
    {
      question: "Do you charge anything to make an offer?",
      answer: `No. Offers are free, and there's no obligation to accept.${legalFees ? ` ${legalFees}` : ""}`,
      unconfirmed: isUnconfirmed("coversLegalFees"),
    },
    {
      question: "Can I back out after I sign?",
      answer:
        "The purchase contract spells out everyone's rights, including any conditions and when they come off, in plain language. I'll go over it with you, and you're welcome to have a lawyer review it before you sign.",
    },
  ];
}

export default function HowItWorksPage() {
  return (
    <>
      <PageHeader
        breadcrumbs={[
          { name: "Home", path: "/" },
          { name: "How It Works", path: "/how-it-works" },
        ]}
        eyebrow="How it works"
        title="How selling your home to me works"
        subtitle={`Here's exactly what happens, from your first call to the day you're paid, for owners across ${market.region}.`}
      />
      <HowItWorks title="The short version" showLink={false} intro="Three steps. No repairs, no commission, and you choose the closing date." />

      <section className="section">
        <div className="container-page grid grid-cols-1 gap-12 lg:grid-cols-2">
          <div>
            <p className="eyebrow">Step by step</p>
            <h2 className="section-title mt-2">What to expect, in detail</h2>
            <ol className="mt-8 space-y-8">
              {details().map((d) => (
                <li key={d.title}>
                  <h3 className="text-xl font-bold text-slate-900">{d.title}</h3>
                  <ul className="mt-3 space-y-2">
                    {d.points.map((p, i) => (
                      <li key={i} className="flex items-start gap-3 text-slate-700">
                        <CircleCheck className="mt-0.5 size-5 shrink-0 text-emerald-600" aria-hidden="true" />
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ol>
          </div>

          <div id="how-i-calculate" className="card self-start bg-slate-50">
            <p className="eyebrow">The formula</p>
            <h2 className="mt-2 text-2xl font-bold text-slate-900">How I calculate an offer</h2>
            <p className="mt-3 text-slate-700">
              Every offer starts from the same formula
              {isShown("explainsOfferMath") ? ", and I walk you through each line:" : ":"}
            </p>
            <dl className="mt-6 divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white">
              {formula().map(([term, def]) => (
                <div key={term} className="p-4">
                  <dt className="font-semibold text-slate-900">{term}</dt>
                  <dd className="mt-1 text-sm text-slate-600">{def}</dd>
                </div>
              ))}
            </dl>
            {isShown("tellsWhenListingWins") && (
              <p className="mt-5 text-sm text-slate-600">
                If you&apos;d likely net more by listing with an agent, and you have the time and budget to prepare the
                place, I&apos;ll tell you so.
              </p>
            )}
          </div>
        </div>
      </section>

      <FaqSection items={offerFaqs()} title="Questions about my offers" />
      <CtaBand />
    </>
  );
}
