import Image from "next/image";
import { phoneHref, site } from "@/config/site";
import { founderDisplayName } from "@/lib/claims";
import { pageMetadata } from "@/lib/seo";
import { LeadForm } from "@/components/LeadForm";
import { OptOutForm } from "@/components/OptOutForm";
import { CallTextLinks, Section } from "@/components/sections";
import { Mark } from "@/components/brand/Mark";
import { TextLink } from "@/components/ui/TextLink";

const { founder, market, name } = site;

export const metadata = pageMetadata({
  title: "Got a letter or a door hanger from me?",
  description: `That was ${founder.firstName} at ${name}. Who I am, why you heard from me, how to ask for an offer, and how to take yourself off my list.`,
  path: "/hello",
  noindex: true,
});

/**
 * For people who got a letter, a door hanger or a knock (spec 5.13). Campaign
 * QR codes point here. Noindex, out of the sitemap and the navigation; the
 * footer's "Got a letter from me?" links to it.
 */
export default function HelloPage() {
  return (
    <>
      <div className="bg-snow">
        <div className="page-wrap pt-10 pb-14 lg:pt-16 lg:pb-20">
          <h1 className="type-h1 max-w-[20ch]">Got a letter or a door hanger from me?</h1>
          <div className="mt-6 flex items-start gap-5">
            {founder.photo ? (
              <Image
                src={founder.photo}
                alt={founder.photoAlt || `${founderDisplayName()}, ${founder.role}`}
                width={96}
                height={96}
                sizes="96px"
                className="size-24 shrink-0 rounded-photo object-cover"
                priority
              />
            ) : (
              <Mark className="size-14 shrink-0" />
            )}
            <p className="type-lead measure text-ink-2">
              That was me, {founder.firstName}. I&apos;m a real person, and I buy homes directly from owners in {market.name}. Here&apos;s who I am, why you
              heard from me, and how to take yourself off my list.
            </p>
          </div>
        </div>
      </div>

      <Section surface="frost" labelledBy="why-heading">
        <h2 id="why-heading" className="type-h2">
          Why you heard from me
        </h2>
        <p className="measure mt-5">
          I contact owners in neighbourhoods where I buy homes. There&apos;s no catch and no cost to talk. If you&apos;re not thinking about selling,
          that&apos;s the end of it.
          {site.letterSource && ` ${site.letterSource}`}
        </p>
      </Section>

      <Section labelledBy="selling-heading" innerClassName="grid gap-y-8 lg:grid-cols-12 lg:gap-x-12">
        <div className="lg:col-span-5">
          <h2 id="selling-heading" className="type-h2">
            Thinking about selling?
          </h2>
          <p className="measure mt-4 text-ink-2">Tell me about the place, or call or text. There&apos;s no obligation.</p>
          <CallTextLinks className="mt-4" />
        </div>
        <div className="lg:col-span-6 lg:col-start-7">
          <LeadForm id="offer" />
        </div>
      </Section>

      <Section surface="frost" id="opt-out" labelledBy="optout-heading" innerClassName="grid gap-y-8 lg:grid-cols-12 lg:gap-x-12">
        <div className="lg:col-span-5">
          <h2 id="optout-heading" className="type-h2">
            Not interested? I&apos;ll take you off my list.
          </h2>
          <p className="measure mt-4 text-ink-2">Only the address is required. Add a phone number or email if I&apos;ve contacted you that way too.</p>
        </div>
        <div className="lg:col-span-6 lg:col-start-7">
          <OptOutForm phone={site.phone} phoneHref={phoneHref} />
        </div>
      </Section>

      <Section labelledBy="legit-heading">
        <h2 id="legit-heading" className="type-h2">
          How to check I&apos;m legit
        </h2>
        <ul className="measure mt-6 list-disc space-y-3 pl-5 marker:text-line">
          {site.social.googleBusinessProfile && (
            <li>
              Search &ldquo;{name} {market.name}&rdquo; to find my <TextLink href={site.social.googleBusinessProfile}>Google Business Profile</TextLink>.
            </li>
          )}
          <li>I never ask for money up front. Real estate lawyers handle the paperwork and the money.</li>
          <li>Have your own lawyer review anything before you sign.</li>
          <li>
            Read <TextLink href="/blog/how-to-spot-a-legitimate-cash-home-buyer">How to spot a legitimate cash home buyer</TextLink>.
          </li>
        </ul>
      </Section>
    </>
  );
}
