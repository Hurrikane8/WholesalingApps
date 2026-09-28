import { site } from "@/config/site";
import { getFaqs } from "@/content/faqs";
import { isUnconfirmed, offerMathClause, offerTimingPhrase } from "@/lib/claims";
import { pageMetadata } from "@/lib/seo";
import { FaqSection, FormHero, HowItWorks, Testimonials, ValueProps } from "@/components/sections";
import { Unconfirmed } from "@/components/preview";

const { market } = site;

export const metadata = pageMetadata({
  title: `Get a cash offer on your ${market.name} home`,
  description: `Tell me about your ${market.name} house, townhouse or condo, and get a written cash offer ${offerTimingPhrase()}${offerMathClause()}. No obligation.`,
  path: "/get-cash-offer",
});

export default function GetOfferPage() {
  return (
    <>
      <FormHero
        title={`Get a cash offer on your ${market.name} home.`}
        subtitle={
          <>
            Tell me about the place. I&apos;ll call you, see it, and send a written offer {offerTimingPhrase()}
            {offerMathClause()}. No obligation.
            <Unconfirmed show={isUnconfirmed("offerWithinHours")} />
          </>
        }
        breadcrumbs={[
          { name: "Home", path: "/" },
          { name: "Get a Cash Offer", path: "/get-cash-offer" },
        ]}
      />
      <ValueProps />
      <HowItWorks title="What happens after you submit" />
      <Testimonials />
      <FaqSection items={getFaqs().slice(0, 6)} moreLink withSchema={false} />
    </>
  );
}
