import { site } from "@/config/site";
import { emailConfigured } from "@/lib/notify/resend";
import { pageMetadata } from "@/lib/seo";
import { BookingLink, HandyList, ThankYouHeading } from "@/components/ThankYou";
import { Section } from "@/components/sections";
import { FounderNote } from "@/components/ui/FounderNote";
import { TextLink } from "@/components/ui/TextLink";

export const metadata = pageMetadata({
  title: "Thanks: I've got your request",
  description: `Thanks for contacting ${site.name}. I'll be in touch about your property.`,
  path: "/thank-you",
  noindex: true,
});

/** After a seller submits (spec 5.11). Noindex, and disallowed in robots.txt. */
export default function ThankYouPage() {
  const { duringHours, afterHours } = site.responsePromise;
  const nextLine = duringHours.trim()
    ? `I'll call you ${duringHours.trim()} from ${site.phone}. After hours, I'll call ${afterHours}.`
    : `I'll call you from ${site.phone}. Save the number so you know it's me.`;
  // Seller confirmations go out when Resend is set up, unless SELLER_ACK_EMAIL=false (docs/integrations/README.md).
  const sellerEmailsOn = process.env.SELLER_ACK_EMAIL !== "false" && emailConfigured(process.env);

  return (
    <>
      <div className="bg-snow">
        <div className="page-wrap pt-12 pb-16 lg:pt-20 lg:pb-24">
          <ThankYouHeading nextLine={nextLine} sellerEmailsOn={sellerEmailsOn} />
          {site.bookingUrl && (
            <div className="mt-8 flex flex-col items-center gap-3">
              <p className="text-ink-2">Rather pick a time?</p>
              <BookingLink href={site.bookingUrl} />
            </div>
          )}
        </div>
      </div>

      <Section surface="frost" innerClassName="grid gap-y-12 lg:grid-cols-2 lg:gap-x-12">
        <div>
          <h2 className="type-h2">If you have them handy</h2>
          <p className="measure mt-4 text-ink-2">None of it is required, but it helps me get the numbers right.</p>
          <HandyList />
        </div>
        <div>
          <h2 className="type-h2">While you wait</h2>
          <ul className="mt-4">
            <li>
              <TextLink href="/how-it-works#how-i-calculate" className="inline-flex min-h-11 items-center">
                How I calculate an offer
              </TextLink>
            </li>
            <li>
              <TextLink href="/cash-offer-vs-realtor#calculator" className="inline-flex min-h-11 items-center">
                Cash sale or listing: run your own numbers
              </TextLink>
            </li>
            <li>
              <TextLink href="/blog/how-to-spot-a-legitimate-cash-home-buyer" className="inline-flex min-h-11 items-center">
                How to spot a legitimate cash home buyer
              </TextLink>
            </li>
          </ul>
        </div>
      </Section>

      <Section>
        <FounderNote compact>
          <p>You&apos;ll deal with me from here: the call, the visit and the offer. If anything changes on your end, call or text {site.phone}.</p>
        </FounderNote>
      </Section>
    </>
  );
}
