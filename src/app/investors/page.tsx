import { BadgeDollarSign, Building2, CircleCheck, ClipboardCheck, FileText, Handshake, House, KeyRound, Mail, Timer, Users } from "lucide-react";
import { phoneHref, site } from "@/config/site";
import { pageMetadata } from "@/lib/seo";
import { BuyerForm } from "@/components/BuyerForm";
import { FaqSection, PageHeader } from "@/components/sections";

const { market } = site;

export const metadata = pageMetadata({
  title: "Off-Market Investment Properties in Edmonton: Buyers List",
  description: `Join our ${market.name} buyers list for off-market deals on condo townhouses, houses and duplexes. Tell us your criteria and get matched properties first.`,
  path: "/investors",
});

const dealTypes = [
  { icon: Building2, title: "Condo townhouses", text: "The current focus: units in established complexes across the city, from move-in ready to full renovation." },
  { icon: House, title: "Houses that need work", text: "Bungalows, split-levels and two-storeys in mature neighbourhoods, from cosmetic updates to full renovations." },
  { icon: Users, title: "Half duplexes & multi-unit", text: "Half duplexes, up-down suites and small multifamily properties for buy-and-hold investors." },
  { icon: KeyRound, title: "Rentals with tenants", text: "Occupied properties with the tenancy in place, ready to cash-flow from day one." },
];

const steps = [
  { icon: ClipboardCheck, title: "Tell us your buy box", text: "Strategy, property types, areas, price range and how you fund deals. It takes about two minutes." },
  { icon: Mail, title: "Get matched deals", text: "When a property fits your criteria, you'll get the details, photos and our numbers by email and text." },
  { icon: Timer, title: "View and decide quickly", text: "Walk through the property, run your numbers and let us know. Good deals move fast." },
  { icon: Handshake, title: "Close through lawyers", text: "Sign the paperwork, place your deposit in trust, and close through real estate lawyers." },
];

const expectations = [
  "Proof of funds or a lender letter before you make an offer",
  "A quick yes or no after a showing",
  "A deposit held in a lawyer's trust account once you're committed",
  "Honest feedback when you pass, so we can send you better-matched deals",
  "Your own due diligence on every property",
];

const faqs = [
  {
    question: "Does it cost anything to join the buyers list?",
    answer: "No. Joining is free, and there's no obligation to buy anything.",
  },
  {
    question: "What kinds of properties do you send?",
    answer: `Mostly condo townhouses, single-family homes that need work, half duplexes and small rentals across ${market.region}. We only send properties that match the criteria you give us.`,
  },
  {
    question: "Who gets deals first?",
    answer:
      "Buyers who've shown they can close, with proof of funds and a track record, hear about matching deals first. Tell us about your recent purchases when you sign up.",
  },
  {
    question: "How do purchases work?",
    answer:
      "Usually we assign our purchase contract to you, or sell the property to you directly. Each deal package spells out the structure, the price, the deposit and the closing date, and every deal closes through real estate lawyers.",
  },
  {
    question: "Do you provide numbers on each property?",
    answer:
      "Yes. We share our estimate of the after-repair value, the renovation budget and relevant details like condo fees. Treat them as a starting point, not a guarantee, and always do your own due diligence.",
  },
  {
    question: "How do I unsubscribe?",
    answer: `Reply STOP to any text, click "unsubscribe" in any email, or call or text ${site.phone}.`,
  },
];

export default function InvestorsPage() {
  return (
    <>
      <PageHeader
        breadcrumbs={[
          { name: "Home", path: "/" },
          { name: "Investors", path: "/investors" },
        ]}
        eyebrow="For real estate investors"
        title={`Off-Market Investment Properties in ${market.name}`}
        subtitle={`Join our buyers list to get wholesale deals on ${market.region} condo townhouses, houses and duplexes, matched to what you actually buy.`}
      />

      <section className="section">
        <div className="container-page">
          <div className="max-w-2xl">
            <p className="eyebrow">What we send</p>
            <h2 className="section-title mt-2">Deals that fit your buy box</h2>
            <p className="section-lead">
              We work directly with homeowners across {market.region}, so the properties we send usually haven&apos;t
              been listed. Tell us what you buy and we&apos;ll only send what matches.
            </p>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {dealTypes.map(({ icon: Icon, title, text }) => (
              <div key={title} className="card">
                <span className="flex size-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                  <Icon className="size-6" aria-hidden="true" />
                </span>
                <h3 className="mt-4 text-lg font-bold text-slate-900">{title}</h3>
                <p className="mt-2 text-slate-600">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section bg-slate-50">
        <div className="container-page">
          <p className="eyebrow">How it works</p>
          <h2 className="section-title mt-2">From sign-up to closing</h2>
          <ol className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {steps.map(({ icon: Icon, title, text }, i) => (
              <li key={title} className="card">
                <span className="flex size-12 items-center justify-center rounded-xl bg-accent-400 text-slate-900">
                  <Icon className="size-6" aria-hidden="true" />
                </span>
                <h3 className="mt-5 text-lg font-bold text-slate-900">
                  <span className="text-slate-400">{i + 1}. </span>
                  {title}
                </h3>
                <p className="mt-2 text-slate-600">{text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="join" className="section">
        <div className="container-page grid grid-cols-1 gap-12 lg:grid-cols-[1fr_2fr]">
          <div>
            <p className="eyebrow">Join the list</p>
            <h2 className="section-title mt-2">Get deals before they hit the market</h2>
            <p className="mt-4 text-slate-600">
              The more specific you are, the better we can match you. You can update your criteria any time by
              replying to one of our messages.
            </p>
            <div className="mt-8 rounded-2xl border border-slate-200 p-6">
              <h3 className="flex items-center gap-2 font-bold text-slate-900">
                <BadgeDollarSign className="size-5 text-brand-600" aria-hidden="true" />
                What we ask of buyers
              </h3>
              <ul className="mt-4 space-y-3">
                {expectations.map((e) => (
                  <li key={e} className="flex items-start gap-3 text-sm text-slate-700">
                    <CircleCheck className="mt-0.5 size-4 shrink-0 text-emerald-600" aria-hidden="true" />
                    {e}
                  </li>
                ))}
              </ul>
            </div>
            <p className="mt-6 flex items-start gap-2 text-xs leading-relaxed text-slate-500">
              <FileText className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              Property information is provided for your own evaluation. All purchases are subject to a signed written
              agreement, and you&apos;re responsible for your own due diligence and independent advice.
            </p>
          </div>
          <BuyerForm phone={site.phone} phoneHref={phoneHref} />
        </div>
      </section>

      <FaqSection items={faqs} title="Buyers list: common questions" eyebrow="Investor FAQ" />
    </>
  );
}
