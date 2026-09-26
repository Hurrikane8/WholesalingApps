# Aurora Home Buyers: Website

A fast, SEO-focused website that brings in motivated home sellers, and investor buyers, for **Aurora Home Buyers**, a wholesaling / cash home buying business in Edmonton, Alberta.

**What's included**

- **Seller lead capture:** a two-step "Get My Cash Offer" form (address first, then contact details and optional property details) on every key page. Leads go straight into the **Seller Leads** table in your Airtable CRM, with Status "New", Source "Inbound (web / phone / FB)", and Next Follow-Up set to today so they show up in your morning follow-up view.
- **Investor buyers list:** an [`/investors`](src/app/investors/page.tsx) page where investors enter their buy box (strategy, property types, target areas, financing, price limits). Signups go into your **Buyers** table with a recorded CASL express consent.
- **Pages built to rank in Edmonton:** 8 area pages (Edmonton, St. Albert, Sherwood Park, Spruce Grove, Stony Plain, Leduc, Beaumont, Fort Saskatchewan), 11 seller-situation pages (including condo townhouses with high fees or special assessments), 7 seller guides written for Alberta, a cash-vs-realtor comparison with an Alberta commission-plus-GST example, How It Works, FAQ, About and Contact.
- **Technical SEO done for you:** unique titles, descriptions and canonical URLs on every page, a sitemap, robots.txt, structured data Google reads (LocalBusiness, Service, FAQ, Breadcrumbs, Article), social share images, `/llms.txt` for AI search, and static pages that load fast.
- **Conversion features:** a sticky call/text/offer bar on phones, a click-to-call number everywhere, a thank-you page for conversion tracking, and Google Tag Manager / GA4 support.
- **Compliance built in:** a wholesaling/assignment disclosure, SMS consent wording, CASL consent for the buyers list, and privacy/terms written for Alberta (PIPA) and Canada. Testimonials stay hidden until you add real ones.
- **Guard rails:** tests and an SEO audit script that catch broken links, duplicate titles, missing metadata and more.

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
| `src/config/site.ts` | **Start here.** Business name, phone (switch to your Quo number when it's ready), email, market, hours, the promises you make (closing speed, offer turnaround, legal fees), your disclosure text, the story behind the name, social profiles, and real testimonials and team bios when you have them. |
| `src/content/locations.ts` | The communities you buy in. Each needs its own local intro and details; don't copy-paste between them. |
| `src/config/airtable.ts` | Airtable table and field names. Update if you rename anything in your base. |
| `content/situations/*.md` | Seller situation pages. Edit freely; they're plain Markdown. |
| `content/blog/*.md` | Seller guides. Add a new `.md` file to publish a new article. |
| `content/legal/*.md` | Privacy policy and terms. **Have a lawyer review these.** |
| `src/app/globals.css` | Brand colours (`--color-brand-*` and `--color-accent-*`). |
| `src/app/icon.svg`, `LogoMark` in `src/components/icons.tsx` | Your logo / favicon. |
| `public/images/` | Team photos (referenced from `site.team`). |

Markdown content can use placeholders like `{{company}}`, `{{phone}}` and `{{closeDays}}`, which fill in from `site.ts` automatically.

## 2. Connect Airtable

1. Go to [airtable.com/create/tokens](https://airtable.com/create/tokens) and create a personal access token with the **`data.records:write`** scope and access to your **Wholesaling CRM** base.
2. Set `AIRTABLE_TOKEN` (the token) and `AIRTABLE_BASE_ID` (`appGQyG43cqRRWYd1`) in your host's environment variables.
3. In the **Buyers** table, add a **"Website"** option to the **Source** field so investor signups are tagged correctly.
4. Submit a test seller lead and a test investor signup on the live site, check they appear in Airtable, then delete them.

**How form answers map to your base**

| Seller form | Seller Leads field |
|---|---|
| Property address, name, phone, email | Property Address, Owner Name, Phone, Email |
| Property type, condition, timeline, occupancy | Property Type, Condition, Timeline, Occupancy (your existing options) |
| Situation page + "What's prompting the sale?" | Motivation |
| Text consent, page, ad campaign, lead ID | Notes |
| (automatic) | Status = New, Source = Inbound (web / phone / FB), Next Follow-Up = today |

| Investor form | Buyers field |
|---|---|
| Name (+ company), phone, email | Buyer Name, Phone, Email |
| Strategy, property types, target areas, financing | Strategy, Property Types, Target Areas, Financing Type |
| Max price, reno budget, condo fee, deals in last 12 months | Max Purchase Price, Max Reno Budget, Max Condo Fee, Deals Bought Last 12 Mo |
| Proof of funds checkbox | Proof of Funds = Claimed (otherwise Unknown) |
| Consent checkbox (required) | CASL Consent = Express, with the exact wording, time and page saved in Notes |
| (automatic) | Tier = Warm if they gave criteria (otherwise Cold), Source = Website, Next Follow-Up = today |

If Airtable ever rejects part of a record (a renamed field, a missing option), the site saves the record anyway with the rejected values moved into Notes, and logs a warning so you can fix the mapping. A lead is never lost.

**Other destinations (optional):** `LEAD_WEBHOOK_URL` sends every lead as JSON to Zapier, Make, Quo or anything else, and `RESEND_API_KEY` + `LEAD_EMAIL_TO` sends an email alert. All configured destinations are used. See `.env.example`.

## 3. Deploy

The easiest host is [Vercel](https://vercel.com) (free tier works):

1. Import this GitHub repository in Vercel.
2. Add your environment variables (from `.env.example`) under **Settings → Environment Variables**. Set `NEXT_PUBLIC_SITE_URL` to your real domain.
3. Add your domain under **Settings → Domains**, and redirect `www` to the bare domain or vice versa.
4. Submit test leads through the live site and confirm they reach Airtable.

Preview deployments are automatically hidden from search engines; only production is indexable.

## 4. Get found on Google

Follow the **launch checklist in [`docs/seo-playbook.md`](docs/seo-playbook.md)**: domain, Google Business Profile, Search Console, directory listings, reviews and analytics. It also has the keyword map, a monthly SEO routine, content ideas, and prompts for continuing the SEO work with Claude.

---

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Local development server |
| `npm run build` / `npm start` | Production build / serve it |
| `npm run check` | Lint + typecheck + tests (run before committing) |
| `npm test` | Unit and content tests (lead and buyer APIs, Airtable mapping, metadata lengths, duplicate content, broken links) |
| `npm run seo:audit` | Crawls the running site's sitemap and checks titles, descriptions, canonicals, headings, structured data, social images and links. `BASE_URL=https://yourdomain.ca npm run seo:audit` audits production. |

GitHub Actions (`.github/workflows/ci.yml`) runs all of these, including the SEO audit, on every push and pull request.

## Project structure

```
content/                 Markdown content: situations, blog, legal
docs/seo-playbook.md     SEO strategy, keyword map, launch checklist
scripts/seo-audit.mjs    On-page SEO crawler
src/app/                 Pages and routes (App Router)
  api/leads/             Seller lead endpoint → Airtable Seller Leads
  api/buyers/            Investor signup endpoint → Airtable Buyers
  investors/             Buyers list page
  we-buy-houses/[city]/  Area landing pages
  situations/[slug]/     Seller situation pages
  blog/[slug]/           Guides
src/components/          Header, footer, forms, page sections
src/config/              site.ts (business details), airtable.ts, nav.ts
src/content/             Areas, FAQs, comparison table, consent wording
src/lib/                 SEO, structured data, content loader, lead handling, Airtable client
tests/                   Vitest tests
```

## A note on compliance

This site is built to help you market honestly, but it isn't legal advice. In Alberta, real estate trading is regulated by the Real Estate Council of Alberta (RECA), and some wholesaling activities (particularly marketing properties you only have under contract) can raise licensing questions. Commercial texts and emails are covered by CASL. Have an Alberta real estate lawyer review your disclosure, contracts, buyers-list process and legal pages. Only publish reviews and testimonials from real sellers, with their permission.
