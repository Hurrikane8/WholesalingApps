import Link from "next/link";
import type { ReactNode } from "react";
import { ChevronDown, MessageSquare, Phone } from "lucide-react";
import { phoneHref, shownPropertyTypes, site } from "@/config/site";
import { OFFER_PATH } from "@/config/nav";
import { locations } from "@/content/locations";
import type { Faq as FaqItem } from "@/content/faqs";
import type { Post, Situation } from "@/lib/content";
import type { Reason } from "@/lib/lead-options";
import { isUnconfirmed, offerMathClause, offerTimingPhrase } from "@/lib/claims";
import type { Crumb } from "@/lib/schema";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { LeadForm } from "@/components/LeadForm";
import { Unconfirmed } from "@/components/preview";
import { ButtonLink } from "@/components/ui/Button";
import { Faq } from "@/components/ui/Faq";
import { TextLink } from "@/components/ui/TextLink";

/*
 * Page building blocks (spec 3.4): sections alternate snow and frost, with at
 * most one night section per page. Each section has one job. No icon cards,
 * no eyebrow labels, no shadows except the lead form card.
 */

export type Surface = "snow" | "frost" | "night";

const SURFACES: Record<Surface, string> = {
  snow: "bg-snow text-ink",
  frost: "bg-frost text-ink",
  night: "bg-night text-snow",
};

/** A full-width band with the standard padding (64px phones, 96px desktop) and the content width. */
export function Section({
  surface = "snow",
  id,
  labelledBy,
  tight = false,
  className = "",
  innerClassName = "",
  children,
}: {
  surface?: Surface;
  id?: string;
  labelledBy?: string;
  /** 48px / 64px padding instead of 64px / 96px: the home page only, to stay inside its length budget. */
  tight?: boolean;
  className?: string;
  innerClassName?: string;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      aria-labelledby={labelledBy}
      data-surface={surface === "night" ? "night" : undefined}
      className={`${tight ? "band-tight" : "band"} ${SURFACES[surface]} ${className}`}
    >
      <div className={`page-wrap ${innerClassName}`}>{children}</div>
    </section>
  );
}

/** An H2 with an optional intro paragraph. */
export function SectionHeading({ id, title, intro, className = "" }: { id?: string; title: ReactNode; intro?: ReactNode; className?: string }) {
  return (
    <div className={className}>
      <h2 id={id} className="type-h2">
        {title}
      </h2>
      {intro && <div className="type-lead measure mt-4 text-ink-2">{intro}</div>}
    </div>
  );
}

/** "Call (780) 836-5156" and "Text me" as text links, with the phone and message glyphs. */
export function CallTextLinks({ tone = "ink", className = "" }: { tone?: "ink" | "night"; className?: string }) {
  const glyph = tone === "night" ? "text-night-ink-2" : "text-ink-2";
  return (
    <p className={`flex flex-wrap gap-x-6 gap-y-1 ${className}`}>
      <TextLink href={`tel:${phoneHref}`} tone={tone} className="inline-flex min-h-11 items-center gap-2 font-semibold">
        <Phone className={`size-5 ${glyph}`} aria-hidden="true" />
        <span>
          Call <span className="nums">{site.phone}</span>
        </span>
      </TextLink>
      <TextLink href={`sms:${phoneHref}`} tone={tone} className="inline-flex min-h-11 items-center gap-2 font-semibold">
        <MessageSquare className={`size-5 ${glyph}`} aria-hidden="true" />
        Text me
      </TextLink>
    </p>
  );
}

/* ─── Page tops ─────────────────────────────────────────────────────────── */

/** The top of an informational page: breadcrumbs, the H1 and a lead paragraph. */
export function PageIntro({
  title,
  lead,
  breadcrumbs,
  children,
  surface = "snow",
}: {
  title: ReactNode;
  lead?: ReactNode;
  breadcrumbs?: Crumb[];
  children?: ReactNode;
  surface?: Exclude<Surface, "night">;
}) {
  return (
    <div className={SURFACES[surface]}>
      <div className="page-wrap pt-6 pb-12 lg:pt-10 lg:pb-16">
        {breadcrumbs && <Breadcrumbs items={breadcrumbs} />}
        <h1 className={`type-h1 max-w-[22ch] ${breadcrumbs ? "mt-4" : ""}`}>{title}</h1>
        {lead && <div className="type-lead measure mt-5 text-ink-2">{lead}</div>}
        {children}
      </div>
    </div>
  );
}

/**
 * A page top with the lead form: the H1 and lead on the left (7 of 12
 * columns), the form card on the right. Phones: H1, lead, form, then the
 * call and text links.
 */
export function FormHero({
  title,
  lead,
  breadcrumbs,
  reason,
  propertyType,
  formTitle,
  formSubtitle,
  children,
}: {
  title: ReactNode;
  lead: ReactNode;
  breadcrumbs?: Crumb[];
  reason?: Reason;
  propertyType?: string;
  formTitle?: string;
  formSubtitle?: string;
  /** Extra copy under the call and text links. */
  children?: ReactNode;
}) {
  return (
    <div className="bg-snow text-ink">
      <div className="page-wrap grid gap-y-8 pt-6 pb-16 lg:grid-cols-12 lg:gap-x-12 lg:pt-10 lg:pb-24">
        <div className="lg:col-span-7 lg:row-start-1">
          {breadcrumbs && <Breadcrumbs items={breadcrumbs} />}
          <h1 className={`type-h1 ${breadcrumbs ? "mt-4" : ""}`}>{title}</h1>
          <div className="type-lead measure mt-5 text-ink-2">{lead}</div>
        </div>
        <div className="lg:col-span-5 lg:col-start-8 lg:row-span-2 lg:row-start-1 lg:self-start">
          <LeadForm reason={reason} propertyType={propertyType} title={formTitle} subtitle={formSubtitle} />
        </div>
        <div className="lg:col-span-7 lg:row-start-2">
          <CallTextLinks />
          {children}
        </div>
      </div>
    </div>
  );
}

/* ─── Calls to action ───────────────────────────────────────────────────── */

/** The default line under a final call to action. Every promise comes from claims. */
function offerLine(): ReactNode {
  return (
    <>
      Tell me about your home and I&apos;ll send a written offer {offerTimingPhrase()}
      {offerMathClause()}. No obligation.
      <Unconfirmed show={isUnconfirmed("offerWithinHours")} />
    </>
  );
}

/**
 * The last section of a page (spec 5.3 §9): a heading, one short paragraph
 * and the call and text links on the left; the lead form on the right.
 */
export function FinalCta({
  title = "Get a straight answer on your place.",
  text,
  formId = "offer-bottom",
  reason,
  propertyType,
  surface = "snow",
  tight = false,
}: {
  title?: ReactNode;
  text?: ReactNode;
  /** "offer" when this is the page's only form. */
  formId?: "offer" | "offer-bottom";
  reason?: Reason;
  propertyType?: string;
  surface?: Exclude<Surface, "night">;
  tight?: boolean;
}) {
  const headingId = `${formId}-heading`;
  return (
    <Section surface={surface} tight={tight} labelledBy={headingId} innerClassName="grid gap-y-6 lg:grid-cols-12 lg:gap-x-12 lg:gap-y-8">
      <div className="lg:col-span-6">
        <h2 id={headingId} className="type-h2">
          {title}
        </h2>
        <p className="measure mt-4 text-ink-2">{text ?? offerLine()}</p>
        <CallTextLinks className="mt-4" />
      </div>
      <div className="lg:col-span-5 lg:col-start-8">
        <LeadForm id={formId} reason={reason} propertyType={propertyType} />
      </div>
    </Section>
  );
}

/** A call to action without a form, for pages that already have one or are long reads. */
export function CtaBand({ title = "Want to see what I'd pay for your place?", text, surface = "snow" }: { title?: ReactNode; text?: ReactNode; surface?: Exclude<Surface, "night"> }) {
  return (
    <Section surface={surface} labelledBy="cta-heading">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between lg:gap-12">
        <div>
          <h2 id="cta-heading" className="type-h2">
            {title}
          </h2>
          <p className="measure mt-4 text-ink-2">{text ?? offerLine()}</p>
        </div>
        <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center sm:gap-6">
          <ButtonLink href={OFFER_PATH}>Get my offer</ButtonLink>
          <CallTextLinks />
        </div>
      </div>
    </Section>
  );
}

/** The form beside long-form content (guides). */
export function SidebarOffer({ reason }: { reason?: Reason }) {
  return (
    <aside aria-label="Get an offer" className="lg:sticky lg:top-24">
      <LeadForm reason={reason} title="What would you get for your place?" />
      <p className="type-small mt-4 text-ink-2">
        Or call or text{" "}
        <TextLink href={`tel:${phoneHref}`} className="nums font-semibold">
          {site.phone}
        </TextLink>
        .
      </p>
    </aside>
  );
}

/* ─── Questions ─────────────────────────────────────────────────────────── */

/** An FAQ section: the heading and a way to ask on the left, the questions on the right. */
export function FaqSection({
  items,
  title = "Questions sellers ask",
  withSchema = false,
  moreLink = false,
  surface = "frost",
  id,
  askLine = true,
  tight = false,
}: {
  items: FaqItem[];
  title?: string;
  /** "Something else on your mind? Call or text …" under the heading. */
  askLine?: boolean;
  tight?: boolean;
  /** Emit FAQPage structured data. Only /faq does (spec 7.3). */
  withSchema?: boolean;
  moreLink?: boolean;
  surface?: Exclude<Surface, "night">;
  id?: string;
}) {
  const headingId = `${id ?? "faq"}-heading`;
  return (
    <Section surface={surface} id={id} tight={tight} labelledBy={headingId} innerClassName="grid gap-y-8 lg:grid-cols-12 lg:gap-x-12">
      <div className="max-lg:flex max-lg:flex-wrap max-lg:items-baseline max-lg:justify-between max-lg:gap-x-6 lg:col-span-4">
        <h2 id={headingId} className="type-h2">
          {title}
        </h2>
        {askLine && (
          <p className="mt-4 text-ink-2">
            Something else on your mind? Call or text{" "}
            <TextLink href={`tel:${phoneHref}`} className="nums font-semibold">
              {site.phone}
            </TextLink>
            .
          </p>
        )}
        {moreLink && (
          <p className={askLine ? "mt-2" : "lg:mt-3"}>
            <TextLink href="/faq" className="inline-flex min-h-11 items-center">
              All questions
            </TextLink>
          </p>
        )}
      </div>
      <Faq items={items} withSchema={withSchema} className="lg:col-span-8" />
    </Section>
  );
}

/* ─── Lists ─────────────────────────────────────────────────────────────── */

/**
 * A heading and a list: collapsed behind the heading on phones (details and
 * summary, no JavaScript), open as usual from 640px. The content renders
 * twice, once per layout; only one is ever displayed.
 */
export function PhoneCollapsible({ title, headingLevel = 3, children }: { title: ReactNode; headingLevel?: 2 | 3; children: ReactNode }) {
  const Heading = `h${headingLevel}` as "h2" | "h3";
  return (
    <>
      <details className="group border-b border-mist sm:hidden">
        <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-2 [&::-webkit-details-marker]:hidden">
          <Heading className="type-h3">{title}</Heading>
          <ChevronDown className="size-5 shrink-0 text-ink-2 transition-transform duration-150 group-open:rotate-180" aria-hidden="true" />
        </summary>
        <div className="pb-4">{children}</div>
      </details>
      <div className="max-sm:hidden">
        <Heading className="type-h3">{title}</Heading>
        <div className="mt-3">{children}</div>
      </div>
    </>
  );
}

/** Situations as a clean two-column list: the label as a link, the summary underneath. */
export function SituationList({ situations, headingLevel = 3 }: { situations: Situation[]; headingLevel?: 2 | 3 }) {
  const Heading = `h${headingLevel}` as "h2" | "h3";
  return (
    <ul className="grid gap-x-12 sm:grid-cols-2">
      {situations.map((s) => (
        <li key={s.slug} className="border-t border-mist py-5">
          <Heading className="font-display text-[1.1875rem] leading-snug font-bold">
            <TextLink href={`/situations/${s.slug}`}>{s.label}</TextLink>
          </Heading>
          <p className="type-small mt-1 text-ink-2">{s.summary}</p>
        </li>
      ))}
    </ul>
  );
}

/** Situation labels only: wrapped onto shared lines on phones, one per line in columns from 640px. Every link is a 44px target. */
export function SituationLinks({ situations }: { situations: Situation[] }) {
  return (
    <ul className="flex flex-wrap gap-x-5 sm:grid sm:grid-cols-2 sm:gap-x-8">
      {situations.map((s) => (
        <li key={s.slug}>
          <TextLink href={`/situations/${s.slug}`} className="inline-flex min-h-11 items-center">
            {s.label}
          </TextLink>
        </li>
      ))}
    </ul>
  );
}

/** Guides as a list: the title as a link and one line underneath. */
export function PostList({ posts, headingLevel = 3, compactOnPhones = false }: { posts: Post[]; headingLevel?: 2 | 3 | 4; compactOnPhones?: boolean }) {
  const Heading = `h${headingLevel}` as "h2" | "h3" | "h4";
  return (
    <ul>
      {posts.map((p) => (
        <li key={p.slug} className={`border-t border-mist first:border-t-0 first:pt-0 ${compactOnPhones ? "py-2 sm:py-4" : "py-4"}`}>
          <Heading className="font-display text-[1.1875rem] leading-snug font-bold">
            <TextLink href={`/blog/${p.slug}`}>{p.title}</TextLink>
            {p.draft && (
              <span className="tag-unconfirmed" data-draft="">
                Draft
              </span>
            )}
          </Heading>
          <p className={`type-small mt-1 text-ink-2 ${compactOnPhones ? "max-sm:hidden" : ""}`}>{p.description}</p>
        </li>
      ))}
    </ul>
  );
}

/** The property types shown on the site: the name and the note underneath, in two columns. No cards. */
export function PropertyTypeList({
  headingLevel = 3,
  compact = false,
  compactOnPhones = false,
}: {
  headingLevel?: 2 | 3;
  /** Names only, as a bulleted list. */
  compact?: boolean;
  /** Names in two columns on phones; the notes appear from 640px. */
  compactOnPhones?: boolean;
}) {
  const Heading = `h${headingLevel}` as "h2" | "h3";
  if (compact) {
    return (
      <ul className="grid list-disc gap-x-12 gap-y-2 pl-5 marker:text-line sm:grid-cols-2 lg:grid-cols-3">
        {shownPropertyTypes().map((t) => (
          <li key={t.value}>{t.plural}</li>
        ))}
      </ul>
    );
  }
  return (
    <ul className={`grid sm:grid-cols-2 sm:gap-x-12 lg:grid-cols-3 ${compactOnPhones ? "grid-cols-2 gap-x-6" : ""}`}>
      {shownPropertyTypes().map((t) => (
        <li key={t.value} className={`border-t border-mist ${compactOnPhones ? "py-2 sm:py-4" : "py-4"}`}>
          <Heading className="font-display text-[1.1875rem] leading-snug font-bold">{t.plural}</Heading>
          <p className={`type-small mt-1 text-ink-2 ${compactOnPhones ? "max-sm:hidden" : ""}`}>{t.note}</p>
        </li>
      ))}
    </ul>
  );
}

/** "I buy across Edmonton, St. Albert, …", each area linked to its page. */
export function AreaSentence({ exclude, lead = "I buy across", className = "" }: { exclude?: string; lead?: string; className?: string }) {
  const list = locations.filter((l) => l.slug !== exclude);
  return (
    <p className={`measure text-ink-2 ${className}`}>
      {lead}{" "}
      {list.map((l, i) => (
        <span key={l.slug}>
          <TextLink href={`/we-buy-houses/${l.slug}`}>{l.city}</TextLink>
          {i < list.length - 2 ? ", " : i === list.length - 2 ? " and " : "."}
        </span>
      ))}
    </p>
  );
}

/** Areas as a list of links, for hubs and "nearby areas". */
export function AreaList({ exclude, only }: { exclude?: string; only?: string[] }) {
  const list = locations.filter((l) => l.slug !== exclude && (!only || only.includes(l.slug)));
  return (
    <ul className="grid gap-x-8 sm:grid-cols-2 lg:grid-cols-4">
      {list.map((l) => (
        <li key={l.slug} className="border-t border-mist">
          <Link href={`/we-buy-houses/${l.slug}`} className="link flex min-h-12 items-center">
            {l.city}
          </Link>
        </li>
      ))}
    </ul>
  );
}

/* ─── Reviews ───────────────────────────────────────────────────────────── */

/** Renders only when real, permissioned reviews are configured in site.testimonials. */
export function Testimonials({ surface = "snow" }: { surface?: Exclude<Surface, "night"> }) {
  if (site.testimonials.length === 0) return null;
  return (
    <Section surface={surface} labelledBy="reviews-heading">
      <h2 id="reviews-heading" className="type-h2">
        What sellers say
      </h2>
      <ul className="mt-8 grid gap-x-12 gap-y-8 md:grid-cols-2">
        {site.testimonials.map((t) => (
          <li key={t.name + t.quote} className="border-l-4 border-mist pl-5">
            <blockquote className="measure text-ink">&ldquo;{t.quote}&rdquo;</blockquote>
            <p className="type-small mt-3 font-semibold text-ink">{t.name}</p>
            <p className="type-fine text-ink-2">{t.context}</p>
          </li>
        ))}
      </ul>
    </Section>
  );
}
