import Image from "next/image";
import { site } from "@/config/site";
import { homeFaqs } from "@/content/faqs";
import { founderDisplayName, heroHeadline, isShown, isUnconfirmed, responseLine, siteDescription } from "@/lib/claims";
import { getPosts, getSituations } from "@/lib/content";
import { formatMoney, roundTo } from "@/lib/format";
import { EXAMPLE, netSheet } from "@/lib/net-sheet";
import { pageMetadata } from "@/lib/seo";
import { serviceSchema } from "@/lib/schema";
import { AuroraRibbon, AuroraRoofline } from "@/components/brand/AuroraRoofline";
import { JsonLd } from "@/components/JsonLd";
import { LeadForm } from "@/components/LeadForm";
import { homeSteps } from "@/components/pages/steps";
import { Unconfirmed } from "@/components/preview";
import {
  AreaSentence,
  CallTextLinks,
  FaqSection,
  FinalCta,
  PhoneCollapsible,
  PostList,
  PropertyTypeList,
  Section,
  SectionHeading,
  SituationLinks,
  Testimonials,
} from "@/components/sections";
import { ButtonLink } from "@/components/ui/Button";
import { Commitments } from "@/components/ui/Commitments";
import { FounderNote } from "@/components/ui/FounderNote";
import { FounderVideo } from "@/components/ui/FounderVideo";
import { NetBars } from "@/components/ui/NetBars";
import { SampleOffer } from "@/components/ui/SampleOffer";
import { Steps } from "@/components/ui/Steps";
import { TextLink } from "@/components/ui/TextLink";

const { market, name, founder } = site;

// The primary city's /we-buy-houses page targets "we buy houses {city}"; the home page leads with selling as-is.
const title = `Sell your ${market.name} home as-is for cash | ${name}`;
const description = siteDescription();

export const metadata = pageMetadata({ title, description, path: "/", absoluteTitle: true });

const WORDS = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve"];
const inWords = (n: number) => WORDS[n] ?? String(n);

/** The hero lead (spec 5.3): each clause appears only when its claim is shown. */
function heroLead(): string {
  const math = isShown("explainsOfferMath");
  const listing = isShown("tellsWhenListingWins");
  const parts = ["what I'd pay", math && "how I got there", listing && "whether you'd do better listing it"].filter(Boolean) as string[];
  const show = parts.length === 3 ? `${parts[0]}, ${parts[1]}, and ${parts[2]}` : parts.join(" and ");
  return `I'm ${founderDisplayName()}. I buy houses, townhouses and condos directly from owners across ${market.region}. Tell me about your place and I'll show you ${show}.`;
}

/** The night section's numbers, computed from the calculator's worked example, never typed in. */
function listingExample() {
  const legalCovered = isShown("coversLegalFees");
  const sheet = netSheet(EXAMPLE, legalCovered);
  const cash = sheet.cash!;
  return {
    sheet,
    cash,
    difference: roundTo(sheet.asIs.net - cash.net, 500),
    unconfirmed: isUnconfirmed("coversLegalFees") || isUnconfirmed("tellsWhenListingWins"),
  };
}

export default function HomePage() {
  const situations = getSituations();
  const posts = getPosts().slice(0, 3);
  const math = isShown("explainsOfferMath");
  const listingWins = isShown("tellsWhenListingWins");
  const response = responseLine();
  const { sheet, cash, difference, unconfirmed } = listingExample();

  return (
    <>
      <JsonLd data={serviceSchema({ name: `Cash home buying in ${market.region}`, description, path: "/" })} />

      {/* 1. Hero: phones read H1, lead, form, call and text, roofline. */}
      <div className="bg-snow">
        <div className="page-wrap grid gap-y-6 pt-8 pb-6 lg:grid-cols-12 lg:gap-x-12 lg:gap-y-8 lg:pt-16 lg:pb-8">
          <div className="lg:col-span-7 lg:row-start-1">
            <h1 className="type-home-h1 max-w-[16ch]">
              {heroHeadline()}
              <Unconfirmed show={isUnconfirmed("explainsOfferMath")} />
            </h1>
            <p className="type-lead measure mt-6 text-ink-2">
              {founder.photo && (
                <Image
                  src={founder.photo}
                  alt=""
                  width={40}
                  height={40}
                  sizes="40px"
                  className="float-left mt-1 mr-3 size-10 rounded-full object-cover"
                />
              )}
              {heroLead()}
            </p>
          </div>
          <div className="lg:col-span-5 lg:col-start-8 lg:row-span-2 lg:row-start-1">
            <LeadForm />
          </div>
          <div className="lg:col-span-7 lg:row-start-2">
            <CallTextLinks />
            {response && <p className="type-small mt-1 text-ink-2">{response}</p>}
          </div>
        </div>
        <AuroraRoofline className="lg:-mt-16" />
      </div>

      {/* 2. An offer you can check */}
      <Section tight surface="frost" labelledBy="offer-math-heading" innerClassName="grid gap-y-8 lg:grid-cols-12 lg:gap-x-12">
        <SectionHeading
          id="offer-math-heading"
          className="lg:col-span-6 lg:col-start-7 lg:row-start-1"
          title={math ? "An offer you can check" : "How I make an offer"}
          intro={
            math
              ? "A number on its own doesn't tell you much. Here's what comes with mine."
              : "I start with what the home would likely sell for once it's fixed up, then subtract the repairs, the costs of buying, holding and reselling it, and a profit."
          }
        />
        <SampleOffer notesFromSm className="lg:col-span-6 lg:row-span-2 lg:row-start-1 lg:self-start" />
        <Commitments
          className="lg:col-span-6 lg:col-start-7 lg:row-start-2"
          links={{
            explainsOfferMath: { href: "/how-it-works#how-i-calculate", label: "How I calculate an offer" },
            tellsWhenListingWins: { href: "/cash-offer-vs-realtor", label: "See the comparison" },
            assignmentDisclosedBeforeSigning: { href: "/about#how-i-buy", label: "How I buy" },
          }}
        />
      </Section>

      {/* 3. Hi, I'm Kane. */}
      <Section tight>
        <FounderNote link={{ href: "/about", label: "More about me" }}>
          <p>
            When you call {name}, you get me: the person who looks at your home, runs the numbers and signs the offer.
            {founder.shortBio && ` ${founder.shortBio}`}
          </p>
          <p>
            About the name: I grew up in Manning, up the Mackenzie Highway in the County of Northern Lights. The town was called Aurora until postal
            authorities turned the name down because of Aurora, Ontario. This business is a nod to home.
          </p>
        </FounderNote>
        <FounderVideo className="mt-8" />
      </Section>

      {/* 4. How it works */}
      <Section tight surface="frost" labelledBy="steps-heading">
        <div className="flex flex-wrap items-baseline justify-between gap-x-8">
          <h2 id="steps-heading" className="type-h2">
            How it works
          </h2>
          <TextLink href="/how-it-works" className="inline-flex min-h-11 items-center font-semibold max-lg:hidden">
            The full process
          </TextLink>
        </div>
        <Steps steps={homeSteps()} surface="frost" className="mt-8" />
        <p className="mt-6 lg:hidden">
          <TextLink href="/how-it-works" className="inline-flex min-h-11 items-center font-semibold">
            The full process
          </TextLink>
        </p>
      </Section>

      {/* 5. What I buy */}
      <Section tight labelledBy="buy-heading">
        <div className="grid gap-y-4 lg:grid-cols-12 lg:gap-x-12">
          <h2 id="buy-heading" className="type-h2 lg:col-span-4">
            What I buy
          </h2>
          <p className="type-lead measure text-ink-2 lg:col-span-8">
            Houses, townhouses, duplexes and condos across {market.region}, as-is. The condition sets the price. Not sure your place fits? Send the address
            and I&apos;ll tell you straight.
          </p>
        </div>
        <div className="mt-8">
          <PropertyTypeList compactOnPhones />
        </div>
      </Section>

      {/* 6. The one night section: listing sometimes wins. */}
      <section aria-labelledby="listing-heading" data-surface="night" className="bg-night text-snow">
        <AuroraRibbon />
        <div className="page-wrap grid gap-y-8 pt-4 pb-12 lg:grid-cols-12 lg:gap-x-12 lg:pb-16">
          <div className="lg:col-span-6">
            <h2 id="listing-heading" className="type-h2">
              {listingWins ? "Sometimes listing wins. I'll tell you when." : "Cash sale or listing? Here's the math."}
              <Unconfirmed show={isUnconfirmed("tellsWhenListingWins")} />
            </h2>
            <p className="measure mt-5 text-snow">
              Take a house worth {formatMoney(EXAMPLE.arv)} after {formatMoney(EXAMPLE.repairs)} of work. Listed as-is, it would likely net about{" "}
              <span className="nums">{formatMoney(difference)}</span> more than a {formatMoney(cash.rows[0].amount)} cash offer, if the owner can carry it
              for {inWords(sheet.asIs.months)} months and handle showings and inspections. Plenty of owners should list. Others need the certainty and
              speed of a cash sale. The calculator shows where your place lands.
              <Unconfirmed show={unconfirmed} />
            </p>
            <ButtonLink href="/cash-offer-vs-realtor#calculator" variant="night" className="mt-8">
              Run your own numbers
            </ButtonLink>
          </div>
          <div className="lg:col-span-5 lg:col-start-8 lg:self-center">
            <NetBars
              tone="night"
              notesFromSm
              bars={[
                { label: "Repair, then list", amount: sheet.repairList.net, note: `After ${formatMoney(EXAMPLE.repairs)} of repairs and about ${inWords(sheet.repairList.months)} months` },
                { label: "List as-is", amount: sheet.asIs.net, note: `About ${inWords(sheet.asIs.months)} months, with showings and an inspection` },
                { label: `Take the ${formatMoney(cash.rows[0].amount)} cash offer`, amount: cash.net, note: "Closes on the date you choose" },
              ]}
            />
            <p className="type-fine mt-6 text-night-ink-2">Likely nets in the calculator&apos;s worked example. Illustrative, not advice.</p>
          </div>
        </div>
      </section>

      {/* 7. More straight answers: on phones the two lists fold behind their headings. */}
      <Section tight labelledBy="answers-heading">
        <h2 id="answers-heading" className="type-h2">
          More straight answers
        </h2>
        <div className="mt-4 grid border-t border-mist sm:mt-8 sm:gap-y-10 sm:border-t-0 lg:grid-cols-12 lg:gap-x-12">
          <div className="lg:col-span-6 lg:row-start-1">
            <PhoneCollapsible title="Selling because of something hard?">
              <SituationLinks situations={situations} />
            </PhoneCollapsible>
          </div>
          <div className="lg:col-span-6 lg:col-start-7 lg:row-span-2 lg:row-start-1">
            <PhoneCollapsible title="Guides">
              <PostList posts={posts} headingLevel={4} />
              <p className="mt-2">
                <TextLink href="/blog" className="inline-flex min-h-11 items-center font-semibold">
                  All guides
                </TextLink>
              </p>
            </PhoneCollapsible>
          </div>
          <AreaSentence className="mt-6 sm:mt-0 sm:border-t sm:border-mist sm:pt-5 lg:col-span-6 lg:row-start-2 lg:self-start" />
        </div>
      </Section>

      <Testimonials surface="frost" />

      {/* 8. Questions. The general FAQs are marked up once, on /faq, so no FAQPage schema here. */}
      <FaqSection items={homeFaqs()} surface="frost" moreLink askLine={false} tight />

      {/* 9. Final call to action */}
      <FinalCta tight />
    </>
  );
}
