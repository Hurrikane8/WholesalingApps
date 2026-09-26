import Link from "next/link";
import { CircleCheck } from "lucide-react";
import { site } from "@/config/site";
import { pageMetadata } from "@/lib/seo";
import { ComparisonTable, CtaBand, FaqSection, PageHeader } from "@/components/sections";

const { name, promises } = site;

export const metadata = pageMetadata({
  title: "Cash Offer vs. Listing With a Realtor: Which Nets More?",
  description:
    "Compare a cash sale with listing through an agent: commissions, repairs, closing costs, holding costs and timelines, with a worked net-proceeds example.",
  path: "/cash-offer-vs-realtor",
});

/*
 * Illustrative example. The numbers are round, hypothetical figures chosen to
 * show how the costs stack up. They are not a quote or a market statistic.
 */
const ex = {
  afterRepairValue: 300_000,
  repairs: 35_000,
  commissionRate: 0.055,
  closingCostRate: 0.015,
  monthlyHolding: 1_800,
  listingMonths: 5,
  concessions: 3_000,
  cashOffer: 225_000,
  cashMonths: 0.5,
};

const usd = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

const listing = [
  ["Sale price (after repairs)", ex.afterRepairValue],
  ["Repairs & updates before listing", -ex.repairs],
  [`Agent commissions (${(ex.commissionRate * 100).toFixed(1)}%)`, -ex.afterRepairValue * ex.commissionRate],
  [`Seller closing costs (~${(ex.closingCostRate * 100).toFixed(1)}%)`, -ex.afterRepairValue * ex.closingCostRate],
  [`Holding costs (${ex.listingMonths} months of payments, taxes, insurance, utilities)`, -ex.monthlyHolding * ex.listingMonths],
  ["Buyer repair credits after inspection", -ex.concessions],
] as const;

const cash = [
  ["Cash offer (as-is)", ex.cashOffer],
  ["Repairs & updates", 0],
  ["Agent commissions", 0],
  ["Seller closing costs", promises.paysClosingCosts ? 0 : -ex.cashOffer * ex.closingCostRate],
  ["Holding costs (about 2 weeks)", -ex.monthlyHolding * ex.cashMonths],
  ["Buyer repair credits", 0],
] as const;

const total = (rows: readonly (readonly [string, number])[]) => rows.reduce((s, [, v]) => s + v, 0);

const faqs = [
  {
    question: "Will I always get less with a cash offer?",
    answer:
      "Usually the cash price is below what a fully repaired, well-marketed home could sell for. But once you subtract repairs, commissions, closing costs, holding costs and buyer credits, the difference in what you actually take home is often much smaller, and sometimes a cash sale comes out ahead.",
  },
  {
    question: "When does listing with an agent make more sense?",
    answer:
      "If your house is in good condition, you aren't in a hurry, and you can afford to keep paying for it while it's on the market, listing will often get you the highest price. We'll tell you if we think that's the case.",
  },
  {
    question: "Can I get a cash offer and still talk to an agent?",
    answer: "Absolutely. Our offer is free and has no obligation, so it's a useful benchmark to compare against an agent's pricing and net sheet.",
  },
];

export default function ComparePage() {
  const listingNet = total(listing);
  const cashNet = total(cash);

  return (
    <>
      <PageHeader
        breadcrumbs={[
          { name: "Home", path: "/" },
          { name: "Cash Offer vs. Realtor", path: "/cash-offer-vs-realtor" },
        ]}
        eyebrow="Compare your options"
        title="Cash Offer vs. Listing With a Realtor: Which Puts More in Your Pocket?"
        subtitle="The highest price isn't always the most money in your pocket. Here's how the real costs of each option compare, with a worked example."
      />

      <ComparisonTable showLink={false} title="The side-by-side" />

      <section className="section bg-slate-50">
        <div className="container-page">
          <div className="max-w-3xl">
            <p className="eyebrow">Worked example</p>
            <h2 className="section-title mt-2">What you actually walk away with</h2>
            <p className="section-lead">
              Take a house that would sell for {usd(ex.afterRepairValue)} once fully updated, but that needs about{" "}
              {usd(ex.repairs)} of work today. Here&apos;s how the numbers can play out. These are illustrative figures,
              and yours will depend on your house, your market and your agent&apos;s terms.
            </p>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-2 lg:items-start">
            <NetSheet title="Repair, then list with an agent" rows={listing} net={listingNet} time={`About ${ex.listingMonths} months`} />
            <NetSheet title={`Sell as-is to ${name}`} rows={cash} net={cashNet} time={`As little as ${promises.closeInDays} days`} highlight />
          </div>

          <p className="mt-6 max-w-3xl text-slate-600">
            In this example the listing route nets about {usd(Math.abs(listingNet - cashNet))}{" "}
            {listingNet >= cashNet ? "more" : "less"}, but it requires {usd(ex.repairs)} up front for repairs, several
            months of managing contractors and showings, and the risk that a buyer&apos;s financing or inspection falls
            through. For many sellers, that trade-off is exactly why they choose a cash sale.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container-page grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div className="card">
            <h2 className="text-2xl font-bold text-slate-900">A cash sale is usually better when…</h2>
            <Checklist
              items={[
                "The house needs repairs you can't or don't want to pay for",
                "You're facing a deadline: foreclosure, relocation, a divorce settlement",
                "You've inherited a property and want a simple, clean sale",
                "The house has tenants, code violations or title issues",
                "You value certainty and speed over squeezing out the last dollar",
              ]}
            />
          </div>
          <div className="card">
            <h2 className="text-2xl font-bold text-slate-900">Listing is usually better when…</h2>
            <Checklist
              items={[
                "Your house is updated and in move-in-ready condition",
                "You have several months and can cover the carrying costs",
                "You're comfortable with showings, negotiations and inspections",
                "Local demand is strong for homes like yours",
              ]}
            />
            <p className="mt-5 text-slate-600">
              Not sure which camp you&apos;re in? Get our free offer and compare it with an agent&apos;s net sheet.
              We&apos;ll walk you through both. See also:{" "}
              <Link href="/blog/cash-offer-vs-listing-net-proceeds" className="font-semibold text-brand-600 hover:underline">
                how to compare a cash offer with listing
              </Link>
              .
            </p>
          </div>
        </div>
      </section>

      <FaqSection items={faqs} title="Cash vs. listing: common questions" />
      <CtaBand title="See your own numbers" text="Get a free, no-obligation cash offer and compare it side by side with listing. No pressure either way." />
    </>
  );
}

function NetSheet({
  title,
  rows,
  net,
  time,
  highlight,
}: {
  title: string;
  rows: readonly (readonly [string, number])[];
  net: number;
  time: string;
  highlight?: boolean;
}) {
  return (
    <div className={`overflow-hidden rounded-2xl border bg-white shadow-sm ${highlight ? "border-brand-400 ring-2 ring-brand-400/40" : "border-slate-200"}`}>
      <h3 className={`px-6 py-4 text-lg font-bold ${highlight ? "bg-brand-800 text-white" : "bg-slate-100 text-slate-900"}`}>{title}</h3>
      <table className="w-full text-sm sm:text-base">
        <tbody className="divide-y divide-slate-100">
          {rows.map(([label, value]) => (
            <tr key={label}>
              <th scope="row" className="px-6 py-3 text-left font-normal text-slate-700">
                {label}
              </th>
              <td className={`px-6 py-3 text-right font-medium tabular-nums ${value < 0 ? "text-red-700" : "text-slate-900"}`}>
                {value === 0 ? "$0" : `${value < 0 ? "−" : ""}${usd(Math.abs(value))}`}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="bg-slate-50">
            <th scope="row" className="px-6 py-4 text-left font-bold text-slate-900">
              Estimated net (before loan payoff)
            </th>
            <td className="px-6 py-4 text-right text-lg font-extrabold tabular-nums text-slate-900">{usd(net)}</td>
          </tr>
          <tr className="bg-slate-50">
            <th scope="row" className="px-6 pb-4 text-left font-normal text-slate-600">
              Typical timeline
            </th>
            <td className="px-6 pb-4 text-right font-semibold text-slate-900">{time}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

function Checklist({ items }: { items: string[] }) {
  return (
    <ul className="mt-5 space-y-3">
      {items.map((i) => (
        <li key={i} className="flex items-start gap-3 text-slate-700">
          <CircleCheck className="mt-0.5 size-5 shrink-0 text-emerald-600" aria-hidden="true" />
          {i}
        </li>
      ))}
    </ul>
  );
}
