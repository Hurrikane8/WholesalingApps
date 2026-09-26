import { CircleCheck } from "lucide-react";
import { site } from "@/config/site";
import { pageMetadata } from "@/lib/seo";
import { CtaBand, FaqSection, HowItWorks, PageHeader } from "@/components/sections";

const { promises, market } = site;

export const metadata = pageMetadata({
  title: "How It Works: Selling Your House for Cash",
  description: `How selling your house to us works, from first call to closing, and how we calculate a fair cash offer. No repairs, no fees, close in as little as ${promises.closeInDays} days.`,
  path: "/how-it-works",
});

const details = [
  {
    title: "1. Tell us about your house",
    points: [
      "Submit the short form or call us. We'll ask about the property, its condition and your timeline.",
      "There's no cost and no obligation, and you don't need to clean up or prepare anything.",
    ],
  },
  {
    title: "2. Quick walkthrough",
    points: [
      "We schedule one visit at a time that suits you (or a video walkthrough if you prefer) to see the condition first-hand.",
      "No inspections parade, no open houses, and no strangers coming through for weeks.",
    ],
  },
  {
    title: "3. Your written cash offer",
    points: [
      `Within ${promises.offerWithinHours} hours we send a written offer and explain exactly how we arrived at it.`,
      "Take your time. Compare it with other options, talk it over with family or a lawyer. We don't use pressure tactics.",
    ],
  },
  {
    title: "4. Sign and pick your closing date",
    points: [
      "If you accept, we sign a simple purchase agreement. You choose the closing date, whether that's next week or two months from now.",
      "Your real estate lawyer and ours handle the title search at Land Titles, the mortgage payout and the paperwork.",
    ],
  },
  {
    title: "5. Close and get paid",
    points: [
      "Sign the documents with your lawyer, and the sale proceeds are paid out through your lawyer's trust account on closing day.",
      "Leave behind anything you don't want. We take care of the clean-out.",
    ],
  },
];

const offerFaqs = [
  {
    question: "Why is a cash offer lower than full market value?",
    answer:
      "Market value assumes a house in great condition sold after listing, showings and repairs. We take on the repairs, the costs of holding and reselling, and the risk, and you avoid commissions, repairs and months of carrying costs. We'll always show you our math.",
  },
  {
    question: "Do you charge anything to make an offer?",
    answer: "No. Offers are always free, and there's no obligation to accept.",
  },
  {
    question: "Can I back out after I sign?",
    answer:
      "Our purchase agreement spells out everyone's rights, including any conditions and when they come off, in plain language. We'll go over it with you, and you're welcome to have a lawyer review it before you sign.",
  },
];

export default function HowItWorksPage() {
  return (
    <>
      <PageHeader
        breadcrumbs={[
          { name: "Home", path: "/" },
          { name: "How It Works", path: "/how-it-works" },
        ]}
        eyebrow="How it works"
        title="How Selling Your House for Cash Works"
        subtitle={`A simple, transparent process built around your timeline. Here's exactly what happens, from your first call to cash in hand, for homeowners across ${market.region}.`}
      />
      <HowItWorks title="The short version" showLink={false} intro="Three steps, no repairs, no fees, and you choose the closing date." />

      <section className="section">
        <div className="container-page grid grid-cols-1 gap-12 lg:grid-cols-2">
          <div>
            <p className="eyebrow">Step by step</p>
            <h2 className="section-title mt-2">What to expect, in detail</h2>
            <ol className="mt-8 space-y-8">
              {details.map((d) => (
                <li key={d.title}>
                  <h3 className="text-xl font-bold text-slate-900">{d.title}</h3>
                  <ul className="mt-3 space-y-2">
                    {d.points.map((p) => (
                      <li key={p} className="flex items-start gap-3 text-slate-700">
                        <CircleCheck className="mt-0.5 size-5 shrink-0 text-emerald-600" aria-hidden="true" />
                        {p}
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ol>
          </div>

          <div id="how-we-calculate" className="card self-start bg-slate-50">
            <p className="eyebrow">Transparency</p>
            <h2 className="mt-2 text-2xl font-bold text-slate-900">How we calculate your offer</h2>
            <p className="mt-3 text-slate-700">
              We don&apos;t pull numbers out of thin air. Every offer starts from the same simple formula, and we&apos;ll
              walk you through each line:
            </p>
            <dl className="mt-6 divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white">
              {[
                ["After-repair value", "What the home would likely sell for once fully repaired, based on recent comparable sales nearby."],
                ["− Repair costs", "Our estimate of what it will cost to bring the house up to market condition."],
                ["− Buying, holding & selling costs", "Closing costs, taxes, insurance, utilities and financing while we renovate, plus the costs of reselling."],
                ["− A modest profit", "What makes the purchase worthwhile for us or the investor who buys it."],
                ["= Your cash offer", "The price you receive, before paying off any mortgage or liens you owe."],
              ].map(([term, def]) => (
                <div key={term} className="p-4">
                  <dt className="font-semibold text-slate-900">{term}</dt>
                  <dd className="mt-1 text-sm text-slate-600">{def}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-5 text-sm text-slate-600">
              If you&apos;d likely net more by listing with an agent, and you have the time and budget to prepare the
              house, we&apos;ll tell you so.
            </p>
          </div>
        </div>
      </section>

      <FaqSection items={offerFaqs} title="Questions about our offers" />
      <CtaBand />
    </>
  );
}
