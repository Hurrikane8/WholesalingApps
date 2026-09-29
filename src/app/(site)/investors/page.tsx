import { phoneHref, site } from "@/config/site";
import { pageMetadata } from "@/lib/seo";
import { BuyerForm } from "@/components/BuyerForm";
import { FaqSection, PageIntro, PropertyTypeList, Section } from "@/components/sections";
import { Steps, type Step } from "@/components/ui/Steps";

const { market } = site;

export const metadata = pageMetadata({
  title: `Off-market investment properties in ${market.name}: buyers list`,
  description: `Join my ${market.name} buyers list for off-market condo townhouses, houses and duplexes. Tell me your criteria and get matching properties by email and text.`,
  path: "/investors",
});

const steps: Step[] = [
  { title: "Tell me your buy box", text: <p>Your strategy, property types, areas, price range and how you fund deals.</p> },
  { title: "Get matched deals", text: <p>When a property fits, you get the details, photos and my numbers by email and text.</p> },
  { title: "View and decide", text: <p>Walk through it, run your own numbers, and tell me yes or no.</p> },
  { title: "Close through lawyers", text: <p>Sign the paperwork, place your deposit in trust, and close through real estate lawyers.</p> },
];

const expectations = [
  "Proof of funds or a lender letter before you make an offer",
  "A clear yes or no after a showing",
  "A deposit held in a lawyer's trust account once you're committed",
  "Honest feedback when you pass, so I can send better matches",
  "Your own due diligence on every property",
];

const faqs = [
  {
    question: "Does it cost anything to join the buyers list?",
    answer: "No. Joining is free, and there's no obligation to buy anything.",
  },
  {
    question: "What kinds of properties do you send?",
    answer: `Condo townhouses, houses that need work, half duplexes and small rentals across ${market.region}, and only the ones that match the criteria you give me.`,
  },
  {
    question: "Who hears about deals first?",
    answer: "Buyers who've shown they can close, with proof of funds and recent purchases. Tell me about yours when you sign up.",
  },
  {
    question: "How do purchases work?",
    answer:
      "Usually I assign my purchase contract to you, or sell you the property directly. Each deal package sets out the structure, the price, the deposit and the closing date, and every deal closes through real estate lawyers.",
  },
  {
    question: "Do you share numbers on each property?",
    answer:
      "Yes: my estimate of the after-repair value, the renovation budget and details like condo fees. Treat them as a starting point, not a guarantee, and do your own due diligence.",
  },
  {
    question: "How do I unsubscribe?",
    answer: `Reply STOP to any text, use the unsubscribe link in any email, or call or text ${site.phone}.`,
  },
];

/** The buyers list (spec 5.18): kept out of the seller's path; in the footer and at the bottom of the mobile menu. */
export default function InvestorsPage() {
  return (
    <>
      <PageIntro
        breadcrumbs={[
          { name: "Home", path: "/" },
          { name: "Investors", path: "/investors" },
        ]}
        title={`Off-market investment properties in ${market.name}`}
        lead={`Join my buyers list for deals on ${market.region} condo townhouses, houses and duplexes, matched to what you actually buy.`}
      />

      <Section surface="frost" labelledBy="types-heading">
        <h2 id="types-heading" className="type-h2">
          What I buy
        </h2>
        <p className="measure mt-4 text-ink-2">
          I buy directly from owners across {market.region}, so most properties I send haven&apos;t been listed. I share deals privately, by email and text,
          only with people on this list. I don&apos;t advertise specific properties publicly.
        </p>
        <div className="mt-8">
          <PropertyTypeList />
        </div>
      </Section>

      <Section labelledBy="process-heading">
        <h2 id="process-heading" className="type-h2">
          From sign-up to closing
        </h2>
        <Steps steps={steps} className="mt-10" />
      </Section>

      <FaqSection items={faqs} title="Buyers list: questions" />

      <Section id="join" labelledBy="join-heading" innerClassName="grid gap-y-10 lg:grid-cols-12 lg:gap-x-12">
        <div className="lg:col-span-5">
          <h2 id="join-heading" className="type-h2">
            Join the list
          </h2>
          <p className="measure mt-4 text-ink-2">The more specific you are, the better I can match you. Update your criteria any time by replying to a message.</p>
          <h3 className="type-h3 mt-8">What I ask of buyers</h3>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-ink-2 marker:text-line">
            {expectations.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
          <p className="type-fine measure mt-6 text-ink-3">
            Property information is for your own evaluation. Every purchase is subject to a signed written agreement, and you&apos;re responsible for your own due
            diligence and independent advice.
          </p>
        </div>
        <div className="lg:col-span-7">
          <BuyerForm phone={site.phone} phoneHref={phoneHref} />
        </div>
      </Section>
    </>
  );
}
