import { site } from "@/config/site";
import { homeFaqs } from "@/content/faqs";
import { isShown, isUnconfirmed, offerMathClause, offerTimingPhrase } from "@/lib/claims";
import { pageMetadata } from "@/lib/seo";
import { nextSteps } from "@/components/pages/steps";
import { Unconfirmed } from "@/components/preview";
import { FaqSection, FormHero, Section, SectionHeading } from "@/components/sections";
import { FounderNote } from "@/components/ui/FounderNote";
import { SampleOffer } from "@/components/ui/SampleOffer";
import { Steps } from "@/components/ui/Steps";

const { market, name } = site;

export const metadata = pageMetadata({
  title: `Get a cash offer on your ${market.name} home`,
  description: `Tell me about your ${market.name} house, townhouse or condo, and get a written cash offer ${offerTimingPhrase()}${offerMathClause()}. No obligation.`,
  path: "/get-cash-offer",
});

/** The focused offer page (spec 5.4) for ads, QR codes and every "Get my offer" link. Budget: 5,000px at 390px wide. */
export default function GetOfferPage() {
  const math = isShown("explainsOfferMath");
  return (
    <>
      <FormHero
        title={`Get a cash offer on your ${market.name} home.`}
        lead={
          <>
            {/* "after I see the place" would repeat "see it", so the timing only appears once it's a real promise. */}
            Tell me about the place. I&apos;ll call you, see it, and send a written offer
            {isShown("offerWithinHours") ? ` ${offerTimingPhrase()}` : ""}
            {offerMathClause()}. No obligation.
            <Unconfirmed show={isUnconfirmed("offerWithinHours")} />
          </>
        }
      />

      <Section surface="frost" labelledBy="next-heading">
        <h2 id="next-heading" className="type-h2">
          What happens next
        </h2>
        <Steps steps={nextSteps()} surface="frost" className="mt-8" />
      </Section>

      <Section labelledBy="sample-heading" innerClassName="grid gap-y-8 lg:grid-cols-12 lg:gap-x-12">
        <SectionHeading
          id="sample-heading"
          className="lg:col-span-5"
          title={math ? "What an offer looks like" : "How I make an offer"}
          intro={
            math ? (
              <>
                Your offer comes with the numbers behind it, like this sample.
                <Unconfirmed show={isUnconfirmed("explainsOfferMath")} />
              </>
            ) : (
              "I start with what the home would likely sell for once it's fixed up, then subtract the repairs, my costs and a profit."
            )
          }
        />
        <SampleOffer className="lg:col-span-7" />
      </Section>

      <Section surface="frost">
        <FounderNote compact link={{ href: "/about", label: "More about me" }}>
          <p>When you contact {name}, you deal with me: the person who sees your home, runs the numbers and signs the offer.</p>
        </FounderNote>
      </Section>

      <FaqSection items={homeFaqs().slice(0, 4)} surface="snow" />
    </>
  );
}
