import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { phoneHref, site } from "@/config/site";
import { OFFER_PATH } from "@/config/nav";
import { getFaqs } from "@/content/faqs";
import { deployEnv } from "@/lib/env";
import { pageMetadata } from "@/lib/seo";
import { AuroraRibbon, AuroraRoofline, RooflineCrop } from "@/components/brand/AuroraRoofline";
import { Logo } from "@/components/brand/Logo";
import { Mark } from "@/components/brand/Mark";
import { FocusFooter, FocusHeader } from "@/components/chrome/SiteFooter";
import { MobileMenuLinks } from "@/components/chrome/MobileMenu";
import { StickyActions } from "@/components/chrome/StickyActions";
import { DraftBanner, Unconfirmed } from "@/components/preview";
import { LeadForm } from "@/components/LeadForm";
import { OptOutForm } from "@/components/OptOutForm";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Commitments } from "@/components/ui/Commitments";
import { Faq } from "@/components/ui/Faq";
import { Checkbox, ChipGroup, SelectField, TextAreaField, TextField } from "@/components/ui/Field";
import { FounderNote } from "@/components/ui/FounderNote";
import { Ledger } from "@/components/ui/Ledger";
import { NetBars } from "@/components/ui/NetBars";
import { Notice } from "@/components/ui/Notice";
import { SampleOffer } from "@/components/ui/SampleOffer";
import { Steps } from "@/components/ui/Steps";
import { StraightAnswer } from "@/components/ui/StraightAnswer";
import { TextLink } from "@/components/ui/TextLink";

export const metadata = pageMetadata({
  title: "Styleguide",
  description: "Every design token, type style and component on the Aurora Home Buyers site, in every state. Preview builds only.",
  path: "/styleguide",
  noindex: true,
});

const COLOURS: { name: string; hex: string; use: string; className: string }[] = [
  { name: "snow", hex: "#F4F7F8", use: "Page background", className: "bg-snow" },
  { name: "frost", hex: "#E3ECEE", use: "Alternate sections, unselected chips", className: "bg-frost" },
  { name: "white", hex: "#FFFFFF", use: "Form card, ledgers, input fill", className: "bg-white" },
  { name: "mist", hex: "#C9D6D9", use: "Decorative rules only; never text or input borders", className: "bg-mist" },
  { name: "line", hex: "#6F8781", use: "Input and control borders (3.6:1 on snow)", className: "bg-line" },
  { name: "ink", hex: "#183A31", use: "Primary text, headings, the logo (11.5:1)", className: "bg-ink" },
  { name: "ink-2", hex: "#3F5A54", use: "Secondary text (7:1)", className: "bg-ink-2" },
  { name: "ink-3", hex: "#4D6660", use: "Fine print and captions, 14px or larger (5.8:1)", className: "bg-ink-3" },
  { name: "pine", hex: "#0B6B4F", use: "Primary buttons, selected chips (white text 6.5:1)", className: "bg-pine" },
  { name: "pine-deep", hex: "#08573F", use: "Hover and pressed", className: "bg-pine-deep" },
  { name: "night", hex: "#0E2A30", use: "The one dark section a page may have (snow text 14:1)", className: "bg-night" },
  { name: "night-ink-2", hex: "#B8CCCB", use: "Secondary text on night (9:1)", className: "bg-night-ink-2" },
  { name: "aurora-green", hex: "#3FE0A0", use: "Ribbon and logo crossbar; decorative only", className: "bg-aurora-green" },
  { name: "aurora-teal", hex: "#31C6D4", use: "Ribbon midpoint; decorative only", className: "bg-aurora-teal" },
  { name: "aurora-violet", hex: "#8F7CF7", use: "Ribbon tail; decorative only", className: "bg-aurora-violet" },
  { name: "focus", hex: "#4B3FC4", use: "Focus rings on light surfaces (6.9:1)", className: "bg-focus" },
  { name: "focus-night", hex: "#9EF0CF", use: "Focus rings on night", className: "bg-focus-night" },
  { name: "error", hex: "#B3261E", use: "Error text and borders (6:1)", className: "bg-error" },
  { name: "signal", hex: "#9A5B00", use: "“Unconfirmed” and “Draft” preview tags only", className: "bg-signal" },
];

const TYPE: { role: string; className: string; sample: string }[] = [
  { role: "Home H1, Overpass 800", className: "type-home-h1", sample: "Sell your Edmonton home as-is." },
  { role: "H1, Overpass 800", className: "type-h1", sample: "How selling your home to me works" },
  { role: "H2, Overpass 750", className: "type-h2", sample: "An offer you can check" },
  { role: "H3, Overpass 700", className: "type-h3", sample: "You see the math" },
  { role: "Lead, Atkinson 400, 20px", className: "type-lead", sample: "Tell me about your place and I'll show you what I'd pay, and how I got there." },
  { role: "Body, Atkinson 400, 18px", className: "type-body", sample: "Real estate lawyers handle the title, the mortgage payout and the paperwork." },
  { role: "Small, Atkinson 400, 16px", className: "type-small", sample: "Two quick steps. No obligation." },
  { role: "Fine print, Atkinson 400, 14px (the minimum)", className: "type-fine", sample: "Illustrative numbers, not a real property." },
];

const CHIPS = [
  { value: "Move-in ready", label: "Move-in ready" },
  { value: "Light reno", label: "Needs some work" },
  { value: "Heavy reno", label: "Needs a lot of work" },
];

function Section({ title, surface = "snow", children, id }: { title: string; surface?: "snow" | "frost" | "night"; children: ReactNode; id?: string }) {
  const bg = { snow: "bg-snow", frost: "bg-frost", night: "bg-night text-snow" }[surface];
  return (
    <section id={id} className={`band ${bg}`} data-surface={surface === "night" ? "night" : undefined}>
      <div className="page-wrap">
        <h2 className={`type-h2 ${surface === "night" ? "text-snow" : "text-ink"}`}>{title}</h2>
        <div className="mt-8">{children}</div>
      </div>
    </section>
  );
}

function Label({ children, night = false }: { children: ReactNode; night?: boolean }) {
  return <p className={`type-fine mb-3 font-semibold ${night ? "text-night-ink-2" : "text-ink-2"}`}>{children}</p>;
}

function FormCard({ children }: { children: ReactNode }) {
  return <div className="rounded-card border border-mist bg-white p-6 shadow-float sm:p-8">{children}</div>;
}

export default function StyleguidePage() {
  if (deployEnv() === "production") notFound();
  const faqs = getFaqs().slice(0, 3);

  return (
    <div className="bg-snow text-ink">
      <div className="page-wrap pt-12 pb-4">
        <h1 className="type-h1">Styleguide</h1>
        <p className="type-lead measure mt-4 text-ink-2">
          Every token, type style and component, in every state, on snow, frost and night. This page exists only in preview and
          development builds.
        </p>
      </div>

      <Section title="Colour">
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {COLOURS.map((c) => (
            <li key={c.name} className="flex gap-4">
              <span className={`size-14 shrink-0 rounded-field border border-mist ${c.className}`} aria-hidden="true" />
              <span>
                <span className="block font-semibold">
                  {c.name} <span className="nums font-normal text-ink-2">{c.hex}</span>
                </span>
                <span className="type-small block text-ink-2">{c.use}</span>
              </span>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Type" surface="frost">
        <div className="space-y-8">
          {TYPE.map((t) => (
            <div key={t.role}>
              <Label>{t.role}</Label>
              <p className={t.className}>{t.sample}</p>
            </div>
          ))}
          <div>
            <Label>Amounts: tabular figures</Label>
            <ul className="nums flex flex-wrap gap-x-8 font-display text-[1.375rem] font-extrabold">
              <li>$283,900</li>
              <li>−$62,000</li>
              <li>$1,500</li>
            </ul>
          </div>
        </div>
      </Section>

      <Section title="Buttons and links">
        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <Label>On snow</Label>
            <div className="flex flex-wrap gap-3">
              <ButtonLink href={OFFER_PATH}>Get my offer</ButtonLink>
              <ButtonLink href={`tel:${phoneHref}`} variant="secondary">
                Call {site.phone}
              </ButtonLink>
              <ButtonLink href={OFFER_PATH} compact>
                Get my offer
              </ButtonLink>
              <Button disabled>Sending…</Button>
              <Button variant="secondary" disabled>
                Disabled
              </Button>
            </div>
            <p className="mt-6">
              A <TextLink href="/how-it-works">text link</TextLink> inside a sentence, never with an arrow.
            </p>
          </div>
          <div className="rounded-card bg-frost p-6">
            <Label>On frost</Label>
            <div className="flex flex-wrap gap-3">
              <ButtonLink href={OFFER_PATH}>Get my offer</ButtonLink>
              <ButtonLink href={`sms:${phoneHref}`} variant="secondary">
                Text me
              </ButtonLink>
            </div>
          </div>
        </div>
      </Section>

      <Section title="On night" surface="night">
        <div className="flex flex-wrap items-center gap-4">
          <ButtonLink href="/cash-offer-vs-realtor#calculator" variant="night">
            Run your own numbers
          </ButtonLink>
          <p>
            A <TextLink href="/cash-offer-vs-realtor" tone="night">link on night</TextLink>, with its own focus colour.
          </p>
        </div>
        <div className="mt-10 max-w-xl">
          <Label night>NetBars on night</Label>
          <NetBars
            tone="night"
            bars={[
              { label: "Repair, then list", amount: 321_700 },
              { label: "List as-is", amount: 299_947 },
              { label: "Cash offer", amount: 262_400 },
            ]}
          />
        </div>
        <AuroraRibbon className="mt-12" />
      </Section>

      <Section title="Form controls" surface="frost">
        <div className="grid gap-8 lg:grid-cols-2">
          <FormCard>
            <h3 className="type-h3">What would you get for your place?</h3>
            <p className="type-small mt-1 text-ink-2">Two quick steps. No obligation.</p>
            <div className="mt-6 space-y-5">
              <TextField id="sg-address" label="Property address" placeholder="e.g. 1234 56 St NW, Edmonton" autoComplete="off" />
              <TextField id="sg-name" label="Your name" hint="So I know who I'm talking to." defaultValue="Denise" />
              <TextField id="sg-phone" label="Mobile phone" type="tel" error="Enter a 10-digit phone number." defaultValue="780 555" />
              <TextField id="sg-email" label="Email" type="email" optional disabled placeholder="Disabled field" />
              <SelectField
                id="sg-timeline"
                label="When would you like to sell?"
                options={[
                  { value: "ASAP", label: "As soon as possible" },
                  { value: "1-3 months", label: "In 1–3 months" },
                ]}
              />
              <TextAreaField id="sg-notes" label="Anything else?" optional />
            </div>
          </FormCard>
          <FormCard>
            <div className="space-y-6">
              <ChipGroup id="sg-chips-a" name="sg-condition-a" legend="Condition" options={CHIPS} />
              <ChipGroup id="sg-chips-b" name="sg-condition-b" legend="Condition (selected)" options={CHIPS} defaultValue="Light reno" />
              <ChipGroup id="sg-chips-c" name="sg-condition-c" legend="Condition (error)" options={CHIPS} error="Pick the closest one." />
              <Checkbox id="sg-check-a" label="Text me about my request. Message and data rates may apply." />
              <Checkbox id="sg-check-b" label="Checked" defaultChecked />
              <Checkbox id="sg-check-c" label="With an error" error="Please confirm to continue." />
              <Button type="button" className="w-full">
                Next
              </Button>
              <Button type="button" className="w-full" disabled>
                Sending…
              </Button>
              <Notice tone="success" title="Got it. I'll call you from (780) 836-5156.">
                Save the number so you know it&apos;s me.
              </Notice>
              <Notice tone="error" title="That didn't send.">
                Please call or text {site.phone} instead, and I&apos;ll take it from there.
              </Notice>
            </div>
          </FormCard>
        </div>
      </Section>

      <Section title="Forms">
        <div className="grid gap-8 lg:grid-cols-2">
          <div>
            <Label>Seller form (step 1; step 2 appears after Next)</Label>
            <LeadForm id="offer" />
          </div>
          <div>
            <Label>Opt-out form (/hello)</Label>
            <div className="rounded-card border border-mist bg-white p-6 sm:p-8">
              <OptOutForm phone={site.phone} phoneHref={phoneHref} />
            </div>
          </div>
        </div>
      </Section>

      <Section title="Ledgers">
        <div className="grid gap-8 lg:grid-cols-2">
          <SampleOffer id="house" />
          <SampleOffer id="condo" />
          <Ledger
            title="Itemized (when written offers itemize profit)"
            rows={[
              { label: "After-repair value", amount: 425_000 },
              { label: "Repairs", amount: -62_000 },
              { label: "Buying, holding and resale costs", amount: -37_100 },
              { label: "Profit", amount: -42_000, note: "Covers my fee, plus the renovating investor's profit if I assign the contract" },
            ]}
            total={{ label: "Offer", amount: 283_900 }}
          />
          <div>
            <Label>NetBars on light</Label>
            <NetBars
              bars={[
                { label: "Repair, then list", amount: 321_700, note: "Needs about $45,000 up front and five months" },
                { label: "List as-is", amount: 299_947 },
                { label: "Cash offer", amount: 262_400 },
              ]}
            />
          </div>
        </div>
      </Section>

      <Section title="Commitments, steps and answers" surface="frost">
        <div className="grid gap-12 lg:grid-cols-2">
          <div>
            <Label>Commitments (verified items only)</Label>
            <Commitments
              links={{
                explainsOfferMath: { href: "/how-it-works#how-i-calculate", label: "How I calculate an offer" },
                tellsWhenListingWins: { href: "/cash-offer-vs-realtor", label: "Cash sale or listing?" },
                assignmentDisclosedBeforeSigning: { href: "/about#how-i-buy", label: "How I buy" },
              }}
            />
          </div>
          <div className="space-y-10">
            <StraightAnswer question="Can I still sell my house if it's in foreclosure in Alberta?">
              Usually, yes. In Alberta you can generally sell until the court approves a sale or the lender takes title, and a sale can
              pay out the mortgage and stop the process. Timelines vary, so talk to a lawyer early and tell me where things stand.
            </StraightAnswer>
            <Faq items={faqs} />
          </div>
        </div>
        <div className="mt-14">
          <Label>Steps on frost</Label>
          <Steps
            surface="frost"
            steps={[
              { title: "Tell me about the place", text: "A two-minute form or one phone call." },
              { title: "I see it", text: "One visit at a time that suits you, or a video walkthrough." },
              { title: "You get a written offer", text: "Take your time, and show it to family, a lawyer or an agent." },
              { title: "You choose the closing date", text: "Lawyers on both sides handle the title and the paperwork." },
            ]}
          />
        </div>
      </Section>

      <Section title="Founder note">
        <div className="grid gap-12 lg:grid-cols-2">
          <FounderNote headingLevel={3} link={{ href: "/about", label: "More about me" }}>
            <p>When you call {site.name}, you get me: the person who looks at your home, runs the numbers and signs the offer.</p>
          </FounderNote>
          <FounderNote headingLevel={3} compact>
            <p>Compact, for the offer and thank-you pages.</p>
          </FounderNote>
        </div>
        <div className="mt-14">
          <Label>Steps on snow</Label>
          <Steps
            steps={[
              { title: "Tell me about the place", text: "The address, a few details and what's going on." },
              { title: "You get a written offer", text: "With the math laid out." },
              { title: "You choose the closing date", text: "Paid through your lawyer's trust account." },
            ]}
          />
        </div>
      </Section>

      <Section title="Preview tags" surface="frost">
        <p>
          A claim Kane hasn&apos;t confirmed yet, shown only in preview builds
          <Unconfirmed show />
        </p>
        <div className="mt-6">
          <DraftBanner draft />
        </div>
      </Section>

      <Section title="Brand">
        <div className="flex flex-wrap items-end gap-8">
          {(
            [
              [16, "size-4"],
              [24, "size-6"],
              [40, "size-10"],
              [64, "size-16"],
              [128, "size-32"],
            ] as const
          ).map(([px, size]) => (
            <figure key={px}>
              <Mark className={`block ${size}`} />
              <figcaption className="type-fine mt-2 text-ink-2">{px}px</figcaption>
            </figure>
          ))}
        </div>
        <div className="mt-10 grid gap-8 sm:grid-cols-2">
          <div>
            <Label>Full lockup</Label>
            <Logo />
          </div>
          <div>
            <Label>Compact lockup</Label>
            <Logo compact />
          </div>
          <div className="rounded-card bg-night p-6" data-surface="night">
            <Label night>On night</Label>
            <Logo tone="snow" />
          </div>
          <div>
            <Label>Icons</Label>
            <div className="flex items-end gap-6">
              {/* eslint-disable-next-line @next/next/no-img-element -- previews of the generated icon files themselves */}
              <img src="/icon.svg" alt="Favicon" width={32} height={32} />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/apple-icon" alt="Apple touch icon" width={90} height={90} className="rounded-field" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/brand/logo.png" alt="Logo for structured data" width={120} height={120} className="border border-mist" />
            </div>
          </div>
        </div>
      </Section>

      <section className="bg-snow pt-16">
        <div className="page-wrap">
          <h2 className="type-h2">The Aurora Roofline</h2>
          <p className="measure mt-3 text-ink-2">
            The home hero&apos;s bottom edge. The ribbon draws itself once on load, and appears fully drawn with reduced motion. Below
            640px the middle 60% shows instead of a shrunken drawing.
          </p>
        </div>
        <AuroraRoofline className="mt-10" />
      </section>

      <Section title="Footer crop" surface="frost">
        <RooflineCrop />
      </Section>

      <Section title="Chrome">
        <Label>Focus header (/get-cash-offer and /hello; the site header is at the top of this page)</Label>
        <div className="overflow-hidden rounded-card border border-mist">
          <FocusHeader />
        </div>
        <div className="mt-8 grid gap-8 lg:grid-cols-2">
          <div>
            <Label>Mobile menu</Label>
            <div className="rounded-card border border-mist bg-snow">
              <MobileMenuLinks phone={site.phone} phoneHref={phoneHref} />
            </div>
          </div>
          <div className="space-y-6">
            <div>
              <Label>Sticky actions</Label>
              <StickyActions phone={site.phone} phoneHref={phoneHref} offerHref={OFFER_PATH} demo />
            </div>
            <div>
              <Label>Sticky actions, focus layout</Label>
              <StickyActions phone={site.phone} phoneHref={phoneHref} offerHref={OFFER_PATH} focus demo />
            </div>
          </div>
        </div>
        <div className="mt-8">
          <Label>Focus footer (the site footer is at the bottom of this page)</Label>
          <div className="overflow-hidden rounded-card border border-mist">
            <FocusFooter />
          </div>
        </div>
      </Section>
    </div>
  );
}
