import Link from "next/link";
import { CircleCheck } from "lucide-react";
import { site } from "@/config/site";
import { pageMetadata } from "@/lib/seo";
import { ComparisonTable, CtaBand, FaqSection, PageHeader } from "@/components/sections";

const { name, promises } = site;

export const metadata = pageMetadata({
  title: "Cash Offer vs. Listing With a Realtor: Which Nets More?",
  description:
    "Compare a cash sale with listing through an Alberta realtor: commissions plus GST, repairs, legal fees, holding costs and timelines, with a worked example.",
  path: "/cash-offer-vs-realtor",
});

/*
 * Illustrative Edmonton-area example. Round, hypothetical figures chosen to
 * show how the costs stack up. They are not a quote or a market statistic.
 */
const ex = {
  afterRepairValue: 400_000,
  repairs: 45_000,
  asIsListPrice: 335_000,
  legalAndDischarge: 1_500,
  /** Mortgage interest, property taxes, condo fees/utilities and insurance. */
  monthlyHolding: 2_200,
  repairAndListMonths: 5,
  asIsListMonths: 4,
  inspectionCredit: 4_000,
  asIsPriceCut: 10_000,
  cashOffer: 265_000,
  cashMonths: 0.5,
};

/** A common Alberta structure: 7% on the first $100,000 and 3% on the balance, plus 5% GST. Negotiable. */
function commission(price: number): number {
  const base = 0.07 * Math.min(price, 100_000) + 0.03 * Math.max(price - 100_000, 0);
  return Math.round(base * 1.05);
}

const cad = (n: number) => n.toLocaleString("en-CA", { style: "currency", currency: "CAD", maximumFractionDigits: 0 });

type Row = readonly [string, number];

const repairAndList: Row[] = [
  ["Sale price (after repairs)", ex.afterRepairValue],
  ["Repairs & updates before listing", -ex.repairs],
  ["Commission (7% / 3%) + GST", -commission(ex.afterRepairValue)],
  ["Legal fees & mortgage discharge", -ex.legalAndDischarge],
  [`Holding costs (${ex.repairAndListMonths} months)`, -ex.monthlyHolding * ex.repairAndListMonths],
  ["Credit to buyer after inspection", -ex.inspectionCredit],
];

const listAsIs: Row[] = [
  ["Sale price (as-is)", ex.asIsListPrice],
  ["Repairs & updates", 0],
  ["Commission (7% / 3%) + GST", -commission(ex.asIsListPrice)],
  ["Legal fees & mortgage discharge", -ex.legalAndDischarge],
  [`Holding costs (${ex.asIsListMonths} months)`, -ex.monthlyHolding * ex.asIsListMonths],
  ["Price cut after inspection", -ex.asIsPriceCut],
];

const cash: Row[] = [
  ["Cash offer (as-is)", ex.cashOffer],
  ["Repairs & updates", 0],
  ["Commission", 0],
  ["Legal fees & mortgage discharge", promises.coversLegalFees ? 0 : -ex.legalAndDischarge],
  ["Holding costs (about 2 weeks)", -ex.monthlyHolding * ex.cashMonths],
  ["Credits or price cuts", 0],
];

const total = (rows: Row[]) => rows.reduce((sum, [, v]) => sum + v, 0);

const faqs = [
  {
    question: "Will I always get less with a cash offer?",
    answer:
      "Usually the cash price is below what a fully repaired, well-marketed home could sell for. Once you subtract repairs, commissions and GST, legal fees, holding costs and price cuts after inspection, the difference in what you actually take home is smaller, and for homes that need a lot of work it can be close.",
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
  const repairNet = total(repairAndList);
  const asIsNet = total(listAsIs);
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
              Take an Edmonton home that would sell for {cad(ex.afterRepairValue)} once fully updated, but that needs
              about {cad(ex.repairs)} of work today. Here are three ways it could go. These are illustrative figures;
              yours will depend on your home, the market and your agent&apos;s terms.
            </p>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-3 lg:items-start">
            <NetSheet title="Repair, then list" rows={repairAndList} net={repairNet} time={`About ${ex.repairAndListMonths} months`} />
            <NetSheet title="List as-is with an agent" rows={listAsIs} net={asIsNet} time={`About ${ex.asIsListMonths} months`} />
            <NetSheet title={`Sell as-is to ${name}`} rows={cash} net={cashNet} time={`As little as ${promises.closeInDays} days`} highlight />
          </div>

          <div className="mt-6 max-w-3xl space-y-3 text-slate-600">
            <p>
              On paper, repairing and listing nets the most here, about {cad(repairNet - cashNet)} more than selling to
              us. But it needs {cad(ex.repairs)} of your own money up front, months of managing contractors and
              showings, and a buyer whose financing and inspection conditions come through. Listing as-is avoids the
              repairs, but homes that need work tend to attract investors and bargain hunters who negotiate hard once
              the inspection is done.
            </p>
            <p>
              If you have the cash, the time and the appetite for it, listing may be your best move, and we&apos;ll
              tell you so. If you don&apos;t, a cash sale trades some of the price for speed, certainty and zero
              out-of-pocket costs.
            </p>
          </div>
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
                "The home has tenants, a special assessment, bylaw issues or title problems",
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
  rows: Row[];
  net: number;
  time: string;
  highlight?: boolean;
}) {
  return (
    <div className={`overflow-hidden rounded-2xl border bg-white shadow-sm ${highlight ? "border-brand-400 ring-2 ring-brand-400/40" : "border-slate-200"}`}>
      <h3 className={`px-4 py-4 text-lg font-bold ${highlight ? "bg-brand-800 text-white" : "bg-slate-100 text-slate-900"}`}>{title}</h3>
      <table className="w-full text-sm">
        <tbody className="divide-y divide-slate-100">
          {rows.map(([label, value]) => (
            <tr key={label}>
              <th scope="row" className="px-4 py-3 text-left font-normal text-slate-700">
                {label}
              </th>
              <td className={`px-4 py-3 text-right font-medium tabular-nums ${value < 0 ? "text-red-700" : "text-slate-900"}`}>
                {value === 0 ? "$0" : `${value < 0 ? "−" : ""}${cad(Math.abs(value))}`}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="bg-slate-50">
            <th scope="row" className="px-4 py-4 text-left font-bold text-slate-900">
              Estimated net (before loan payoff)
            </th>
            <td className="px-4 py-4 text-right text-lg font-extrabold tabular-nums text-slate-900">{cad(net)}</td>
          </tr>
          <tr className="bg-slate-50">
            <th scope="row" className="px-4 pb-4 text-left font-normal text-slate-600">
              Typical timeline
            </th>
            <td className="px-4 pb-4 text-right font-semibold text-slate-900">{time}</td>
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
