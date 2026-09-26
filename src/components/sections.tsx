import Link from "next/link";
import {
  ArrowRight,
  BadgeDollarSign,
  CalendarCheck,
  ChevronDown,
  CircleCheck,
  CircleX,
  ClipboardCheck,
  FileText,
  HandCoins,
  Handshake,
  MapPin,
  Phone,
  Quote,
  ShieldCheck,
  Star,
  Timer,
  Wrench,
} from "lucide-react";
import { phoneHref, site } from "@/config/site";
import { OFFER_PATH } from "@/config/nav";
import { comparisonRows } from "@/content/comparison";
import { locations } from "@/content/locations";
import type { Faq } from "@/content/faqs";
import type { Post, Situation } from "@/lib/content";
import type { Reason } from "@/lib/lead-options";
import { faqSchema, type Crumb } from "@/lib/schema";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { LeadForm } from "@/components/LeadForm";
import { situationIcon } from "@/components/icons";

const { promises } = site;

/* ─── Heroes ────────────────────────────────────────────────────────────── */

const DEFAULT_BULLETS = [
  "Sell as-is. No repairs, cleaning or showings",
  promises.coversLegalFees ? "No commissions or fees. We cover your legal fees" : "No commissions or agent fees",
  `Close in as little as ${promises.closeInDays} days, or on your schedule`,
  `Fair written offer within ${promises.offerWithinHours} hours, with no obligation`,
];

/** Page-top hero with the H1, benefits and the lead form. */
export function FormHero({
  eyebrow,
  title,
  subtitle,
  bullets = DEFAULT_BULLETS,
  breadcrumbs,
  reason,
  formTitle,
}: {
  eyebrow?: string;
  title: string;
  subtitle: string;
  bullets?: string[];
  breadcrumbs?: Crumb[];
  reason?: Reason;
  formTitle?: string;
}) {
  return (
    <section className="hero-bg text-white">
      <div className="container-page grid grid-cols-1 gap-8 py-10 sm:py-16 lg:grid-cols-[1.1fr_1fr] lg:gap-x-14 lg:gap-y-7 lg:py-20">
        {/* Phones: headline → form → benefits. Desktop: headline + benefits left, form right. */}
        <div className="lg:col-start-1 lg:row-start-1 lg:self-end">
          {breadcrumbs && (
            <div className="mb-6">
              <Breadcrumbs items={breadcrumbs} tone="dark" />
            </div>
          )}
          {eyebrow && <p className="text-sm font-semibold uppercase tracking-wider text-accent-300">{eyebrow}</p>}
          <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-balance sm:text-5xl lg:text-[3.4rem] lg:leading-[1.08]">
            {title}
          </h1>
          <p className="mt-5 max-w-xl text-lg text-brand-100 sm:text-xl">{subtitle}</p>
        </div>
        <div id="offer-form" className="lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:self-center">
          <LeadForm reason={reason} title={formTitle} />
        </div>
        <div className="lg:col-start-1 lg:row-start-2">
          <ul className="space-y-3">
            {bullets.map((b) => (
              <li key={b} className="flex items-start gap-3 text-base text-white sm:text-lg">
                <CircleCheck className="mt-0.5 size-6 shrink-0 text-accent-400" aria-hidden="true" />
                {b}
              </li>
            ))}
          </ul>
          <p className="mt-8 text-brand-100">
            Prefer to talk?{" "}
            <a href={`tel:${phoneHref}`} className="inline-flex items-center gap-1.5 font-semibold text-white underline-offset-4 hover:underline">
              <Phone className="size-4" aria-hidden="true" />
              Call or text {site.phone}
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}

/** Simpler page header for informational pages. */
export function PageHeader({
  eyebrow,
  title,
  subtitle,
  breadcrumbs,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  breadcrumbs: Crumb[];
}) {
  return (
    <section className="hero-bg text-white">
      <div className="container-page py-12 sm:py-16">
        <Breadcrumbs items={breadcrumbs} tone="dark" />
        {eyebrow && <p className="mt-6 text-sm font-semibold uppercase tracking-wider text-accent-300">{eyebrow}</p>}
        <h1 className={`${eyebrow ? "mt-3" : "mt-6"} max-w-4xl text-4xl font-extrabold tracking-tight text-balance sm:text-5xl`}>
          {title}
        </h1>
        {subtitle && <p className="mt-5 max-w-3xl text-lg text-brand-100 sm:text-xl">{subtitle}</p>}
      </div>
    </section>
  );
}

/* ─── Trust & benefits ──────────────────────────────────────────────────── */

export function ValueProps() {
  const items = [
    { icon: BadgeDollarSign, title: "No commissions or fees", text: promises.coversLegalFees ? "And we cover your legal fees" : "Keep more of your sale price" },
    { icon: Wrench, title: "No repairs or cleaning", text: "We buy houses in any condition" },
    { icon: Timer, title: `Close in ${promises.closeInDays} days`, text: "Or whenever you're ready" },
    { icon: ShieldCheck, title: "No obligation", text: "Free offer, zero pressure" },
  ];
  return (
    <section aria-label="Why sell to us" className="border-b border-slate-200 bg-white">
      <div className="container-page grid grid-cols-1 gap-4 py-8 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
        {items.map(({ icon: Icon, title, text }) => (
          <div key={title} className="flex items-start gap-3">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
              <Icon className="size-6" aria-hidden="true" />
            </span>
            <div>
              <p className="font-semibold text-slate-900">{title}</p>
              <p className="text-sm text-slate-600">{text}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export const STEPS = [
  {
    icon: ClipboardCheck,
    title: "Tell us about your house",
    text: "Fill out the short form or give us a call. It takes about a minute, and there's no cost or obligation.",
  },
  {
    icon: FileText,
    title: "Get a fair written offer",
    text: `We take a quick look at the property, in person or by video, and send a cash offer within ${promises.offerWithinHours} hours with our math explained.`,
  },
  {
    icon: CalendarCheck,
    title: "Close on your date",
    text: "Pick your closing date. Real estate lawyers handle the paperwork and the funds, and you get paid on closing day.",
  },
];

export function HowItWorks({ title = "Sell your house in 3 simple steps", intro, showLink = true }: { title?: string; intro?: string; showLink?: boolean }) {
  return (
    <section className="section bg-slate-50">
      <div className="container-page">
        <div className="max-w-2xl">
          <p className="eyebrow">How it works</p>
          <h2 className="section-title mt-2">{title}</h2>
          <p className="section-lead">
            {intro ?? "No listing, no showings, no waiting on a buyer's bank. Here's the whole process from first call to cash in hand."}
          </p>
        </div>
        <ol className="mt-12 grid gap-6 md:grid-cols-3">
          {STEPS.map(({ icon: Icon, title: stepTitle, text }, i) => (
            <li key={stepTitle} className="card relative">
              <span className="absolute right-6 top-6 text-5xl font-extrabold text-slate-100" aria-hidden="true">
                {i + 1}
              </span>
              <span className="flex size-12 items-center justify-center rounded-xl bg-accent-400 text-slate-900">
                <Icon className="size-6" aria-hidden="true" />
              </span>
              <h3 className="mt-5 text-xl font-bold text-slate-900">
                <span className="sr-only">Step {i + 1}: </span>
                {stepTitle}
              </h3>
              <p className="mt-2 text-slate-600">{text}</p>
            </li>
          ))}
        </ol>
        {showLink && (
          <Link href="/how-it-works" className="mt-8 inline-flex items-center gap-1.5 font-semibold text-brand-600 hover:text-brand-800">
            See the full process and how we calculate offers
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        )}
      </div>
    </section>
  );
}

export function Benefits({ place = site.market.region }: { place?: string }) {
  const items = [
    { icon: Wrench, title: "Sell as-is", text: "No repairs, cleaning or updates. We buy the house in the condition it's in today, even with major problems." },
    {
      icon: HandCoins,
      title: "No fees or commissions",
      text: promises.coversLegalFees
        ? "No agent commissions and no hidden fees. We also cover your standard legal fees."
        : "No agent commissions and no hidden fees, so you know exactly what you walk away with.",
    },
    { icon: CalendarCheck, title: "You pick the closing date", text: `Close in as little as ${promises.closeInDays} days, or take the time you need to pack and move.` },
    { icon: FileText, title: "Straightforward offers", text: "We show you how we reached our number and put it in writing. No pressure and no obligation." },
    { icon: Handshake, title: "Any situation", text: "Foreclosure, probate, divorce, tenants, liens, code violations or relocation. We've seen it before." },
    { icon: MapPin, title: "Local to you", text: `We buy houses in ${place}, so you work with people who know the neighbourhoods and answer the phone.` },
  ];
  return (
    <section className="section">
      <div className="container-page">
        <div className="max-w-2xl">
          <p className="eyebrow">Why sell to us</p>
          <h2 className="section-title mt-2">A simpler way to sell your house</h2>
          <p className="section-lead">
            Listing works well for some homes. But if your house needs work, time matters, or you just want certainty,
            a direct cash sale takes the hassle off your plate.
          </p>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map(({ icon: Icon, title, text }) => (
            <div key={title} className="card">
              <span className="flex size-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                <Icon className="size-6" aria-hidden="true" />
              </span>
              <h3 className="mt-4 text-lg font-bold text-slate-900">{title}</h3>
              <p className="mt-2 text-slate-600">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Comparison ────────────────────────────────────────────────────────── */

export function ComparisonTable({
  title = "Selling to us vs. listing with an agent",
  intro,
  showLink = true,
}: {
  title?: string;
  intro?: string;
  showLink?: boolean;
}) {
  return (
    <section className="section">
      <div className="container-page">
        <div className="max-w-2xl">
          <p className="eyebrow">Compare your options</p>
          <h2 className="section-title mt-2">{title}</h2>
          <p className="section-lead">
            {intro ??
              "Both paths can make sense. Here's an honest side-by-side so you can decide which fits your house and your timeline."}
          </p>
        </div>
        <div className="mt-10 overflow-x-auto rounded-2xl border border-slate-200 shadow-sm">
          <table className="w-full min-w-[640px] text-left text-sm sm:text-base">
            <thead>
              <tr className="bg-slate-50">
                <th scope="col" className="w-1/4 px-4 py-4 font-semibold text-slate-600 sm:px-6">
                  <span className="sr-only">Factor</span>
                </th>
                <th scope="col" className="bg-brand-800 px-4 py-4 font-bold text-white sm:px-6">
                  Selling to {site.name}
                </th>
                <th scope="col" className="px-4 py-4 font-bold text-slate-900 sm:px-6">
                  Listing with an agent
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {comparisonRows.map((row) => (
                <tr key={row.label}>
                  <th scope="row" className="px-4 py-4 font-semibold text-slate-900 sm:px-6">
                    {row.label}
                  </th>
                  <td className="bg-brand-50/60 px-4 py-4 sm:px-6">
                    <span className="flex items-start gap-2">
                      <CircleCheck className="mt-0.5 size-5 shrink-0 text-emerald-600" aria-hidden="true" />
                      {row.us}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-slate-600 sm:px-6">
                    <span className="flex items-start gap-2">
                      <CircleX className="mt-0.5 size-5 shrink-0 text-slate-400" aria-hidden="true" />
                      {row.listing}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {showLink && (
          <Link href="/cash-offer-vs-realtor" className="mt-8 inline-flex items-center gap-1.5 font-semibold text-brand-600 hover:text-brand-800">
            See a full net-proceeds example
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        )}
      </div>
    </section>
  );
}

/* ─── Situations & areas ────────────────────────────────────────────────── */

export function SituationsGrid({
  situations,
  title = "We buy houses in any situation",
  intro = "Whatever is behind your decision to sell, we've helped homeowners through it, and we'll treat yours with care and discretion.",
  place,
}: {
  situations: Situation[];
  title?: string;
  intro?: string;
  place?: string;
}) {
  return (
    <section className="section bg-slate-50">
      <div className="container-page">
        <div className="max-w-2xl">
          <p className="eyebrow">Situations we help with{place ? ` in ${place}` : ""}</p>
          <h2 className="section-title mt-2">{title}</h2>
          <p className="section-lead">{intro}</p>
        </div>
        <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {situations.map((s) => {
            const Icon = situationIcon(s.icon);
            return (
              <li key={s.slug}>
                <Link
                  href={`/situations/${s.slug}`}
                  className="group flex h-full gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-brand-300 hover:shadow-md"
                >
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 group-hover:bg-brand-600 group-hover:text-white">
                    <Icon className="size-6" aria-hidden="true" />
                  </span>
                  <span>
                    <span className="block font-bold text-slate-900 group-hover:text-brand-700">{s.label}</span>
                    <span className="mt-1 block text-sm text-slate-600">{s.summary}</span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

export function AreasGrid({
  title = `Areas we buy houses in ${site.market.region}`,
  intro = "Don't see your city? We likely still buy there. Send us your address and we'll let you know.",
  exclude,
}: {
  title?: string;
  intro?: string;
  exclude?: string;
}) {
  const list = locations.filter((l) => l.slug !== exclude);
  return (
    <section className="section">
      <div className="container-page">
        <div className="max-w-2xl">
          <p className="eyebrow">Service areas</p>
          <h2 className="section-title mt-2">{title}</h2>
          <p className="section-lead">{intro}</p>
        </div>
        <ul className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {list.map((l) => (
            <li key={l.slug}>
              <Link
                href={`/we-buy-houses/${l.slug}`}
                className="flex items-center gap-2.5 rounded-xl border border-slate-200 px-4 py-3 font-medium text-slate-800 hover:border-brand-300 hover:bg-brand-50"
              >
                <MapPin className="size-4 shrink-0 text-brand-500" aria-hidden="true" />
                {l.city}, {l.provinceAbbr}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ─── FAQ ───────────────────────────────────────────────────────────────── */

export function FaqSection({
  items,
  title = "Frequently asked questions",
  eyebrow = "FAQ",
  withSchema = true,
  moreLink = false,
}: {
  items: Faq[];
  title?: string;
  eyebrow?: string;
  /** Emit FAQPage structured data. Only one FAQPage block per page. */
  withSchema?: boolean;
  moreLink?: boolean;
}) {
  return (
    <section className="section">
      {withSchema && <JsonLd data={faqSchema(items)} />}
      <div className="container-page grid grid-cols-1 gap-10 lg:grid-cols-[1fr_2fr]">
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h2 className="section-title mt-2">{title}</h2>
          <p className="mt-4 text-slate-600">
            Have a question that isn&apos;t answered here? Call or text{" "}
            <a href={`tel:${phoneHref}`} className="font-semibold text-brand-600 hover:underline">
              {site.phone}
            </a>
            .
          </p>
          {moreLink && (
            <Link href="/faq" className="mt-4 inline-flex items-center gap-1.5 font-semibold text-brand-600 hover:text-brand-800">
              See all FAQs
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          )}
        </div>
        <div className="divide-y divide-slate-200 rounded-2xl border border-slate-200">
          {items.map((f) => (
            <details key={f.question} className="group px-5 py-1 sm:px-6">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-left font-semibold text-slate-900 [&::-webkit-details-marker]:hidden">
                <h3 className="text-base sm:text-lg">{f.question}</h3>
                <ChevronDown className="size-5 shrink-0 text-slate-500 transition group-open:rotate-180" aria-hidden="true" />
              </summary>
              <p className="pb-5 text-slate-600">{f.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Social proof ──────────────────────────────────────────────────────── */

/** Renders only when real testimonials are configured in site.testimonials. */
export function Testimonials() {
  if (site.testimonials.length === 0) return null;
  return (
    <section className="section bg-slate-50">
      <div className="container-page">
        <div className="max-w-2xl">
          <p className="eyebrow">Homeowner stories</p>
          <h2 className="section-title mt-2">What sellers say about working with us</h2>
        </div>
        <ul className="mt-10 grid gap-6 md:grid-cols-3">
          {site.testimonials.map((t) => (
            <li key={t.name + t.quote} className="card flex flex-col">
              <Quote className="size-8 text-accent-400" aria-hidden="true" />
              {t.rating && (
                <p className="mt-3 flex gap-0.5" aria-label={`${t.rating} out of 5 stars`}>
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star key={i} className={`size-4 ${i < t.rating! ? "fill-accent-400 text-accent-400" : "text-slate-300"}`} aria-hidden="true" />
                  ))}
                </p>
              )}
              <blockquote className="mt-3 flex-1 text-slate-700">&ldquo;{t.quote}&rdquo;</blockquote>
              <p className="mt-4 font-semibold text-slate-900">{t.name}</p>
              <p className="text-sm text-slate-500">{t.context}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ─── Content ───────────────────────────────────────────────────────────── */

export function PostCards({ posts, title = "Guides for homeowners", intro }: { posts: Post[]; title?: string; intro?: string }) {
  if (posts.length === 0) return null;
  return (
    <section className="section bg-slate-50">
      <div className="container-page">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-2xl">
            <p className="eyebrow">Seller guides</p>
            <h2 className="section-title mt-2">{title}</h2>
            {intro && <p className="section-lead">{intro}</p>}
          </div>
          <Link href="/blog" className="inline-flex items-center gap-1.5 font-semibold text-brand-600 hover:text-brand-800">
            All guides
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
        <ul className="mt-10 grid gap-6 md:grid-cols-3">
          {posts.map((p) => (
            <li key={p.slug}>
              <PostCard post={p} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function PostCard({ post }: { post: Post }) {
  return (
    <Link href={`/blog/${post.slug}`} className="card group flex h-full flex-col transition hover:border-brand-300 hover:shadow-md">
      <p className="text-xs font-semibold uppercase tracking-wider text-brand-600">{post.category}</p>
      <h3 className="mt-2 text-lg font-bold text-slate-900 group-hover:text-brand-700">{post.title}</h3>
      <p className="mt-2 flex-1 text-sm text-slate-600">{post.description}</p>
      <p className="mt-4 text-xs text-slate-500">{post.readingMinutes} min read</p>
    </Link>
  );
}

/* ─── Calls to action ───────────────────────────────────────────────────── */

export function CtaBand({
  title = "Ready to see what we'd pay for your house?",
  text = `Get a fair, no-obligation cash offer within ${promises.offerWithinHours} hours. No repairs, no fees, no pressure.`,
}: {
  title?: string;
  text?: string;
}) {
  return (
    <section className="hero-bg">
      <div className="container-page flex flex-col items-start justify-between gap-8 py-14 text-white lg:flex-row lg:items-center">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{title}</h2>
          <p className="mt-3 text-lg text-brand-100">{text}</p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-3">
          <Link href={OFFER_PATH} className="btn-primary text-lg">
            Get My Cash Offer
            <ArrowRight className="size-5" aria-hidden="true" />
          </Link>
          <a href={`tel:${phoneHref}`} className="btn-ghost-light text-lg">
            <Phone className="size-5" aria-hidden="true" />
            {site.phone}
          </a>
        </div>
      </div>
    </section>
  );
}

/** Sticky sidebar with the form, used beside long-form content. */
export function SidebarOffer({ reason }: { reason?: Reason }) {
  return (
    <aside className="lg:sticky lg:top-28">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg">
        <LeadForm variant="plain" reason={reason} title="Get a no-obligation offer" subtitle="Fair cash price. You pick the closing date." />
      </div>
      <p className="mt-4 text-center text-sm text-slate-600">
        Or call/text{" "}
        <a href={`tel:${phoneHref}`} className="font-semibold text-brand-600">
          {site.phone}
        </a>
      </p>
    </aside>
  );
}
