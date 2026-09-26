import { site } from "@/config/site";
import { faqs } from "@/content/faqs";
import { getPosts, getSituations } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";
import { serviceSchema } from "@/lib/schema";
import { JsonLd } from "@/components/JsonLd";
import {
  AreasGrid,
  Benefits,
  ComparisonTable,
  CtaBand,
  FaqSection,
  FormHero,
  HowItWorks,
  PostCards,
  SituationsGrid,
  Testimonials,
  ValueProps,
} from "@/components/sections";

const { market, promises, name } = site;

// The primary city's /we-buy-houses page targets "we buy houses {city}"; the home page leads with "sell my house fast".
const title = `Sell Your House Fast for Cash in ${market.name}, ${market.stateAbbr} | ${name}`;
const description = `Sell your ${market.region} house fast for a fair cash offer. No repairs, no commissions, no fees. Close in as little as ${promises.closeInDays} days or on your schedule.`;

export const metadata = pageMetadata({ title, description, path: "/", absoluteTitle: true });

export default function HomePage() {
  const situations = getSituations();
  const posts = getPosts().slice(0, 3);

  return (
    <>
      <JsonLd
        data={serviceSchema({
          name: `Cash home buying in ${market.region}`,
          description,
          path: "/",
        })}
      />
      <FormHero
        eyebrow={`Local cash home buyers in ${market.region}`}
        title={`Sell Your House Fast for Cash in ${market.name}`}
        subtitle={`Get a fair, no-obligation cash offer for your house in any condition. We buy as-is, cover the hassle, and close on the date you choose.`}
      />
      <ValueProps />
      <HowItWorks />
      <Benefits />
      <ComparisonTable />
      <SituationsGrid situations={situations} />
      <Testimonials />
      <AreasGrid />
      <PostCards posts={posts} intro="Straight answers to the questions homeowners ask us most, whether you sell to us or not." />
      {/* The general FAQs are marked up once, on /faq, so no FAQPage schema here. */}
      <FaqSection items={faqs.slice(0, 7)} moreLink withSchema={false} />
      <CtaBand />
    </>
  );
}
