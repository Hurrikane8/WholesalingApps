import type { ReactNode } from "react";
import { phoneHref, site } from "@/config/site";
import { locations } from "@/content/locations";
import { pageMetadata } from "@/lib/seo";
import { LeadForm } from "@/components/LeadForm";
import { PageIntro, Section } from "@/components/sections";
import { ButtonLink } from "@/components/ui/Button";
import { TextLink } from "@/components/ui/TextLink";

const { founder, name, market } = site;

export const metadata = pageMetadata({
  title: `Contact ${founder.firstName} at ${name}`,
  description: `Call or text ${founder.firstName} at ${site.phone} about selling your house, townhouse or condo in ${market.region}, or send the details for a no-obligation offer.`,
  path: "/contact",
  absoluteTitle: true,
});

/** Contact (spec 5.12): plain rows, not icon tiles, then the form. */
export default function ContactPage() {
  const rows: { label: string; value: ReactNode }[] = [
    {
      label: "Call",
      value: (
        <TextLink href={`tel:${phoneHref}`} className="nums inline-flex min-h-11 items-center font-semibold">
          {site.phone}
        </TextLink>
      ),
    },
    {
      label: "Text",
      value: (
        <TextLink href={`sms:${phoneHref}`} className="nums inline-flex min-h-11 items-center font-semibold">
          {site.phone}
        </TextLink>
      ),
    },
    ...(site.email
      ? [
          {
            label: "Email",
            value: (
              <TextLink href={`mailto:${site.email}`} className="inline-flex min-h-11 items-center font-semibold">
                {site.email}
              </TextLink>
            ),
          },
        ]
      : []),
    { label: "Hours", value: site.hours.label },
    {
      label: "Areas",
      value: (
        <>
          {locations.map((l) => l.city).join(", ")}.{" "}
          <TextLink href="/we-buy-houses">Areas I buy in</TextLink>
        </>
      ),
    },
  ];

  return (
    <>
      <PageIntro
        breadcrumbs={[
          { name: "Home", path: "/" },
          { name: "Contact", path: "/contact" },
        ]}
        title={`Talk to ${founder.firstName}`}
        surface="frost"
        lead="Questions about selling, or ready for an offer? Call, text or send the details, whichever is easiest. There's no obligation."
      />
      <Section innerClassName="grid gap-y-12 lg:grid-cols-12 lg:gap-x-12">
        <div className="lg:col-span-6">
          <h2 className="type-h2">How to reach me</h2>
          <dl className="mt-6 border-t border-mist">
            {rows.map((row) => (
              <div key={row.label} className="grid grid-cols-[5.5rem_minmax(0,1fr)] items-baseline gap-x-4 border-b border-mist py-3">
                <dt className="font-semibold text-ink">{row.label}</dt>
                <dd className="text-ink-2">{row.value}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="lg:col-span-6 xl:col-span-5 xl:col-start-8">
          <LeadForm id="offer" title="Send me the details" />
          {site.bookingUrl && (
            <div className="mt-8">
              <p className="text-ink-2">Rather talk at a set time?</p>
              <ButtonLink href={site.bookingUrl} variant="secondary" className="mt-3">
                Book a call
              </ButtonLink>
            </div>
          )}
        </div>
      </Section>
    </>
  );
}
