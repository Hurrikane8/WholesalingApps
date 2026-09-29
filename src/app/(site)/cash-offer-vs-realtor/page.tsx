import { site } from "@/config/site";
import { COMPARISON_PATHS, getComparisonRows } from "@/content/comparison";
import type { Faq } from "@/content/faqs";
import { isShown, isUnconfirmed } from "@/lib/claims";
import { formatMoney } from "@/lib/format";
import { EXAMPLE, netSheet, type Path } from "@/lib/net-sheet";
import { pageMetadata } from "@/lib/seo";
import { Unconfirmed } from "@/components/preview";
import { FaqSection, FinalCta, PageIntro, Section, SectionHeading } from "@/components/sections";
import { Ledger } from "@/components/ui/Ledger";
import { NetBars } from "@/components/ui/NetBars";
import { TextLink } from "@/components/ui/TextLink";

const { market } = site;

export const metadata = pageMetadata({
  title: "Cash offer vs. realtor in Alberta: which nets more?",
  description:
    "Compare a cash sale with listing through an Alberta realtor: commission and GST, repairs, legal fees, carrying costs and time, with a worked example.",
  path: "/cash-offer-vs-realtor",
});

const WORDS = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve"];
const months = (n: number) => (n < 1 ? "About two weeks" : `About ${WORDS[n] ?? n} months`);

function comparisonFaqs(): Faq[] {
  return [
    {
      question: "Will I always get less with a cash offer?",
      answer:
        "The cash price is usually below what a repaired, well-marketed home could sell for. Once you subtract repairs, commission and GST, legal fees, carrying costs and price cuts after the inspection, the gap in what you take home is smaller, and for homes that need a lot of work it can be close.",
    },
    {
      question: "When does listing make more sense?",
      answer: `When the home is in good shape, you aren't in a hurry, and you can keep paying for it while it's on the market. Then listing will often net you the most.${isShown("tellsWhenListingWins") ? " If that's your situation, I'll say so." : ""}`,
      unconfirmed: isUnconfirmed("tellsWhenListingWins"),
    },
    {
      question: "Can I get a cash offer and still talk to an agent?",
      answer: "Yes. My offer is free and carries no obligation, so it's a useful benchmark against an agent's pricing and net sheet.",
    },
  ];
}

function PathLedger({ title, path }: { title: string; path: Path }) {
  const [price, ...costs] = path.rows;
  return (
    <Ledger
      title={title}
      sample
      headingLevel={4}
      rows={[price, ...costs.filter((r) => r.amount !== 0)].map((r) => ({ label: r.label, amount: r.amount }))}
      total={{ label: "Net", amount: path.net, note: `${months(path.months)}. Before your mortgage payout.` }}
    />
  );
}

/** Cash offer vs. listing (spec 5.8). The interactive calculator arrives in #calculator in Phase 5; until then, the worked example. */
export default function ComparePage() {
  const legalCovered = isShown("coversLegalFees");
  const sheet = netSheet(EXAMPLE, legalCovered);
  const cash = sheet.cash!;
  const rows = getComparisonRows();

  return (
    <>
      <PageIntro
        breadcrumbs={[
          { name: "Home", path: "/" },
          { name: "Cash vs. listing", path: "/cash-offer-vs-realtor" },
        ]}
        title="Cash offer or listing: which puts more in your pocket?"
        lead="The highest price isn't always the most money in your pocket. Here's an honest way to compare, with your own numbers."
        surface="frost"
      />

      <Section id="calculator" labelledBy="example-heading">
        <SectionHeading
          id="example-heading"
          title="A worked example"
          intro={
            <>
              Take a {market.name} home that would sell for {formatMoney(EXAMPLE.arv)} once it&apos;s fixed up, but needs about {formatMoney(EXAMPLE.repairs)}{" "}
              of work today. Here are three ways it could go.
              <Unconfirmed show={isUnconfirmed("coversLegalFees")} />
            </>
          }
        />
        <div className="mt-10 grid gap-6 lg:grid-cols-3 lg:items-start">
          <PathLedger title="Repair, then list" path={sheet.repairList} />
          <PathLedger title="List as-is" path={sheet.asIs} />
          <PathLedger title={`Take a ${formatMoney(cash.rows[0].amount)} cash offer`} path={cash} />
        </div>
        <NetBars
          className="mt-10 max-w-2xl"
          bars={[
            { label: "Repair, then list", amount: sheet.repairList.net },
            { label: "List as-is", amount: sheet.asIs.net },
            { label: "Cash offer", amount: cash.net },
          ]}
        />
        <p className="measure mt-8">
          In this scenario, a cash offer above <span className="nums font-semibold">{formatMoney(sheet.breakEven)}</span> would beat listing as-is. Repairing
          and listing nets the most on paper, but it needs {formatMoney(EXAMPLE.repairs)} of your own money up front, months of contractors and showings, and a
          buyer whose financing and inspection conditions come through.
        </p>
        <p className="type-fine mt-4 text-ink-3">Illustrative numbers, not a real property. An estimate for comparing options, not financial or legal advice.</p>
      </Section>

      <Section surface="frost" labelledBy="costs-heading">
        <h2 id="costs-heading" className="type-h2">
          What each path costs you
        </h2>
        {/* Desktop: a plain table. Phones: stacked definition lists, so nothing scrolls sideways. */}
        <table className="mt-8 hidden w-full border-collapse text-left lg:table">
          <thead>
            <tr className="border-b-2 border-ink">
              <th scope="col" className="w-[16%] py-3 pr-4">
                <span className="sr-only">Cost</span>
              </th>
              {COMPARISON_PATHS.map((p) => (
                <th key={p.key} scope="col" className="w-[28%] px-4 py-3 font-display text-[1.125rem] font-bold">
                  {p.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label} className="border-b border-mist align-top">
                <th scope="row" className="py-4 pr-4 font-semibold">
                  {row.label}
                </th>
                {COMPARISON_PATHS.map((p) => (
                  <td key={p.key} className="type-small px-4 py-4 text-ink-2">
                    {row[p.key]}
                    {p.key === "cash" && <Unconfirmed show={row.unconfirmed ?? false} />}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        <div className="mt-8 space-y-10 lg:hidden">
          {COMPARISON_PATHS.map((p) => (
            <div key={p.key}>
              <h3 className="type-h3 border-b-2 border-ink pb-2">{p.label}</h3>
              <dl>
                {rows.map((row) => (
                  <div key={row.label} className="border-b border-mist py-3">
                    <dt className="font-semibold">{row.label}</dt>
                    <dd className="type-small mt-1 text-ink-2">
                      {row[p.key]}
                      {p.key === "cash" && <Unconfirmed show={row.unconfirmed ?? false} />}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          ))}
        </div>
      </Section>

      <Section innerClassName="grid gap-y-12 lg:grid-cols-2 lg:gap-x-12">
        <div>
          <h2 className="type-h2">When listing is usually better</h2>
          <ul className="mt-6 list-disc space-y-3 pl-5 marker:text-line">
            <li>Your home is updated and ready to show.</li>
            <li>You have several months, and you can carry the costs while it sells.</li>
            <li>You&apos;re comfortable with showings, negotiating and inspection requests.</li>
            <li>Homes like yours are selling well nearby.</li>
          </ul>
        </div>
        <div>
          <h2 className="type-h2">When a cash sale is usually better</h2>
          <ul className="mt-6 list-disc space-y-3 pl-5 marker:text-line">
            <li>The place needs work you can&apos;t or don&apos;t want to pay for.</li>
            <li>You&apos;re facing a deadline: a foreclosure, a move, a separation agreement.</li>
            <li>You&apos;ve inherited it, and the estate needs a simple sale.</li>
            <li>There are tenants, a special assessment, bylaw issues or title problems.</li>
            <li>Certainty and a date you choose matter more than the last dollar.</li>
          </ul>
          <p className="mt-6 text-ink-2">
            More on this: <TextLink href="/blog/cash-offer-vs-listing-net-proceeds">how to compare a cash offer with listing</TextLink>.
          </p>
        </div>
      </Section>

      <FaqSection items={comparisonFaqs()} title="Cash or listing: questions" />
      <FinalCta formId="offer" title="See your own numbers." />
    </>
  );
}
