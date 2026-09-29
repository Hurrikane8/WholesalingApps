# Aurora Home Buyers: website

The website for **Aurora Home Buyers**, Kane's direct home buying business in Edmonton, Alberta: *straight answers on selling your home*. One real person who buys houses, townhouses, duplexes and condos as-is, shows the math behind the offer, and says when listing would net more.

**What it does**

- **Brings in seller leads:** a two-step offer form on the home, offer, property type, situation and area pages, with call and text everywhere and a sticky Call / Text / Get my offer bar on phones. Leads go to Airtable (and a Google Sheets backup), with alerts to Kane by email, text or push.
- **Shows the math:** sample written offers as ledgers, a net proceeds calculator (repair and list vs. list as-is vs. a cash sale), and a neutral cost comparison.
- **Ranks for Greater Edmonton:** property type pages (condo townhouses first), ten seller situations, eight area pages and guides by Kane, with structured data, social cards, a sitemap and `/llms.txt`.
- **Tells the truth by construction:** every promise (closing speed, offer timing, legal fees) comes from one file and shows only once Kane confirms it. Tests and a build scan block banned sales phrases, unconfirmed promises and missing disclosures.
- **Handles letters and door hangers:** `/go/{code}` campaign links with QR codes, and a `/hello` page where people who got a letter can check Kane out, ask for an offer or opt out.
- **Grows the buyers list:** an investors page with CASL consent, kept out of the sellers' path.

Design system: `docs/brand.md`. Writing and adding content: `docs/content-playbook.md`. SEO: `docs/seo-playbook.md`. Integrations: `docs/integrations/README.md`. The brief behind all of it: `docs/aurora-v2-spec.md`.

---

## Quick start

Requires Node.js 22 or newer.

```bash
npm install
npm run dev
```

Open http://localhost:3000. In development, a lead with no destination configured is logged to the console instead of being sent.

---

## 1. Make it yours

| File | What to change |
|---|---|
| `src/config/site.ts` | **Start here.** Name, phone, email, hours, the founder (name, photo, bio, video), the `verified` flags for each promise, the property types you're buying, the disclosure, the booking link, social profiles, real testimonials. `npm run build` lists everything still to confirm. |
| `content/property-types/*.md` | One page per property type (condo townhouses is live; half duplexes is a draft). |
| `content/situations/*.md`, `content/blog/*.md` | Situation pages and guides. Plain Markdown. |
| `src/content/locations.ts` | The areas you buy in, each with its own local copy. |
| `content/legal/*.md` | Privacy policy and terms. **Have a lawyer review them.** |
| `src/config/campaigns.ts` | Letter and door-hanger short links (`/go/{code}`). |
| `public/images/`, `public/brand/logo.svg` | Photos of Kane, and your logo when it's finished. |

**Promises are flags, not copy.** Each promise has a flag in `site.verified`: flip it to `true` only once you'll always stand behind it. Until then it never appears on the live site; preview builds show it with an "Unconfirmed" tag so you can see how it would look. How to write around it: `docs/content-playbook.md`.

## 2. Connect the lead destinations and alerts

Step-by-step setup for each service is in **`docs/integrations/README.md`**. In short:

- **Airtable** (the CRM): seller leads go to **Seller Leads**, investor signups to **Buyers**, opt-outs to an optional table. Field mapping: `src/config/airtable.ts`. If Airtable rejects a field, the record is saved anyway with the rejected values in Notes.
- **Google Sheets backup** (free, recommended): a webhook that appends every lead to a sheet (`docs/integrations/google-sheets-backup.gs`).
- **Resend** (email): alerts to Kane, and a confirmation to sellers who gave an email.
- **Quo** (texts), **ntfy** (push): optional instant alerts.

A lead is delivered to every configured destination at once. If none of them takes it, the form tells the seller to call or text instead, so a lead is never silently lost. A production build for the real domain fails unless at least one durable destination and one alert are set (the launch guard).

## 3. Environment variables

Set these in your host's dashboard (and `.env.local` for development); `.env.example` explains each one. Never commit secrets.

| Variable | When needed | Purpose |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | Production | Canonical origin, e.g. `https://yourdomain.ca` |
| `SITE_ENV` | Hosts other than Vercel | `production`, `preview` or `development` (Vercel sets `VERCEL_ENV`) |
| `SITE_INDEXABLE` | Optional | `false` keeps a real domain out of search |
| `NEXT_PUBLIC_PREVIEW_UNCONFIRMED` | Preview builds | `true` shows gated items with tags; ignored in production |
| `AIRTABLE_TOKEN`, `AIRTABLE_BASE_ID` | One durable destination required | Seller Leads and Buyers tables |
| `AIRTABLE_OPTOUT_TABLE` | Optional | Opt-outs table |
| `LEAD_WEBHOOK_URL`, `LEAD_WEBHOOK_SECRET` | Recommended | Google Sheets backup (its URL includes `?secret=`) and any other webhooks, comma-separated |
| `RESEND_API_KEY`, `LEAD_EMAIL_TO`, `LEAD_EMAIL_FROM` | One owner alert required | Alert emails and seller confirmations |
| `SELLER_ACK_EMAIL` | Optional (default on) | Confirmation email to sellers who gave one |
| `QUO_API_KEY`, `QUO_FROM_NUMBER`, `QUO_NOTIFY_TO` | Once you have Quo | Texts to Kane; seller confirmation texts |
| `QUO_API_BASE` | Optional | Defaults to `https://api.quo.com` |
| `SELLER_ACK_SMS` | Optional (default off) | Text consenting sellers, 08:00–21:00 Edmonton time |
| `NTFY_TOPIC_URL`, `NTFY_TOKEN` | Optional | Push to Kane's phone, with no personal information |
| `NEXT_PUBLIC_GTM_ID` or `NEXT_PUBLIC_GA_ID` | Recommended | Analytics |
| `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION`, `NEXT_PUBLIC_BING_SITE_VERIFICATION` | Launch | Search Console and Bing Webmaster Tools |
| `NEXT_PUBLIC_CLARITY_ID` | Optional | Microsoft Clarity heatmaps |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY` | Optional | Cloudflare Turnstile bot check |

## 4. Deploy

The site runs on any host that runs Next.js (it uses no Vercel-only products). On Vercel:

1. Import the repository, keep the defaults, and deploy. Every branch gets a preview address; `main` is the live site.
2. Add the environment variables above, then redeploy.
3. When you have a domain, add it under **Settings → Domains**, set `NEXT_PUBLIC_SITE_URL`, and redeploy.

Nothing is indexed until the site is live on its real domain: on `*.vercel.app`, previews and localhost, robots.txt disallows everything and every page is noindex. Vercel's Hobby plan doesn't allow commercial use, so move to Pro before taking leads. On another host, set `SITE_ENV=production` for the live site.

To review unconfirmed promises and draft pages, deploy a preview with `NEXT_PUBLIC_PREVIEW_UNCONFIRMED=true` (or run `npm run build:preview` locally).

## 5. Get found on Google

Follow the launch checklist in **[`docs/seo-playbook.md`](docs/seo-playbook.md)**: phone number, domain, Google Business Profile, Search Console, listings, analytics, campaign QR codes and reviews.

---

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Local development server |
| `npm run build` / `npm start` | Production build (lists what's still to confirm) / serve it on :3000 |
| `npm run build:preview` | Preview build: unconfirmed claims and drafts show, tagged |
| `npm run check` | Lint, typecheck and tests (run before committing) |
| `npm test` | Unit and content tests: claims, net sheet, samples, leads, sinks, alerts, opt-outs, campaigns, metadata, content, links |
| `npm run scan:build` | After a build: fails on banned phrases, `example.com`, unconfirmed promises in production, or a page missing the disclosure |
| `npm run seo:audit` | Crawls the running site: titles, descriptions, canonicals, headings, structured data, social images, links. `BASE_URL=https://yourdomain.ca npm run seo:audit` audits production |
| `npm run a11y` | Axe (WCAG 2.1 AA) on every page at 390 and 1440 wide, plus text size and touch targets (needs `npm start`) |
| `npm run screenshots -- --label=name` | Full-page and above-the-fold screenshots of every page, and the page-length budgets (needs `npm start`) |
| `npm run qr` | QR codes (SVG) for the campaign links, once the domain is live |

Screenshots and a11y use Playwright's Chromium: run `npx playwright install chromium` once. GitHub Actions (`.github/workflows/ci.yml`) runs the checks, the build, the build scan, the SEO audit and the accessibility check on every pull request.

## Project structure

```
content/                 Markdown: property-types, situations, blog, legal
docs/                    brand.md, content-playbook.md, seo-playbook.md, integrations/, the v2 brief
scripts/                 screenshots, a11y, seo-audit, scan-build, qr
src/app/(site)/          Pages with the full header and footer
src/app/(focus)/         /get-cash-offer and /hello (focus layout)
src/app/api/             leads, buyers, opt-out
src/components/          brand/, chrome/, ui/, calculator/, forms, page sections
src/config/              site.ts, nav.ts, airtable.ts, campaigns.ts
src/content/             areas, FAQs, comparison, samples, consent wording
src/lib/                 claims, env, content, seo, schema, net sheet, leads, sinks, notify, analytics
tests/                   Vitest tests and the banned-phrase list
```

## A note on compliance

This site is built to help you market honestly, but it isn't legal advice. In Alberta, real estate trading is regulated by the Real Estate Council of Alberta (RECA): never advertise a specific property publicly, and never describe yourself as an agent or licensed. Commercial texts and emails are covered by CASL; personal information by Alberta's PIPA. Have an Alberta real estate lawyer review the disclosure, the privacy policy and terms, seller texts and emails, your purchase and assignment contracts, and the buyers-list process. Only publish reviews and testimonials from real sellers, with their permission.
