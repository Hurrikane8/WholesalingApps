import { notFound } from "next/navigation";
import Link from "next/link";
import { CircleCheck, MapPin } from "lucide-react";
import { site } from "@/config/site";
import { getLocation, locations, type Location } from "@/content/locations";
import type { Faq } from "@/content/faqs";
import { getSituations } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";
import { serviceSchema } from "@/lib/schema";
import { JsonLd } from "@/components/JsonLd";
import {
  ComparisonTable,
  CtaBand,
  FaqSection,
  FormHero,
  HowItWorks,
  SituationsGrid,
  Testimonials,
  ValueProps,
} from "@/components/sections";

export const dynamicParams = false;

export function generateStaticParams() {
  return locations.map((l) => ({ city: l.slug }));
}

const { name, promises } = site;

function describe(l: Location): string {
  return `Need to sell your ${l.city} home fast? We buy houses, condos and townhouses for cash, as-is. No repairs, no commissions. Fair offer in ${promises.offerWithinHours} hours.`;
}

function cityFaqs(l: Location): Faq[] {
  const nearby = l.nearby.map((slug) => getLocation(slug)?.city).filter(Boolean);
  return [
    {
      question: `How fast can you buy my house in ${l.city}?`,
      answer: `We can close in as little as ${promises.closeInDays} days once the lawyers have what they need, or on any later date that suits you. Real estate lawyers handle the closing, and you're paid through your lawyer on closing day.`,
    },
    {
      question: `Do you buy houses outside ${l.city}?`,
      answer: `Yes. We buy throughout ${l.region ? `${l.region} and ` : ""}${site.market.region}${nearby.length ? `, including ${nearby.join(", ")}` : ""}. If you're not sure whether we cover your area, send us the address and we'll let you know right away.`,
    },
    {
      question: `Will you buy my ${l.city} house if it needs major repairs?`,
      answer: `Yes. We buy ${l.city} houses as-is, including homes with roof, foundation, plumbing, electrical or water-damage issues. You don't need to fix, clean or empty anything before you sell.`,
    },
    {
      question: `How do you decide what to offer on a ${l.city} home?`,
      answer: `We look at recent sales of comparable homes in ${l.city}, estimate what the house would be worth after repairs, and subtract the repair costs, our costs to buy and resell, and a modest profit. We'll walk you through the numbers.`,
    },
    {
      question: `Are there fees or commissions when I sell my ${l.city} house to you?`,
      answer: `No. There are no agent commissions or hidden fees${promises.coversLegalFees ? ", and we cover your standard legal fees" : ""}. Your mortgage payout and any liens or property tax arrears are paid from the sale price at closing, just like in any sale.`,
    },
    {
      question: `Can I sell my ${l.city} house if I'm behind on payments?`,
      answer: `Often, yes. If there's enough time before a foreclosure sale, a quick cash sale can pay off the loan and protect your credit from a completed foreclosure. Reach out as early as you can so you have the most options.`,
    },
  ];
}

export async function generateMetadata(props: PageProps<"/we-buy-houses/[city]">) {
  const { city } = await props.params;
  const l = getLocation(city);
  if (!l) return {};
  return pageMetadata({
    title: `We Buy Houses in ${l.city}, ${l.provinceAbbr} for Cash`,
    description: describe(l),
    path: `/we-buy-houses/${l.slug}`,
    image: { path: `/we-buy-houses/${l.slug}/opengraph-image`, alt: `We buy houses in ${l.city}, ${l.provinceAbbr}` },
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
          { name: "Areas We Serve", path: "/we-buy-houses" },
          { name: l.city, path },
        ]}
        eyebrow={`Cash home buyers in ${l.city} & area`}
        title={`Sell Your House Fast in ${place}`}
        subtitle={`We buy houses in ${l.city} for cash, in any condition. Get a fair, no-obligation offer and close on the date you choose.`}
        formTitle={`Get your ${l.city} cash offer`}
      />
      <ValueProps />

      <section className="section">
        <div className="container-page grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-start">
          <div>
            <p className="eyebrow">Selling in {l.city}</p>
            <h2 className="section-title mt-2">We buy {l.city} houses as-is, for cash</h2>
            <p className="mt-5 text-lg leading-relaxed text-slate-700">{l.intro}</p>
            <p className="mt-4 leading-relaxed text-slate-700">
              Selling to {name} means no listing, no open houses and no waiting to see whether a buyer&apos;s loan gets
              approved. We make you a written offer, you decide if it works for you, and if it does we close through
              real estate lawyers on your timeline.
            </p>
          </div>
          <div className="card bg-slate-50">
            <h3 className="text-lg font-bold text-slate-900">What to know about selling to us in {l.city}</h3>
            <ul className="mt-4 space-y-3">
              {l.localDetails.map((d) => (
                <li key={d} className="flex items-start gap-3 text-slate-700">
                  <CircleCheck className="mt-0.5 size-5 shrink-0 text-emerald-600" aria-hidden="true" />
                  {d}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <HowItWorks title={`How to sell your ${l.city} house for cash`} />
      <ComparisonTable title={`Selling your ${l.city} house: cash offer vs. listing`} />
      <SituationsGrid
        situations={getSituations()}
        place={l.city}
        title={`Whatever your situation, we can help`}
        intro={`Homeowners in ${l.city} come to us for all kinds of reasons. Here are some of the most common, and how a direct sale can help.`}
      />
      <Testimonials />
      <FaqSection items={cityFaqs(l)} title={`Selling a house in ${l.city}: FAQs`} />

      {nearby.length > 0 && (
        <section className="pb-16">
          <div className="container-page">
            <h2 className="text-xl font-bold text-slate-900">We also buy houses near {l.city}</h2>
            <ul className="mt-4 flex flex-wrap gap-3">
              {nearby.map((n) => (
                <li key={n.slug}>
                  <Link
                    href={`/we-buy-houses/${n.slug}`}
                    className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:border-brand-300 hover:bg-brand-50"
                  >
                    <MapPin className="size-4 text-brand-500" aria-hidden="true" />
                    {n.city}, {n.provinceAbbr}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/we-buy-houses" className="inline-flex items-center rounded-full px-4 py-2 text-sm font-semibold text-brand-600 hover:underline">
                  All service areas
                </Link>
              </li>
            </ul>
          </div>
        </section>
      )}

      <CtaBand title={`Ready to sell your ${l.city} house?`} />
    </>
  );
}
