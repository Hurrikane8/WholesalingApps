@AGENTS.md

# Aurora Home Buyers website

Lead-generation website for **Aurora Home Buyers**: Kane's direct home buying business in **Edmonton, Alberta, Canada**. Positioning: Edmonton's straight-answer home buyer: one real person who buys houses, townhouses, duplexes and condos as-is, shows the math behind the offer, and says when listing would net more. Its jobs: **rank for motivated-seller searches in Greater Edmonton**, **turn visitors into seller leads**, and **grow the investor buyers list**. Next.js 16 (App Router, Turbopack), React 19, Tailwind CSS v4, TypeScript. Every page is statically pre-rendered; the only runtime server code is the three form APIs.

Read first, depending on the task:

- `docs/aurora-v2-spec.md`: the v2 brief (strategy, design system, pages, claims, SEO). Background for every decision here.
- `docs/content-playbook.md`: voice, banned phrases, the claims system, and how to add a property type, city, guide, situation or FAQ.
- `docs/brand.md`: colour tokens, type, logo, photo and motion rules.
- `docs/seo-playbook.md`: keyword map, internal-link rules, launch checklist. Read it before any SEO or content work.
- `docs/integrations/README.md`: Airtable, Sheets, Resend, Quo, ntfy, opt-outs.

## Commands

```bash
npm run dev            # local dev server
npm run check          # lint + typecheck + unit/content tests; run before every commit
npm run build          # production build (lists everything still TO CONFIRM)
npm run build:preview  # preview build: shows unconfirmed claims and drafts, tagged
npm run scan:build     # after a build: banned phrases, example.com, unconfirmed promises, the disclosure
npm start              # serve the build on :3000
npm run seo:audit      # crawl the running site and check on-page SEO (BASE_URL=… for another host)
npm run a11y           # axe (WCAG 2.1 AA), text under 14px, touch targets, at 390 and 1440 wide (needs npm start)
npm run screenshots -- --label=name [--only=/,/faq]   # full-page + fold PNGs and page-length budgets (needs npm start)
npm run qr             # QR codes for the campaign links in src/config/campaigns.ts
```

Screenshots and a11y use Playwright's Chromium (`npx playwright install chromium` once; or set `CHROMIUM_EXECUTABLE_PATH`).

## Where things live

| What | Where |
|---|---|
| Business details, founder, verified flags, property types, disclosure, hours | `src/config/site.ts` (single source of truth) |
| **Every promise** (closing, offer timing, legal fees, commitments, hero headline, sample rows) | `src/lib/claims.ts` |
| Environments and indexing (`deployEnv`, `showUnconfirmed`, `showDrafts`, `isIndexable`) | `src/lib/env.ts` |
| Navigation | `src/config/nav.ts` |
| Property type pages (`/what-we-buy/{slug}`) | `content/property-types/*.md` |
| Situation pages (`/situations/{slug}`) | `content/situations/*.md` |
| Guides (`/blog/{slug}`) | `content/blog/*.md` |
| Privacy policy, terms | `content/legal/*.md` |
| City pages (`/we-buy-houses/{slug}`) | `src/content/locations.ts` |
| FAQs (grouped), comparison table, sample offers | `src/content/faqs.ts`, `comparison.ts`, `samples.ts` |
| Net sheet math (calculator, home night section) | `src/lib/net-sheet.ts`; UI in `src/components/calculator/` |
| Markdown loading, `{{placeholders}}`, drafts | `src/lib/content.ts` |
| Metadata helper | `src/lib/seo.ts` → `pageMetadata()` |
| JSON-LD builders | `src/lib/schema.ts` |
| Sitemap, robots, llms.txt, social cards | `src/app/sitemap.ts`, `robots.ts`, `llms.txt/route.ts`, `src/lib/og.tsx` + `**/opengraph-image.tsx` |
| Page chrome (header, mobile menu, sticky actions, footer, focus layout) | `src/components/chrome/`; `(site)` and `(focus)` route groups |
| Design tokens and utilities | `src/app/globals.css`; brand hex values in `src/components/brand/colors.ts` |
| Brand (mark, logo, Aurora Roofline) | `src/components/brand/` |
| UI components (Button, Field, Ledger, SampleOffer, Commitments, Steps, FounderNote, StraightAnswer, NetBars, Faq) | `src/components/ui/` |
| Page sections (Section, PageIntro, FormHero, FinalCta, lists) | `src/components/sections.tsx` |
| Seller form, buyers form, opt-out form | `src/components/LeadForm*.tsx`, `BuyerForm.tsx`, `OptOutForm.tsx` |
| Lead, buyer and opt-out handlers | `src/lib/leads.ts`, `buyers.ts`, `optouts.ts`; routes in `src/app/api/` |
| Delivery (sinks: Airtable, webhooks, owner email) and alerts (Resend, Quo, ntfy) | `src/lib/sinks/`, `src/lib/notify/` |
| Airtable table and field names | `src/config/airtable.ts` |
| Form options (values = Airtable select choices) | `src/lib/lead-options.ts` |
| Campaign short links (`/go/{code}`) | `src/config/campaigns.ts` |
| Analytics (`trackEvent`, ClickTracker, attribution, optional Clarity and Turnstile) | `src/lib/analytics.ts`, `src/components/ClickTracker.tsx`, `src/lib/attribution.ts`, `src/components/Analytics.tsx`, `src/lib/turnstile.ts` |
| Banned phrases and patterns (shared by tests and the build scan) | `tests/banned-phrases.mjs` |

### Markdown frontmatter

- **Property types:** `title` (≤ 65), `description` (110–160), `h1`, `label`, `leadValue` (a `PROPERTY_TYPES` value), `summary`, `order`, `featured`, `question`, `answer` (40–60 words), `sample` (`house`/`condo`), `related` (situation slugs, 2+), `guides` (guide slugs), `faqs` (3+), `draft`.
- **Situations:** `title`, `description`, `h1`, `label`, `summary`, `reason` (one of `REASONS`), `order`, `question`, `answer` (40–60 words, never more than the body says), `guides` (1+), `faqs`.
- **Guides:** `title`, `description`, `date` (the first-commit date; never in the future), optional `updated`, `author` (defaults to Kane), `category` (sentence case), optional `question` + `answer`, `draft`.

Bodies can use `{{company}} {{legalName}} {{market}} {{region}} {{province}} {{phone}} {{email}} {{siteUrl}} {{disclosure}}` and the claim phrases `{{closingPhrase}} {{offerTimingPhrase}} {{legalFeesSentence}}`: write the sentence so it reads well with either version. `{{closeDays}}`/`{{offerHours}}` fail the build. HTML comments are stripped: use them for author notes and `<!-- VERIFY: … -->` in drafts.

## Rules

- **Every promise comes from `src/lib/claims.ts`** and renders only when its `site.verified` flag is true. Never hard-code "7 days", "24 hours", "legal fees covered", a reply time, a free clean-out or any speed, volume or experience claim. Preview builds tag unconfirmed claims; production never shows them, and `npm run scan:build` fails if one appears. Social cards and llms.txt use verified claims only.
- **Voice:** first person singular as Kane on everything a seller reads; "we" and the business name only in legal and disclosure text. Sentence case everywhere, Canadian spelling, no exclamation marks, no eyebrow labels, no arrows after link text. Explain; don't sell. The banned phrases and track-record patterns in `tests/banned-phrases.mjs` fail the tests and the build scan. Details: `docs/content-playbook.md`.
- **Never fabricate** testimonials, reviews, ratings, deal counts, years in business, awards or statistics. No statistic without a linked source. `aggregateRating` is intentionally omitted. No stock or AI photos of people.
- **Property types come from config:** `site.propertyTypes` (value, show, labels, note). A type gets a page by adding `content/property-types/{slug}.md`; lists, links, the sitemap and the form chips follow automatically.
- **Design tokens only.** Colours, type, radii and the one shadow are tokens in `globals.css` (`snow`, `frost`, `night`, `ink`, `pine`, `mist`, `line`…; `type-h1`, `type-h2`, `type-lead`…; `band`, `page-wrap`, `measure`). No one-off colours or gradient washes; aurora colours are decorative only. Sections alternate snow and frost, at most one night section per page, and every page ends on snow (the footer is frost). Text is 14px or larger; touch targets 44px. See `docs/brand.md`.
- **Host-portable only.** No Vercel KV, Blob, Edge Config, Web Analytics or Speed Insights. Environment detection goes through `src/lib/env.ts` (`VERCEL_ENV`, else `SITE_ENV`).
- **Every page** exports metadata via `pageMetadata()` with a unique title (≤ 65 characters, sentence case, the city on local pages) and description (110–160), and renders exactly one `<h1>`. Pages with their own `opengraph-image.tsx` pass `ownImage: true`.
- **New indexable routes** go in `src/app/sitemap.ts` and `staticRoutes` in `tests/content.test.ts`; non-indexable pages use `noindex: true` and, if private, the robots.txt disallow list. Drafts never enter the sitemap.
- **Internal links** (tested): property type pages link 2+ situations and a guide; situations link a guide and the hub; guides link a situation or type page and the calculator; published pages never link drafts; Markdown links must be real routes.
- **Check the keyword map** in `docs/seo-playbook.md` before adding content; one primary keyword per page; update the map when you add a page.
- **City pages need unique local copy** about the place and its housing, never Kane's volume there; tests reject duplicates. Set `region` only when a community is part of another municipality.
- **This is a Canadian (Alberta) business:** real estate lawyers, Land Titles, conditions and deposits in trust, grants of probate and personal representatives, the principal residence exemption and deemed disposition, Court of King's Bench, CASL. Never US-only concepts.
- **Legal and financial content is general information:** hedged, pointing to lawyers, accountants, licensed insolvency trustees and non-profit credit counsellors; no statutes, deadlines or dollar limits unless verified.
- **Keep the wholesaling disclosure** (`site.disclosure`) in every footer and on /terms, /faq, /about#how-i-buy and /how-it-works#what-youll-sign (the build scan checks). Keep the SMS consent wording in the seller form, the CASL consent on the buyers list, and both in the privacy policy. Name every enabled service provider in the privacy policy.
- **Airtable select values are exact.** Values in `src/lib/lead-options.ts` must match the Airtable choices character for character. Change labels freely; never change values unless Airtable changes too.
- **No personal information in analytics events or logs.** Events go through `trackEvent()`; the ClickTracker handles `tel:`, `sms:` and `data-track` clicks.
- **Page-length budgets:** home ≤ 7,600px at 390 wide and ≤ 5,600px at 1440; `/get-cash-offer` ≤ 5,000px at 390. Fix overruns by cutting, not by shrinking type. `npm run screenshots` reports them.
- Pages are server components. Make gating decisions on the server and pass plain values to client components. Don't add client-side JS for things CSS or `<details>` can do.
- **Before committing:** `npm run check`; then `npm run build && npm run scan:build`, `npm start`, `npm run seo:audit` and `npm run a11y`; after page changes, `npm run screenshots` and look at them at 390px.
