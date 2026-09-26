# Wholesaling Website

A fast, SEO-focused website that brings in motivated home sellers for a real estate wholesaling / cash home buying business.

**What's included**

- **Lead capture that works:** a two-step "Get My Cash Offer" form (address first, then contact details) on every key page, with spam protection and ad-campaign (UTM) tracking. It sends each lead to your CRM, Zapier or email.
- **Pages built to rank:** 11 city landing pages ("We buy houses in {city}"), 10 seller-situation pages (foreclosure, inherited, divorce, tired landlord, repairs, back taxes, vacant, fire damage, relocation, downsizing), 7 in-depth seller guides, a cash-vs-realtor comparison with a net-proceeds example, How It Works, FAQ, About and Contact.
- **Technical SEO done for you:** unique titles, descriptions and canonical URLs on every page, a sitemap, robots.txt, structured data Google reads (LocalBusiness, Service, FAQ, Breadcrumbs, Article), social share images, `/llms.txt` for AI search, and static pages that load fast.
- **Conversion features:** a sticky call/text/offer bar on phones, a click-to-call number everywhere, a thank-you page for conversion tracking, and Google Tag Manager / GA4 support.
- **Compliance built in:** a wholesaling disclosure, SMS consent language written for texting-platform (A2P 10DLC) approval, and privacy/terms templates. Testimonials stay hidden until you add real ones.
- **Guard rails:** tests and an SEO audit script that catch broken links, duplicate titles, missing metadata and more.

> The site ships with **example content for Metro Atlanta** and a placeholder business ("Acme Home Buyers", 555 phone number). Replace these before launch (step 1). `npm run build` warns you until you do.

---

## Quick start

Requires Node.js 20.9 or newer.

```bash
npm install
npm run dev
```

Open http://localhost:3000.

---

## 1. Make it yours

| File | What to change |
|---|---|
| `src/config/site.ts` | **Start here.** Business name, phone, email, market, hours, the promises you make (closing speed, offer turnaround, closing costs), your disclosure text, social profiles, and (when you have them) real testimonials and team bios. |
| `src/content/locations.ts` | The cities you buy in. Each needs its own local intro and details; don't copy-paste between cities. |
| `content/situations/*.md` | Seller situation pages. Edit freely; they're plain Markdown. |
| `content/blog/*.md` | Seller guides. Add a new `.md` file to publish a new article. |
| `content/legal/*.md` | Privacy policy and terms. **Have your attorney review these** for your state. |
| `src/app/globals.css` | Brand colors (`--color-brand-*` and `--color-accent-*`). |
| `src/app/icon.svg`, `LogoMark` in `src/components/icons.tsx` | Your logo / favicon. |
| `public/images/` | Team photos (referenced from `site.team`). |

Markdown content can use placeholders like `{{company}}`, `{{phone}}` and `{{closeDays}}`, which fill in from `site.ts` automatically.

## 2. Connect your leads

Leads are sent wherever you point them via environment variables (see `.env.example`). Set up at least one:

- **Webhook** (`LEAD_WEBHOOK_URL`): works with **Zapier/Make** (use a "Catch Hook" trigger, then route leads to your CRM, a Google Sheet, Slack or an SMS alert), **GoHighLevel** inbound webhooks, **REsimpli**, **Podio** (via Zapier), and similar tools. Each lead arrives as JSON with the address, name, phone, email, condition, timeline, situation, SMS consent, landing page and UTM data. Separate multiple URLs with commas.
- **Email** (`RESEND_API_KEY` + `LEAD_EMAIL_TO`): sign up at [resend.com](https://resend.com), verify your domain, and set `LEAD_EMAIL_FROM` to an address on it.

If nothing is configured, or every destination fails, the lead is written to your hosting logs so it's never lost, and the visitor is shown your phone number.

## 3. Deploy

The easiest host is [Vercel](https://vercel.com) (free tier works):

1. Push this repository to GitHub and import it in Vercel.
2. Add your environment variables (from `.env.example`) under **Settings → Environment Variables**. Set `NEXT_PUBLIC_SITE_URL` to your real domain.
3. Add your domain under **Settings → Domains**, and redirect `www` to the bare domain or vice versa.
4. Submit a test lead through the live site and confirm it reaches your CRM or inbox.

Preview deployments are automatically hidden from search engines; only production is indexable.

## 4. Get found on Google

Follow the **launch checklist in [`docs/seo-playbook.md`](docs/seo-playbook.md)**: Search Console, your sitemap, Google Business Profile, citations, reviews, and analytics conversions. It also has the keyword map, a monthly SEO routine, content ideas, and prompts for continuing the SEO work with Claude.

---

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Local development server |
| `npm run build` / `npm start` | Production build / serve it |
| `npm run check` | Lint + typecheck + tests (run before committing) |
| `npm test` | Unit and content tests (lead API, metadata lengths, duplicate content, broken links) |
| `npm run seo:audit` | Crawls the running site's sitemap and checks titles, descriptions, canonicals, headings, structured data, social images and links. `BASE_URL=https://yourdomain.com npm run seo:audit` audits production. |

GitHub Actions (`.github/workflows/ci.yml`) runs all of these, including the SEO audit, on every push and pull request.

## Project structure

```
content/                 Markdown content: situations, blog, legal
docs/seo-playbook.md     SEO strategy, keyword map, launch checklist
scripts/seo-audit.mjs    On-page SEO crawler
src/app/                 Pages and routes (App Router)
  api/leads/             Lead intake endpoint
  we-buy-houses/[city]/  City landing pages
  situations/[slug]/     Seller situation pages
  blog/[slug]/           Guides
  sitemap.ts, robots.ts, llms.txt/, opengraph-image.tsx
src/components/          Header, footer, lead form, page sections
src/config/              site.ts (business details), nav.ts
src/content/             Cities, FAQs, comparison table
src/lib/                 SEO helpers, structured data, content loader, lead handling
tests/                   Vitest tests
```

## A note on compliance

This template is built to help you market honestly, but it isn't legal advice. Wholesaling, disclosure and licensing rules vary by state and change often, and texting leads is governed by the TCPA and carrier rules. Have a local real estate attorney review your disclosure, contracts and legal pages. Only publish reviews and testimonials from real sellers, with their permission.
