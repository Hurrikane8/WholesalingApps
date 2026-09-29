import { site } from "@/config/site";
import type { Faq } from "@/content/faqs";
import {
  closingPhrase,
  COMBINED_COST_LABEL,
  isShown,
  isUnconfirmed,
  legalFeesSentence,
  offerOpenSentence,
  offerTimingPhrase,
  promiseItems,
} from "@/lib/claims";
import { pageMetadata } from "@/lib/seo";
import { Unconfirmed } from "@/components/preview";
import { FaqSection, FinalCta, PageIntro, Section, SectionHeading } from "@/components/sections";
import { Commitments } from "@/components/ui/Commitments";
import { Ledger, type LedgerRow } from "@/components/ui/Ledger";
import { SampleOffer } from "@/components/ui/SampleOffer";
import { Steps, type Step } from "@/components/ui/Steps";
import { TextLink } from "@/components/ui/TextLink";

const { market } = site;

export const metadata = pageMetadata({
  title: `How selling your home for cash works in ${market.name}`,
  description: `How selling your ${market.name} home to me works: the first call, one visit, a written offer ${offerTimingPhrase()}, the contract, and a closing date you choose.`,
  path: "/how-it-works",
});

/** The detailed steps (spec 5.5 §1): the first call, the visit, the offer, what you'll sign, closing. */
function steps(): Step[] {
  const math = isShown("explainsOfferMath");
  const legalFees = legalFeesSentence();
  return [
    {
      title: "The first call",
      text: (
        <p>
          You fill in the form or call me. I ask about the place, its condition, what&apos;s going on and when you&apos;d like to move. There&apos;s no
          cost and no obligation, and you don&apos;t need to prepare anything.
        </p>
      ),
    },
    {
      title: "The visit",
      text: (
        <p>
          I see the place once, at a time that suits you, or by video walkthrough. I look at the roof, windows, plumbing, wiring, foundation and
          finishes, so my repair estimate is based on the real thing. No cleaning, no staging and no open houses.
        </p>
      ),
    },
    {
      title: "Your written offer",
      text: (
        <p>
          I send it {offerTimingPhrase()}
          {math ? ", with the after-repair value, the repair estimate and my costs laid out, so you can check my work" : ""}. Take your time, and show it to
          family, a lawyer or an agent.
          <Unconfirmed show={isUnconfirmed("offerWithinHours") || isUnconfirmed("explainsOfferMath")} />
        </p>
      ),
    },
    {
      title: "What you'll sign",
      text: (
        <p>
          If you accept, we sign a purchase contract: the price, the deposit, any conditions and the closing date.{" "}
          <TextLink href="#what-youll-sign">What the contract covers</TextLink>
        </p>
      ),
    },
    {
      title: "Closing",
      text: (
        <p>
          We close {closingPhrase()}. Your lawyer and mine handle the title search at Land Titles, the mortgage payout and the paperwork, and
          you&apos;re paid through your lawyer&apos;s trust account.
          <Unconfirmed show={isUnconfirmed("closeInDays")} />
          {legalFees && (
            <>
              {" "}
              {legalFees}
              <Unconfirmed show={isUnconfirmed("coversLegalFees")} />
            </>
          )}
        </p>
      ),
    },
  ];
}

/** The offer formula as an annotated ledger (spec 5.5 §2). Profit gets its own line only when written offers itemize it. */
function formulaRows(): { rows: LedgerRow[]; total: LedgerRow } {
  const costs: LedgerRow[] = isShown("showsMarginInWriting")
    ? [
        {
          label: "Buying, holding and resale costs",
          amount: "−",
          note: "Legal fees, taxes, insurance, utilities, condo fees and financing, plus commission and GST when it's sold again.",
        },
        {
          label: (
            <>
              Profit
              <Unconfirmed show={isUnconfirmed("showsMarginInWriting")} />
            </>
          ),
          amount: "−",
          note: "My fee, plus the renovating investor's profit if I assign the contract.",
        },
      ]
    : [
        {
          label: COMBINED_COST_LABEL,
          amount: "−",
          note: "Legal fees, taxes, insurance, utilities, condo fees and financing, commission and GST when it's sold again, and my fee, plus the renovating investor's profit if I assign the contract.",
        },
      ];
  return {
    rows: [
      { label: "After-repair value", amount: "", note: "What it would likely sell for fully repaired, from recent sales nearby." },
      { label: "Repairs", amount: "−", note: "My estimate of what it takes to bring it to market condition." },
      ...costs,
    ],
    total: { label: "Your offer", amount: "=", note: "Before your mortgage payout and anything else registered on title." },
  };
}

/** The three process questions, rewritten (spec 5.5 §5). */
function processFaqs(): Faq[] {
  const legalFees = legalFeesSentence();
  return [
    {
      question: "Why is a cash offer lower than market value?",
      answer: `Market value assumes a home in good shape, listed, shown and sold to a buyer with a mortgage. I take on the repairs, the costs of holding and reselling it, and the risk. In return, you skip the commission, the repairs and months of carrying costs.${isShown("explainsOfferMath") ? " You see my math with every offer." : ""}`,
      unconfirmed: isUnconfirmed("explainsOfferMath"),
    },
    {
      question: "Does it cost anything to get an offer?",
      answer: `No. Offers are free, and there's no obligation to accept.${legalFees ? ` ${legalFees}` : ""}`,
      unconfirmed: isUnconfirmed("coversLegalFees"),
    },
    {
      question: "Can I back out after I sign?",
      answer:
        "The purchase contract sets out everyone's rights, including any conditions and the dates they come off. Read it before you sign, and have your lawyer review it. Until you sign, you can say no to any offer.",
    },
  ];
}

export default function HowItWorksPage() {
  const { rows, total } = formulaRows();
  const legalFees = legalFeesSentence();
  const offerOpen = offerOpenSentence();
  const hasCommitments = promiseItems().length > 0 || legalFees || offerOpen;

  return (
    <>
      <PageIntro
        breadcrumbs={[
          { name: "Home", path: "/" },
          { name: "How it works", path: "/how-it-works" },
        ]}
        title="How selling your home to me works"
        lead={`From the first call to the day you're paid, here's what happens when you sell to me, anywhere in ${market.region}.`}
      />

      <Section surface="frost" labelledBy="steps-heading">
        <h2 id="steps-heading" className="type-h2">
          Five steps
        </h2>
        <Steps steps={steps()} surface="frost" vertical className="mt-10" />
      </Section>

      <Section id="how-i-calculate" labelledBy="calc-heading">
        <div className="grid gap-y-8 lg:grid-cols-12 lg:gap-x-12">
          <SectionHeading
            id="calc-heading"
            className="lg:col-span-5"
            title="How I calculate an offer"
            intro={
              isShown("explainsOfferMath") ? (
                <>
                  Every offer starts from the same formula, and I walk you through each line.
                  <Unconfirmed show={isUnconfirmed("explainsOfferMath")} />
                </>
              ) : (
                "Every offer starts from the same formula."
              )
            }
          />
          <Ledger title="The offer formula" rows={rows} total={total} className="lg:col-span-7" />
        </div>
        <h3 className="type-h3 mt-14">Two worked samples</h3>
        <div className="mt-6 grid gap-8 lg:grid-cols-2">
          <SampleOffer id="house" headingLevel={4} />
          <SampleOffer id="condo" headingLevel={4} />
        </div>
      </Section>

      {hasCommitments && (
        <Section surface="frost" labelledBy="commitments-heading">
          <h2 id="commitments-heading" className="type-h2">
            My commitments
          </h2>
          <Commitments className="mt-8 max-w-3xl" />
          {(legalFees || offerOpen) && (
            <p className="measure mt-6 text-ink-2">
              {legalFees}
              <Unconfirmed show={isUnconfirmed("coversLegalFees")} /> {offerOpen}
            </p>
          )}
        </Section>
      )}

      <Section id="what-youll-sign" labelledBy="sign-heading">
        <h2 id="sign-heading" className="type-h2">
          What you&apos;ll sign
        </h2>
        <p className="measure mt-5">
          The purchase contract sets out the price, the deposit and where it&apos;s held in trust, any conditions and the dates they come off, the closing
          date, and whether I may assign the contract. Your lawyer can review it before you sign, and you can say no to any offer.
        </p>
        <p className="type-small measure mt-6 border-l-4 border-mist pl-4 text-ink-2">{site.disclosure}</p>
      </Section>

      <FaqSection items={processFaqs()} title="Questions about the process" surface="frost" moreLink />
      <FinalCta formId="offer" />
    </>
  );
}
