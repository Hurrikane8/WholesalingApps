import { site } from "@/config/site";
import { faqs } from "@/content/faqs";
import { pageMetadata } from "@/lib/seo";
import { FaqSection, FormHero, HowItWorks, Testimonials, ValueProps } from "@/components/sections";

const { market, promises } = site;

export const metadata = pageMetadata({
  title: "Get a Free Cash Offer on Your House",
  description: `Request a free, no-obligation cash offer on your ${market.region} house. Sell as-is with no repairs or fees, and close in as little as ${promises.closeInDays} days.`,
  path: "/get-cash-offer",
});

export default function GetOfferPage() {
  return (
    <>
      <FormHero
        eyebrow="Free, no-obligation offer"
        title="Get Your Fair Cash Offer Today"
        subtitle={`Tell us a little about your house and we'll send a written cash offer within ${promises.offerWithinHours} hours. No repairs, no fees and no pressure.`}
        breadcrumbs={[
          { name: "Home", path: "/" },
          { name: "Get a Cash Offer", path: "/get-cash-offer" },
        ]}
      />
      <ValueProps />
      <HowItWorks title="What happens after you submit" />
      <Testimonials />
      <FaqSection items={faqs.slice(0, 6)} moreLink withSchema={false} />
    </>
  );
}
