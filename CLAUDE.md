@AGENTS.md

# Wholesaling website

Lead-generation website for a real estate wholesaling / cash home buying business. Its two jobs: **rank in Google for motivated-seller searches** and **turn visitors into seller leads**. Next.js 16 (App Router, Turbopack), React 19, Tailwind CSS v4, TypeScript. Every page is statically pre-rendered; the only server code at runtime is the lead API.

SEO strategy, keyword map and launch checklist: `docs/seo-playbook.md`. Read it before any SEO or content work.

## Commands

```bash
npm run dev          # local dev server
npm run check        # lint + typecheck + unit/content tests; run before every commit
npm run build        # production build (warns while site.ts has placeholders)
npm start            # serve the build on :3000
npm run seo:audit    # crawl the running site's sitemap and check on-page SEO (BASE_URL=… to target another host)
```

## Where things live

| What | Where |
|---|---|
| Business details, promises, disclosure, testimonials, team | `src/config/site.ts` (single source of truth; copy everywhere reads from it) |
| Header/footer navigation | `src/config/nav.ts` |
| City landing pages (`/we-buy-houses/{slug}`) | `src/content/locations.ts` |
| Seller situation pages (`/situations/{slug}`) | `content/situations/*.md` |
| Blog guides (`/blog/{slug}`) | `content/blog/*.md` |
| Privacy policy, terms | `content/legal/*.md` |
| General FAQs, cash-vs-listing table | `src/content/faqs.ts`, `src/content/comparison.ts` |
| Metadata helper (title, description, canonical, OG) | `src/lib/seo.ts` → `pageMetadata()` |
| JSON-LD builders | `src/lib/schema.ts` |
| Sitemap / robots / llms.txt / OG images | `src/app/sitemap.ts`, `robots.ts`, `llms.txt/route.ts`, `**/opengraph-image.tsx` |
| Markdown loading + `{{placeholders}}` | `src/lib/content.ts` |
| Lead validation, spam filtering, delivery (webhook/Resend) | `src/lib/leads.ts`, `src/app/api/leads/route.ts` |
| Lead form (only significant client component) | `src/components/LeadForm.tsx` |
| Page sections (hero, FAQ, comparison, CTA…) | `src/components/sections.tsx` |

### Markdown frontmatter

Situations: `title` (≤ 65 chars), `description` (110–160), `h1`, `label`, `summary`, `icon` (a key of `SITUATION_ICONS` in `src/components/icons.tsx`), `reason` (one of `REASONS` in `src/lib/lead-options.ts`), `order`, `faqs: [{q, a}]`.
Blog: `title` (≤ 65), `description` (110–160), `date` (YYYY-MM-DD), optional `updated`, `author`, `category`, `draft: true`.
Bodies can use `{{company}} {{legalName}} {{market}} {{region}} {{state}} {{phone}} {{email}} {{siteUrl}} {{closeDays}} {{offerHours}} {{disclosure}}`. HTML comments are stripped (use them for author notes).

## Rules

- **Every page** exports metadata via `pageMetadata()` with a unique title and description, and renders exactly one `<h1>`. Titles: ≤ 65 chars; the brand suffix is dropped automatically when it wouldn't fit.
- **New indexable routes** go in `src/app/sitemap.ts` and in `staticRoutes` in `tests/content.test.ts`. Non-indexable pages use `noindex: true`.
- **Check the keyword map** in `docs/seo-playbook.md` before adding content; one primary keyword per page. Update the map when you add a page.
- **City pages need unique local copy** (`intro`, `localDetails`); tests reject duplicates. Never mass-generate near-identical city pages.
- **Never fabricate** testimonials, reviews, ratings, deal counts, years in business, awards, or statistics about the business. Only publish what the owner provides. `aggregateRating` schema is intentionally omitted.
- **Keep claims consistent with `site.promises`**: don't hardcode "7 days", "24 hours" or "we pay closing costs" in copy; use the config or `{{closeDays}}`/`{{offerHours}}`.
- **Legal/financial content is general information.** Hedge state-specific statements ("varies by state"), point to attorneys/HUD-approved counselors/tax pros, and don't state specific state law unless the owner has verified it.
- **Keep the wholesaling disclosure** (`site.disclosure`) visible in the footer, terms, FAQ and about page, and keep the SMS consent language in the form and privacy policy (needed for A2P 10DLC texting approval).
- Pages are server components. Don't add client-side JS for things CSS or `<details>` can do.
- Internal links in Markdown must point at real routes (tests check this).
- Before committing: `npm run check`, then `npm run build && npm start` and `npm run seo:audit`.
