import { site } from "@/config/site";
import { getFaqs } from "@/content/faqs";
import { founderDisplayName, heroHeadline, isShown, siteDescription } from "@/lib/claims";
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

const { market, name } = site;

// The primary city's /we-buy-houses page targets "we buy houses {city}"; the home page leads with selling as-is.
const title = `Sell your ${market.name} home as-is for cash | ${name}`;
const description = siteDescription();

export const metadata = pageMetadata({ title, description, path: "/", absoluteTitle: true });

/** The hero lead (spec 5.3): each promise appears only when it's confirmed. */
function heroLead(): string {
  const math = isShown("explainsOfferMath");
  const listing = isShown("tellsWhenListingWins");
  const show =
    math && listing
      ? "what I'd pay, how I got there, and whether you'd do better listing it"
      : math
        ? "what I'd pay and how I got there"
        : listing
          ? "what I'd pay and whether you'd do better listing it"
          : "what I'd pay";
  return `I'm ${founderDisplayName()}. I buy houses, townhouses and condos directly from owners across ${market.region}. Tell me about your place and I'll show you ${show}.`;
}

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
      <FormHero eyebrow={`${name}, ${market.name}`} title={heroHeadline()} subtitle={heroLead()} />
      <ValueProps />
      <HowItWorks />
      <Benefits />
      <ComparisonTable />
      <SituationsGrid situations={situations} />
      <Testimonials />
      <AreasGrid />
      <PostCards posts={posts} intro="Plain answers to common questions about selling, whether you sell to me or not." />
      {/* The general FAQs are marked up once, on /faq, so no FAQPage schema here. */}
      <FaqSection items={getFaqs().slice(0, 7)} moreLink withSchema={false} />
      <CtaBand />
    </>
  );
}
