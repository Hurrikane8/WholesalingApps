import { notFound } from "next/navigation";
import { site } from "@/config/site";
import { getLocation, locations, type Location } from "@/content/locations";
import type { Faq } from "@/content/faqs";
import { closingPhrase, isShown, isUnconfirmed, legalFeesSentence, offerMathClause } from "@/lib/claims";
import { pageMetadata } from "@/lib/seo";
import { serviceSchema } from "@/lib/schema";
import { JsonLd } from "@/components/JsonLd";
import { Unconfirmed } from "@/components/preview";
import { TextLink } from "@/components/ui/TextLink";
import { AreaList, FaqSection, FormHero, PropertyTypeList, Section } from "@/components/sections";

export const dynamicParams = false;

export function generateStaticParams() {
  return locations.map((l) => ({ city: l.slug }));
}

function describe(l: Location): string {
  const math = isShown("explainsOfferMath") ? " who shows you the math behind the offer" : ", with no showings";
  return `Selling a house, townhouse or condo in ${l.city}? Sell it as-is to a local buyer${math}. No repairs, no commission.`;
}

function cityFaqs(l: Location): Faq[] {
  const nearby = l.nearby.map((slug) => getLocation(slug)?.city).filter(Boolean);
  const legalFees = legalFeesSentence();
  return [
    {
      question: `How fast can you buy my house in ${l.city}?`,
      answer: `I close ${closingPhrase()}, once the lawyers have what they need. Real estate lawyers handle the closing, and you're paid through your lawyer on closing day.`,
      unconfirmed: isUnconfirmed("closeInDays"),
    },
    {
      question: `Do you buy houses outside ${l.city}?`,
      answer: `Yes. I buy throughout ${l.region ? `${l.region} and ` : ""}${site.market.region}${nearby.length ? `, including ${nearby.join(", ")}` : ""}. If you're not sure whether I cover your area, send me the address and I'll let you know.`,
    },
    {
      question: `Will you buy my ${l.city} house if it needs major repairs?`,
      answer: `Yes. I buy ${l.city} homes as-is, including homes with roof, foundation, plumbing, electrical or water-damage issues. You don't need to fix, clean or empty anything before you sell.`,
    },
    {
      question: `How do you decide what to offer on a ${l.city} home?`,
      answer: `I look at recent sales of comparable homes in ${l.city}, estimate what the place would be worth after repairs, and subtract the repairs, my costs to buy, hold and resell it, and my profit.${isShown("explainsOfferMath") ? " I walk you through the numbers." : ""}`,
    },
    {
      question: `Are there fees or commissions when I sell my ${l.city} house to you?`,
      answer: `No. There's no fee for an offer and no agent commission.${legalFees ? ` ${legalFees}` : ""} Your mortgage payout and any liens or property tax arrears are paid from the sale price at closing, as in any sale.`,
      unconfirmed: isUnconfirmed("coversLegalFees"),
    },
    {
      question: `Can I sell my ${l.city} house if I'm behind on payments?`,
      answer: `Usually, yes. In Alberta you can generally sell until the court approves a sale or the lender takes title, and a sale can pay out the mortgage and stop the process. Timelines vary, so talk to a lawyer early and tell me where things stand.`,
    },
  ];
}

export async function generateMetadata(props: PageProps<"/we-buy-houses/[city]">) {
  const { city } = await props.params;
  const l = getLocation(city);
  if (!l) return {};
  return pageMetadata({
    ownImage: true,
    title: `We buy houses in ${l.city}, ${l.provinceAbbr}, as-is`,
    description: describe(l),
    path: `/we-buy-houses/${l.slug}`,
  });
}

export default async function CityPage(props: PageProps<"/we-buy-houses/[city]">) {
  const { city } = await props.params;
  const l = getLocation(city);
  if (!l) notFound();

  const place = `${l.city}, ${l.provinceAbbr}`;
  const nearby = l.nearby.map(getLocation).filter((n): n is Location => Boolean(n));
  const path = `/we-buy-houses/${l.slug}`;

  return (
    <>
      <JsonLd data={serviceSchema({ name: `We buy houses in ${place}`, description: describe(l), path, location: l })} />
      <FormHero
        breadcrumbs={[
          { name: "Home", path: "/" },
          { name: "Areas I buy in", path: "/we-buy-houses" },
          { name: l.city, path },
        ]}
        title={`We buy houses in ${place}`}
        lead={
          <>
            I buy houses, townhouses and condos in {l.city} as-is. Get a written, no-obligation offer{offerMathClause()}, and close {closingPhrase()}.
            <Unconfirmed show={isUnconfirmed("closeInDays") || isUnconfirmed("explainsOfferMath")} />
          </>
        }
        formTitle={`What would you get for your ${l.city} place?`}
      />

      <Section surface="frost" labelledBy="local-heading">
        <h2 id="local-heading" className="type-h2">
          Selling in {l.city}
        </h2>
        <p className="measure mt-5">{l.intro}</p>
        <ul className="measure mt-6 list-disc space-y-3 pl-5 text-ink-2 marker:text-line">
          {l.localDetails.map((d) => (
            <li key={d}>{d}</li>
          ))}
        </ul>
      </Section>

      <Section labelledBy="types-heading">
        <h2 id="types-heading" className="type-h2">
          What I buy in {l.city}
        </h2>
        <div className="mt-6">
          <PropertyTypeList compact />
        </div>
        <p className="mt-4">
          <TextLink href="/what-we-buy" className="inline-flex min-h-11 items-center font-semibold">
            More on what I buy
          </TextLink>
        </p>
      </Section>

      <FaqSection items={cityFaqs(l)} title={`Selling a home in ${l.city}: questions`} />

      {nearby.length > 0 && (
        <Section labelledBy="nearby-heading">
          <h2 id="nearby-heading" className="type-h3">
            Nearby areas I buy in
          </h2>
          <div className="mt-4">
            <AreaList only={nearby.map((n) => n.slug)} />
          </div>
        </Section>
      )}
    </>
  );
}
