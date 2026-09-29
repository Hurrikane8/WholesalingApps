# Aurora Home Buyers website v2: build brief for Claude Code

> **Kane, how to use this:** open Claude Code at the root of your `WholesalingApps` repo and paste this whole document. Or save it as `docs/aurora-v2-spec.md`, commit it, and tell Claude Code: "Read docs/aurora-v2-spec.md and carry it out, phase by phase."

This is the complete brief for rebuilding the Aurora Home Buyers website in this repository. It is addressed to you, Claude Code. Read all of it before you change anything.

---

## 0. How to run this job

**What you're doing.** Keep the engineering foundation: Next.js 16 App Router, Tailwind CSS v4, TypeScript, the Markdown content pipeline, the seller and buyer APIs, the Airtable mapping, the tests, CI and the SEO tooling. Replace the customer-facing layer: brand, design system, navigation, page layouts and most of the copy. Add a speed-to-lead system, support for Kane's letter and door-hanger campaigns, and an honest net-proceeds calculator.

Make property types a first-class, extensible part of the site. Kane buys mostly condo townhouses today because that's what his investor buyers want, and he plans to buy many more property types soon. Nothing in the brand, layout or navigation may be townhouse-only. Adding a property type later must take one Markdown file and one config line, not a redesign.

**Operating rules**

1. If this document isn't already in the repo, save it verbatim as `docs/aurora-v2-spec.md` and commit it before any other change. Re-read the relevant section before each phase rather than working from memory. Where this document conflicts with `CLAUDE.md`, this document wins; bring `CLAUDE.md` in line in Phase 9.
2. Read `CLAUDE.md`, `AGENTS.md` and `docs/seo-playbook.md`. This Next.js version has breaking changes: before you use any Next.js API (fonts, metadata, images, route handlers, `after`, `next/og`, redirects, scripts), read the matching guide in `node_modules/next/dist/docs/`.
3. Create a branch named `aurora-v2` from `main`. If PR #2 (the change that makes share links fall back to the Vercel address) is still open, leave it alone; Section 7.1 replaces it and Kane will close it. Work through the phases in Section 12 in order. At the end of each phase, run `npm run check` and `npm run build`, fix every failure, and commit with a message that starts `v2 phase N:`. Never start a phase on a red build.
4. Look at what you build. Phase 0 creates the screenshot script (Section 11) and captures a `before` set. After every phase that changes pages, capture 390×844 and 1440×900 screenshots and critique them against Section 3 before moving on. If something reads like a template, change it.
5. Never invent facts about the business. Anything marked **TO CONFIRM** must not render in a production build until Kane supplies it (Section 2.5). Never use stock photos of people or AI-generated images of people.
6. Never change the `value` strings in `src/lib/lead-options.ts`; they must match the Airtable base character for character. Labels may change.
7. Keep the site host-portable. Kane is on Vercel today and may move. Don't use Vercel-only products (KV, Blob, Edge Config, Vercel Web Analytics, Speed Insights). Anything host-specific reads from environment variables (Section 10) with a sensible fallback.
8. When this brief doesn't cover a decision, pick the option that is simpler, faster for a seller on a phone, and more honest. List those decisions in the pull request.
9. Finish by opening a pull request containing: a summary; before/after screenshots of the home, offer, condo townhouse, calculator and thank-you pages; the TO CONFIRM list (Section 13) showing what's still missing; every environment variable Kane must set (Section 10); and Kane's launch checklist (Section 14).

**Definition of done:** every phase is complete; `npm run check`, `npm run build`, `npm run scan:build`, `npm run seo:audit` and `npm run a11y` all pass (the last two against `npm start`); screenshots match Section 3; no unconfirmed claim renders in a production build; the pull request is open.

---

## 1. The audit: what's wrong now, and why each change exists

Severity: Critical, High, Medium, Low. Every change later in this document traces back to one of these findings.

### Launch and plumbing

1. **Critical: nobody can find the site yet.** There's no domain, so `robots.txt` disallows crawling, which is correct while the site lives on `*.vercel.app`. But on `main`, the canonical URL, `og:url`, sitemap and JSON-LD all point at `https://www.example.com`, because `site.url` falls back to a placeholder.
2. **Critical: Vercel's Hobby plan doesn't allow commercial use.** The live business site needs Vercel Pro, or another host that runs Next.js server functions.
3. **Critical: leads can disappear silently.** With no destination configured, `/api/leads` returns `ok: true` and only logs the lead, and Hobby keeps runtime logs for about an hour. Separately, Airtable's free plan caps a base at 1,000 records and 1,000 API calls a month. If the CRM base fills up with cold lists, website writes start failing.
4. **High: no speed-to-lead.** Nothing reaches Kane's phone when a lead lands, and nothing acknowledges the seller. The first buyer to call usually gets the conversation.
5. **Medium: the repository is public.** It exposes the Airtable base ID and schema, and hands the whole site to competitors. Kane will make it private; Vercel deploys private repos.
6. **Low:** `priceRange: "Free cash offers"` isn't a valid value. The schema `logo` is an SVG where Google wants a raster image. OG images render in a thin fallback font even though the code asks for weight 800.

### Positioning and brand

7. **Critical: interchangeable.** The headline, promises, palette and page structure match Edmonton competitors almost word for word (We Buy Houses Edmonton, Wade Buys Houses, Sunrise Home Buyers, Formula Home Buyers, House Buyer Network). They all use "sell your house fast for cash", "fair cash offer", "close in as little as 7 days", "offer within 24 hours", "any condition, any situation", "3 simple steps" and check-mark lists. A seller comparing three tabs can't tell them apart.
8. **Critical: anonymous.** No face, no name, no photograph of anything real. A seller's biggest fear in this category is a faceless company that lowballs or scams them. The one distinctive asset, the Aurora / Manning story, is buried in an About-page sidebar.
9. **High: nothing is weighted, and property type isn't a dimension of the site.** Eleven situations, eight areas and six property types all get the same size of card. Sellers think about their home first ("my townhouse", "Mom's bungalow"), yet the only property-type page is filed as a situation (`/situations/sell-condo-townhouse`). There's no clean way to lead with what Kane buys today and add types later.
10. **High: the copy claims a track record the business doesn't have yet.** Examples:
    - "We've seen it before" and "we've helped homeowners through it" (`src/components/sections.tsx`).
    - "the situations homeowners bring to us most often" (`src/app/situations/page.tsx`).
    - "one of the property types we buy most often" and "We buy estate properties regularly" (`src/content/faqs.ts`).
    - "Special assessments are one of the most common reasons condo owners call us" (`content/situations/sell-condo-townhouse.md`).
    - "Problems we regularly buy through" (`content/situations/sell-house-that-needs-repairs.md`).
    - "a normal purchase for us", "Sellers there often call us", "Vacant houses are a common purchase" and "a firm cash number within a day or two" (`src/content/locations.ts`).
    - "Homeowners in {city} come to us… the most common" (city page template).
    - "many homeowners we meet" and "Most of the homes we buy end up with local investors" (About page).
    - "Our specialty" (Investors page).

    Unverified speed promises also appear in components, metadata, `llms.txt` and 18 Markdown placeholders (`{{closeDays}}`, `{{offerHours}}`). The seven guides carry publish dates from June to September 2026 for content written in September. Together these create a misleading general impression, which is a Competition Act risk, and a trust problem the first time a seller asks how many homes Kane has bought.
11. **Medium: "fair" is everywhere and means nothing.** Every competitor says it.
12. **Medium: the comparison table contradicts itself.** It calls itself honest, then gives every row a green check for us and a grey X for listing. The worked example on `/cash-offer-vs-realtor` really is honest (listing as-is nets about $36,000 more in its own numbers); the table undercuts it.

### Design and UX

13. **High: template look.** Navy gradient hero, amber buttons, Inter, uppercase tracked labels above every heading, identical rounded cards with an icon in a rounded square, check-icon bullets, and a house-with-a-checkmark logo that says nothing about Aurora.
14. **High: length and repetition.** The home page is about 7,200px tall on desktop and 12,900px on a phone, roughly fifteen phone screens. The same four claims (no repairs, no fees, close fast, no obligation) appear three times. There's not one photograph.
15. **Medium: the form asks too much at once.** Step 2 shows nine inputs on a phone: name, phone, email, four selects, a textarea and consent.
16. **Medium: mobile details.**
    - The sticky bar covers the form's privacy line and duplicates the form's button.
    - Its offer button navigates to another page even when the form is on screen.
    - The comparison table scrolls sideways at 390px.
    - Consent text and fine print are 12px, too small for many sellers.
17. **Medium: the thank-you page is a dead end.** "We'll reach out shortly" gives no name, no time window, no way to pick a call time and nothing to prepare.
18. **Medium: investors sit in the seller's navigation.** A seller who reads "off-market deals for investors" next to "fair cash offer" starts wondering who is really on the other side of the deal.
19. **Low:** six nav links plus a phone number plus a button collapse the header into a menu below 1280px.

### Kane's other lead sources

20. **High: nothing supports letters, door hangers and door-knocking.** People who get a letter look the sender up before they call. There's no page for them and no way to opt out. There's no way to tell which campaign produced a lead: attribution only reads UTM tags and lasts one browser session. Phone and text taps aren't tracked at all.

### Search

21. **High: the wrong battle.** A brand-new domain is aimed at the most contested terms ("sell my house fast Edmonton", "we buy houses {city}"). The winnable ground is:
    - the long tail of specific property types and seller situations, starting with condo townhouse problems (special assessments, fees, condo documents);
    - the Google Business Profile.
22. **Medium:** articles have no human author, there's no founder `Person` schema, and `areaServed` doesn't list the cities.
23. **Low:** FAQPage markup won't earn rich results for this kind of business, though it's harmless for machines reading the page. The brand name collides with Aurora, Ontario, and Aurora in Colorado and Illinois, so "Edmonton" must sit next to the name in titles, descriptions and profiles.

### What's good and stays

Build on all of this:

- Static rendering, the `pageMetadata()` helper, the JSON-LD builders, the sitemap and `llms.txt`.
- The 91 passing tests, CI and the SEO audit script.
- The address-first form, attribution capture, the honeypot, CASL consent capture and the Airtable retry fallback.
- Alberta-correct content: Land Titles, lawyers rather than escrow, Poly-B, Court of King's Bench.
- The wholesaling disclosure, and the rule against fabricated testimonials.

---
## 2. Strategy

### 2.1 Positioning

> Aurora Home Buyers is Edmonton's straight-answer home buyer: one real person who buys houses, townhouses, duplexes and condos as-is, shows you the math behind the offer, and tells you when you'd do better listing.

Three pillars carry it everywhere:

- **You see the math.** Every offer comes with the after-repair value, the repair estimate and the costs behind the number.
- **You hear it when listing wins.** If an agent would likely net the seller more, Kane says so and shows the comparison.
- **You know who's buying.** Kane either buys the home himself or assigns his contract to another investor, and the seller knows which, in writing, before signing.

A fourth, **the price holds** (no price cuts after agreement unless something new and material turns up), appears only if Kane confirms it (Section 2.5).

Tagline (`site.tagline`): **Straight answers on selling your home.**

Kane approved this positioning and the three pillars in September 2026, so their flags start as `true`. Specific numbers (days to close, hours to an offer), paying legal fees and itemizing his profit stay off until he confirms each one.

### 2.2 Audiences

1. **Owners of homes that are hard or slow to sell the usual way:** the place needs work, tenants live there, it's an estate, there's a separation, payments are behind, the condo complex has rising fees or a special assessment, or there's simply no time to wait. Property type is a variable, not the identity. Today Kane's investor buyers want condo townhouses most, so townhouse owners get the deepest content first. Everything is built so the next property type is a Markdown file and a config line.
2. **People who got a letter, a door hanger or a knock from Kane and are checking him out.** They need proof he's real, an easy way to ask for an offer, and an easy way to opt out.
3. **Investors joining the buyers list.** Secondary, and kept out of the seller's path.

Sellers arrive stressed, suspicious and tired of being sold to. The site's emotional job is calm and clarity: one person, plain numbers, no pressure.

### 2.3 Voice

- **First person singular, as Kane, on seller-facing surfaces:** hero copy, forms, the founder section, commitments, the thank-you page, messages to sellers and the `/hello` page. Use "Aurora Home Buyers" and "we" only in legal and disclosure text. Guides carry Kane's byline.
- **Plain and specific.** Plain verbs, sentence case, short sentences, Canadian spelling, no exclamation marks. Explain; don't sell. Say something specific and checkable, or say nothing.
- **No claims about volume, speed or experience** except through `src/lib/claims.ts` (Section 2.5).
- **Banned phrases** (case-insensitive; enforced by the claims test in Section 11): "fair cash offer", "fair offer", "fair price", "hassle", "hassle-free", "stress-free", "seamless", "we've helped", "I've helped", "thousands of homeowners", "trusted by", "#1", "number one", "best price", "top dollar", "guaranteed offer", "most often", "regularly buy", "we've seen it", "any situation", "our specialty", "most common reasons", "come to us", "often call us".
- **The test also rejects first-person track-record claims** with these patterns:
  - `/\b(we|I)('ve| have) (helped|bought|seen|closed|worked with)\b/i`
  - `/\b(we|I) (buy|purchase)\b[^.]{0,40}\b(regularly|often|all the time|every (week|month))\b/i`
  - `/\b(common|normal|typical) purchase\b/i`

### 2.4 Brand story: why "Aurora"

Kane grew up in Manning, Alberta, on the Mackenzie Highway about 73 km north of Peace River, in the County of Northern Lights. The community was first known as Aurora. When it came time to incorporate, postal authorities disallowed the name to avoid confusion with Aurora, Ontario, and the town was named after Premier Ernest Manning instead. (Source: The Canadian Encyclopedia, "Manning".) The business name is a nod to home, and the aurora gives the brand its visual idea (Section 3).

Tell the short version on the home page and the full version on About, with the source credited in a small line.

### 2.5 Confirmation mechanism: nothing unconfirmed ships

**Config.** Add these fields to `src/config/site.ts`. Keep the existing fields, and change `tagline` as in 2.1.

```ts
/** The person sellers deal with. Empty strings render nothing. */
founder: {
  firstName: "Kane",
  lastName: "",          // TO CONFIRM (optional)
  role: "Founder",
  photo: "",             // e.g. "/images/kane/portrait.jpg" — real photos only
  photoAlt: "",          // e.g. "Kane on a residential street in Edmonton"
  shortBio: "",          // TO CONFIRM: one or two sentences in Kane's words
  signature: "",         // optional: "/brand/signature.svg", traced from Kane's real signature
  linkedin: "",
  video: { src: "", poster: "", captions: "" }, // optional 60–90 s intro: MP4 + poster + WebVTT
},

/** What happens after a seller submits. Only promise what can always be kept. */
responsePromise: {
  duringHours: "",       // TO CONFIRM, e.g. "within 2 hours"
  afterHours: "the next morning",
},

/**
 * Flip a flag to true only after Kane confirms it. Unconfirmed claims never render in production.
 * The first three are the brand pillars Kane approved in September 2026.
 */
verified: {
  explainsOfferMath: true,                // offers come with the ARV, repairs and costs explained
  tellsWhenListingWins: true,             // Kane says so when listing would likely net more
  assignmentDisclosedBeforeSigning: true, // matches site.disclosure; lawyer to review the wording
  showsMarginInWriting: false,            // TO CONFIRM: written offers itemize the profit line too
  noRetrades: false,                      // TO CONFIRM: no price cuts after agreement unless something new and material turns up
  closeInDays: false,                     // TO CONFIRM: promises.closeInDays is reliably achievable
  offerWithinHours: false,                // TO CONFIRM: promises.offerWithinHours is reliably achievable
  coversLegalFees: false,                 // TO CONFIRM: Kane pays the seller's standard legal fees
},
offerStaysOpenDays: null as number | null, // TO CONFIRM
bookingUrl: "",                            // optional free Cal.com link for booking the first call

/**
 * Property types shown on the site, in display order; the first is the current focus.
 * `value` must be a PROPERTY_TYPES value (Airtable choice). To start or stop showing a type,
 * flip `show`. To give a type its own page, add content/property-types/<slug>.md (Section 5.7).
 */
propertyTypes: [
  { value: "Condo townhouse",    show: true, note: "Including complexes with high fees, a special assessment or big repairs coming." },
  { value: "Single family",      show: true, note: "Bungalows, split-levels and two-storeys, from dated to damaged." },
  { value: "Half duplex",        show: true, note: "Either side, with or without a basement suite." },
  { value: "Freehold townhouse", show: true, note: "Row and end units without condo fees." },
  { value: "Apartment condo",    show: true, note: "Older buildings and units that need work." },
  { value: "Multifamily",        show: true, note: "Up-down duplexes to fourplexes, tenants in place." },
],
```

Keep `promises.closeInDays` (7) and `promises.offerWithinHours` (24) as the numbers, but they only reach the page through `claims.ts`, and only when their flags are true. Set `promises.coversLegalFees` to follow `verified.coversLegalFees`.

**`src/lib/claims.ts`** is the only place copy may get a promise from. It exports:

| Export | Returns when verified | Returns otherwise |
|---|---|---|
| `closingPhrase()` | "as soon as {n} days, or on the date you choose" | "on the date you choose" |
| `offerTimingPhrase()` | "within {n} hours of seeing the place" | "after I've seen the place" |
| `legalFeesSentence()` | "I pay your standard legal fees." | `null` |
| `responseLine()` | "I reply {duringHours} during business hours ({hours label})." | `null` |
| `offerOpenSentence()` | "My offer stays open for {n} days, so you have time to think and get advice." | `null` |
| `promiseItems()` | Verified items from Section 5.10 | Only the verified ones |
| `heroHeadline()` | "Sell your Edmonton home as-is. See the math first." (`explainsOfferMath`) | "Sell your Edmonton home as-is, to a real person." |
| `sampleOfferRows(sample)` | Rows with the profit line itemized (`showsMarginInWriting`) | Costs and profit combined into one line (Section 5.3) |
| `founderDisplayName()` | "Kane {lastName}" | "Kane" |
| `isVerified(flag)` | `boolean` | |

Replace `placeholderWarnings()` so it lists every unverified flag, every empty founder field, a missing `responsePromise.duringHours`, and a non-final `site.url`. Print the list during `next build` (it exists already; extend it).

**Markdown placeholders.** Replace `{{closeDays}}` and `{{offerHours}}` in every content file with phrase placeholders that `claims.ts` resolves: `{{closingPhrase}}`, `{{offerTimingPhrase}}` and `{{legalFeesSentence}}` (which may resolve to nothing, so write the surrounding sentences to read well either way). The old numeric placeholders become forbidden; the content test fails if one appears.

**Environments** (`src/lib/env.ts`):

- `deployEnv()` returns `VERCEL_ENV ?? SITE_ENV ?? (NODE_ENV === "production" ? "production" : "development")`.
- `showUnconfirmed()` is `deployEnv() !== "production" && NEXT_PUBLIC_PREVIEW_UNCONFIRMED === "true"`.
- `showDrafts()` is `deployEnv() !== "production"`.

Make every gating decision in server components, and pass plain strings or booleans down to client components. (`VERCEL_ENV` isn't available in the browser.)

**Preview mode.** When `showUnconfirmed()` is true, gated items render with a small dashed "Unconfirmed" tag in `signal`, and draft pages and posts render with a "Draft" banner. Production ignores both switches. Take design screenshots in preview mode (`npm run build:preview`), and one set in production mode, to prove every layout still looks finished with gated items hidden.

---
## 3. Design system

### 3.1 Concept: rooflines under northern light

The site should feel like meeting a straightforward local person, not visiting a lead-generation template. Three ideas carry it.

- **Winter daylight.** A cool snow-white page (not cream), deep spruce ink, and one pine green for action. Calm, clean and very readable.
- **Plain lettering.** Headlines are set in Overpass, an open-source descendant of the lettering on North American highway signs. It was built to be read fast by anyone, which is exactly the job here, and it echoes the Mackenzie Highway in the brand story. Body text is set in Atkinson Hyperlegible Next, designed with the Braille Institute for low-vision readers, because many sellers are older and reading on phones.
- **One memorable thing: the Aurora Roofline.** At the bottom of the home hero, a single continuous line traces a street of Edmonton home types as a horizon: bungalow, two-storey, a row of townhouses, a half duplex, a small walk-up. Above it, a ribbon of aurora light draws itself across the sky once when the page loads. It says the name, the city and "every kind of home" in one image, and nobody else in this market has anything like it. Everything around it stays quiet.

### 3.2 Colour

Define these as Tailwind v4 `@theme` tokens in `src/app/globals.css`. They replace the current `brand-*` and `accent-*` scales. Contrast ratios were measured against `snow` unless noted.

| Token | Hex | Use |
|---|---|---|
| `snow` | `#F4F7F8` | Page background |
| `frost` | `#E3ECEE` | Alternate section background, unselected chips |
| `white` | `#FFFFFF` | Form card, ledgers, input fill |
| `mist` | `#C9D6D9` | Decorative rules and dividers only. Never text, never input borders |
| `line` | `#6F8781` | Input and control borders (3.6:1 on snow, 3.2:1 on frost) |
| `ink` | `#183A31` | Primary text, headings, the logo (11.5:1) |
| `ink-2` | `#3F5A54` | Secondary text (7:1; 6.2:1 on frost) |
| `ink-3` | `#4D6660` | Fine print and captions only (5.8:1; 5.2:1 on frost) |
| `pine` | `#0B6B4F` | Primary buttons, selected chips (white text 6.5:1) |
| `pine-deep` | `#08573F` | Hover and pressed states |
| `night` | `#0E2A30` | The one dark section a page may have (snow text 14:1) |
| `night-ink-2` | `#B8CCCB` | Secondary text on night (9:1) |
| `aurora-green` | `#3FE0A0` | Ribbon and logo crossbar. Decorative only |
| `aurora-teal` | `#31C6D4` | Ribbon midpoint. Decorative only |
| `aurora-violet` | `#8F7CF7` | Ribbon tail. Decorative only |
| `focus` | `#4B3FC4` | Focus rings on light surfaces (6.9:1) |
| `focus-night` | `#9EF0CF` | Focus rings on night |
| `error` | `#B3261E` | Error text and borders (6:1) |
| `signal` | `#9A5B00` | "Unconfirmed" and "Draft" preview tags only |

Rules:

- Aurora colours never carry text and never fill large areas. No gradient washes anywhere.
- At most one `night` section per page.
- Body text is never lighter than `ink-2`. `ink-3` is only for fine print at 14px or larger.
- Set `color-scheme: light`. There's no dark theme.

### 3.3 Typography

**Loading.** Load both families with `next/font/google`, which self-hosts them at build time, preloads them and generates fallback metrics:

- Overpass (variable `wght`) as `--font-display`.
- Atkinson Hyperlegible Next (variable `wght` 200–800) as `--font-sans`.

Both are in this Next.js version's font list. If the build can't reach Google Fonts, switch to `next/font/local` with the files from `@fontsource-variable/overpass` and `@fontsource-variable/atkinson-hyperlegible-next`. Remove `@fontsource-variable/inter` and every Inter reference.

**OG images.** Satori can't use WOFF2 or variable fonts. Add `@fontsource/overpass` and `@fontsource/atkinson-hyperlegible-next` as dependencies (v5.3.0 at time of writing) and read their static WOFF files, for example `files/overpass-latin-800-normal.woff` and `files/atkinson-hyperlegible-next-latin-600-normal.woff`.

**Numbers.** Both families include tabular figures. Every money amount uses `font-variant-numeric: tabular-nums lining-nums`.

**Scale** (16px root; body is 18px):

| Role | Family | Size | Weight | Line height | Tracking |
|---|---|---|---|---|---|
| Home H1 | Overpass | `clamp(2.5rem, 1.6rem + 3.6vw, 4.5rem)` | 800 | 1.02 | −0.015em |
| H1, other pages | Overpass | `clamp(2.125rem, 1.5rem + 2.6vw, 3.5rem)` | 800 | 1.05 | −0.01em |
| H2 | Overpass | `clamp(1.625rem, 1.25rem + 1.6vw, 2.5rem)` | 750 | 1.1 | −0.005em |
| H3 | Overpass | 1.375rem | 700 | 1.2 | 0 |
| Lead paragraph | Atkinson | 1.25rem | 400 | 1.55 | 0 |
| Body | Atkinson | 1.125rem | 400 | 1.6 | 0 |
| Small | Atkinson | 1rem | 400 | 1.5 | 0 |
| Fine print | Atkinson | 0.875rem (the minimum anywhere) | 400 | 1.5 | 0 |
| Buttons | Overpass | 1.125rem | 700 | 1 | 0.005em |
| Ledger amounts | Overpass | 1.125rem (total 1.375rem, 800) | 600 | 1.4 | tabular |

Rules:

- Sentence case everywhere: headings, buttons, navigation, titles.
- No all-caps labels and no tracked eyebrow labels above headings.
- Never accent a single word in a headline, whether with italics, colour or weight.
- Prose is 68ch at most. Use `text-wrap: balance` on headings and `text-wrap: pretty` on paragraphs.

### 3.4 Layout, spacing and shape

**Grid and alignment**

- Content max width 1200px. Gutters are 20px on phones, 32px on tablets and 48px on desktops.
- Left-aligned everywhere. Only the 404 and thank-you headings may centre.
- Breakpoints: base 390px, `sm` 640px, `lg` 1024px, `xl` 1280px.

**Spacing**

- Scale in px: 4, 8, 12, 16, 24, 32, 48, 64, 96, 128.
- Section padding is 64px on phones and 96px on desktop.
- Sections alternate `snow` and `frost`, plus at most one `night` section per page.
- Each section has one job and one thing that gets attention.

**Shape.** The radius is deliberately different by role:

- Buttons: 10px.
- Inputs and chips: 8px.
- The form card: 16px.
- Ledgers: 6px (a document, not a card).
- Photos: 4px.

**Depth.** No drop shadows on cards or sections. There is exactly one floating object: the lead form card, with `box-shadow: 0 24px 48px -24px rgb(24 58 49 / 0.35)` and a 1px `mist` border. Everything else separates with space, a background change or a 1px `mist` rule.

**Buttons**

- Minimum height 52px (44px for compact buttons in the header).
- Primary: `pine` fill, white Overpass text. A thin inset white rule gives a quiet nod to a highway guide sign: `box-shadow: inset 0 0 0 3px var(--color-pine), inset 0 0 0 5px rgb(255 255 255 / 0.5)`.
- Secondary: transparent with a 2px `ink` border and `ink` text.
- On `night`: `snow` fill with `ink` text.

**Links.** `ink` with a 1px underline offset 3px; hover turns them `pine`. Never append arrows to button or link text.

**Focus.** Every interactive element gets a 3px `focus` outline with a 2px offset (`focus-night` on night). Touch targets are at least 44×44px.

**Home hero wireframes**

Desktop, 1440px:

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ [mark] Aurora Home Buyers   How it works  What I buy  Cash vs. listing  About │
│        Edmonton, Alberta                           (780) 836-5156 [Get my offer]│
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Sell your Edmonton home as-is.                ┌───────────────────────────┐ │
│  See the math first.                           │ What would you get for    │ │
│                                                │ your place?               │ │
│  (photo) I'm Kane. I buy houses, townhouses    │ Two quick steps. No       │ │
│  and condos directly from owners across        │ obligation.               │ │
│  Greater Edmonton. Tell me about your place…   │ Property address          │ │
│                                                │ [_______________________] │ │
│  Call (780) 836-5156   Text me                 │ [          Next         ] │ │
│                                                └───────────────────────────┘ │
│                ~ ~ ~ ~ aurora ribbon draws once, left to right ~ ~ ~ ~       │
│  ___/\____|‾‾|‾‾|‾‾|‾‾|____/\/\_____|‾‾‾‾‾‾|___/\__|‾‾|__  roofline ________  │
└──────────────────────────────────────────────────────────────────────────────┘
```

Phone, 390px:

```
┌──────────────────────────┐
│ [mark] Aurora Home  (☎)(≡)│
├──────────────────────────┤
│ Sell your Edmonton home  │
│ as-is. See the math      │
│ first.                   │
│ I'm Kane. I buy houses,  │
│ townhouses and condos…   │
│ ┌──────────────────────┐ │
│ │ What would you get…  │ │
│ │ [address__________]  │ │
│ │ [        Next      ] │ │
│ └──────────────────────┘ │
│ Call or text 780…        │
│  ~ ~ ribbon ~ ~          │
│ _/\_|‾|‾|‾|_/\/\_  roof  │
└──────────────────────────┘
```

### 3.5 Logo and identity

**If Kane's own logo exists.** Kane is designing a logo that nods to the aurora. If `public/brand/logo.svg` exists when you start this phase, use it for the header, footer and icons and skip the interim mark. Keep the lockup rules below.

**Otherwise, build the interim mark:** an "A" drawn as a steep gable roof, with an aurora ribbon as its crossbar.

- `src/components/brand/Mark.tsx` renders an inline SVG with viewBox `0 0 64 64`.
- The roof legs are one path, `M9 56 L32 9 L55 56`: stroke `ink`, width 7, `stroke-linejoin="miter"`, `stroke-linecap="butt"`.
- The crossbar ribbon is `M12 38 C 20 31, 27 44, 35 37 S 49 30, 58 35`: width 5.5, round caps, stroked with a left-to-right linear gradient from `aurora-green` through `aurora-teal` to `aurora-violet`. The ribbon deliberately runs past the right leg, like light trailing off the roof.

**Lockups** (`src/components/brand/Logo.tsx`)

- Full lockup: the mark, then "Aurora Home Buyers" in Overpass 800 `ink`, with "Edmonton, Alberta" underneath in Atkinson 400 at 13px in `ink-2`.
- Below 360px wide, use the compact lockup: mark plus name only.

**Icons**

- Replace `src/app/icon.svg` with the mark on a `snow` rounded square, with stroke widths up about 20% so it reads at 16px.
- Add `src/app/apple-icon.tsx`: a 180×180 PNG via `next/og`.
- Add a force-static route, `src/app/brand/logo.png/route.tsx`, that renders a 512×512 PNG of the mark on `snow`. It's the schema logo (Section 7.3).
- Update `manifest.ts`: theme and background colour `#F4F7F8`, PNG icons.
- Remove the house-with-a-checkmark mark everywhere.

### 3.6 The Aurora Roofline

`src/components/brand/AuroraRoofline.tsx` is pure inline SVG: no raster images and no JavaScript. Keep it one self-contained component, so an illustrator's redraw can replace it later.

**Horizon**

- One continuous `ink` path, 2px wide (1.5px under 640px), in a 1440×220 viewBox, running full-bleed along the bottom of the home hero.
- Left to right it draws:
  1. a 1950s bungalow with a low hip roof and a chimney;
  2. a two-storey with a front gable;
  3. a row of four 1970s–80s townhouses with a stepped roofline and small entry canopies;
  4. a half duplex: one roof, mirrored doors;
  5. a three-storey walk-up with a flat roof;
  6. a bungalow with a detached garage.
- About a third of the homes get small window rectangles (1.5px strokes). Nothing else is detailed. Between buildings the line runs flat along the ground.
- It must read at 390px wide. Below 640px, crop to the middle 60% rather than shrinking it.

**Sky**

- One ribbon path above the rooftops, 6px wide (4px on phones), stroked with a gradient from `aurora-green` through `aurora-teal` to `aurora-violet`, with opacity running from 0.9 to 0.6.
- Behind it, the same path at 18px wide and 0.14 opacity, as a soft glow.
- It arcs gently from lower left to upper right with two soft waves.

**Motion.** On first load, the ribbon draws itself from left to right: `stroke-dasharray` and `stroke-dashoffset` over 1.6s, with `cubic-bezier(.2,.7,.2,1)` and a 300ms delay. This is the only motion on the site that the visitor doesn't trigger. With `prefers-reduced-motion: reduce`, it renders fully drawn.

**Placement**

- Text never overlaps the line work.
- On the home page, it's the hero's bottom edge.
- A static, shorter crop (no animation) forms the top edge of the footer on every page.
- The home page's night section uses the ribbon alone, at full opacity, without the roofline.

### 3.7 Components

Build these in `src/components/ui/` and `src/components/brand/`. Delete old components that no longer have a job (the icon-card sections in `sections.tsx`, `ComparisonTable`, `ValueProps`, `Benefits`).

**Actions and forms**

- `Button` (primary, secondary, on-night) and `TextLink`.
- `Field`, `ChipGroup` and `Checkbox`. Chips are radio inputs inside a `fieldset` with a `legend`, at least 44px tall.
- `LeadForm` (Section 4.1), `BuyerForm` (restyle only) and `OptOutForm` (Section 4.7).

**The ledger**

- `Ledger` renders a written offer or a net sheet as a document: white fill, 6px radius, a 1px `mist` border, and a 3px `ink` rule across the top.
- The header row has the title on the left and a "Sample" tag on the right when the figures are illustrative.
- Each row has its label on the left and the amount on the right, joined by a dotted leader (a flex spacer with `border-bottom: 2px dotted var(--color-mist)`). A row may carry a small note underneath.
- A 2px `ink` rule sits above the total, which is set in Overpass 800.
- Amounts are right-aligned and tabular. Negative amounts use a true minus sign (−), never red text.
- `SampleOffer` is a `Ledger` fed by `src/content/samples.ts` (Section 5.3), with rows from `claims.sampleOfferRows()`.

**Content blocks**

- `Commitments`: the verified promise items from Section 5.10, each a short statement with a one-line explanation. Not numbered, because they aren't a sequence, and no icons.
- `Steps`: a numbered sequence (this one is a sequence). On phones it's vertical, with a 2px `mist` line joining large Overpass numerals; on desktop it's horizontal, with the line running through the numbers.
- `FounderNote`: the photo if there is one, "Hi, I'm Kane.", a short note and an optional signature. Without a photo it's a text block beside the mark, and it must still look finished.
- `StraightAnswer`: a callout at the top of situation, property-type and guide pages. `frost` background, a 4px `pine` rule on the left, the question set as an H2, and a 40–60 word answer.
- `NetBars`: three horizontal bars comparing net proceeds. Pure CSS widths, with labels and amounts in text so colour never carries the meaning.
- `Faq`: `details`/`summary`, with a chevron that rotates on open.

**Chrome**

- `SiteHeader`, `MobileMenu` (replaces `MobileNav`), `StickyActions` (replaces `MobileCtaBar`), `SiteFooter` and `FocusHeader` (Section 5.2). Remove the old house-with-a-checkmark mark wherever it's defined (check `icons.tsx`).
- `Unconfirmed` and `DraftBanner` tags, for preview mode only.

**Icons.** `lucide-react` is allowed only for small functional glyphs next to text: phone, message, chevron, external link, and a check inside a success message. No decorative icon tiles anywhere.

### 3.8 Photography and video

- Real photos only: taken by or of Kane, or licensed images of places. Never stock photos of people.
- Put images in `public/images/`. Use `next/image` with explicit `sizes` and AVIF/WebP, and alt text that says what's in the picture.
- Until photos exist, every layout must look finished without them.

**Shot list for Kane's photographer** (Section 14):

- Kane outdoors on an established Edmonton street in natural light: one vertical shot, and one horizontal with room for text beside him.
- Kane at a kitchen table with a printed offer and a pen: hands and paper, no staged handshake.
- Exteriors of the home types in the roofline, in winter and summer. No house numbers and no identifiable client homes.
- If possible, a real photo of the northern lights over Edmonton rooftops, Kane's own or licensed.

**Video** (optional)

- A 60–90 second intro filmed on a phone with a clip-on mic: who Kane is, how he makes an offer, and what happens after someone calls.
- Self-host it: MP4 of 12 MB or less, a poster image and WebVTT captions.
- Use `preload="none"`, and never autoplay with sound.

### 3.9 Motion

- The only unprompted motion is the ribbon draw (3.6).
- User-triggered transitions (menu, accordion, chip selection, button press) take 150ms or less.
- No scroll-triggered fades, no parallax and no hover lifts on cards.
- Honour reduced motion everywhere.

### 3.10 Never do these

These are the tells of a template:

- ALL-CAPS or letter-spaced labels; eyebrow labels above headings; meta strings joined with middle dots; labels built as "WORD — fragment".
- A single accented word in a headline.
- Arrows appended to button or link text.
- Identical rounded cards with icons in rounded squares; one shadow under everything; gradient washes; stock photos of people.
- Cream backgrounds, terracotta accents, navy with amber, or near-black pages with a neon accent.
- Monospace type for labels or numbers.
- Numbered markers on anything that isn't a sequence.
- Any claim about volume, speed or experience that doesn't come from `claims.ts`.

### 3.11 Styleguide route

`/styleguide` renders every token, type style and component in every state (errors, loading, success, preview tags) on `snow`, `frost` and `night`.

- It returns `notFound()` in production deploys.
- It's excluded from the sitemap and disallowed in `robots.txt`.

Screenshot it at the end of Phase 2 and review it before building any page.

---
## 4. Lead capture and speed-to-lead

The rule: **a lead is never lost, Kane hears about it within seconds, and the seller hears back right away.** Quo (texting) and a new CRM are separate purchases Kane will make when he scales. Build both integrations now, dormant until their environment variables exist, so turning them on is configuration, not code.

### 4.1 The seller form (`LeadForm`)

It's one card with two steps. The primary instance has `id="offer"`; a second instance on the same page uses `id="offer-bottom"`.

**Card copy.** Title (a prop): "What would you get for your place?" Subtitle: "Two quick steps. No obligation."

**Step 1**

- One field: "Property address". Use `autocomplete="street-address"` and the placeholder "e.g. 1234 56 St NW, Edmonton".
- Button: "Next". Fire `lead_form_start` when it validates.

**Step 2**

- Heading: "How do I reach you?" Focus moves to it when the step changes.
- Fields, in order:
  1. "Your name" (`autocomplete="name"`).
  2. "Phone" (`type="tel"`, `autocomplete="tel-national"`), with the hint "I'll call from {site.phone}."
  3. "Email (optional)".
  4. "Property type": chips for the types with `show: true`, in config order. Preselect the type from the `propertyType` prop, or from `?type=` if its value is a valid `PROPERTY_TYPES` value.
  5. "When would you like to sell?": chips for the timeline options.
- A closed `<details>` titled "Add details (optional)" holds:
  - condition chips;
  - occupancy chips;
  - a reason select;
  - a notes textarea, "Anything I should know?", with the placeholder "e.g. the condo fees keep going up, it's an estate, I'm moving for work".
- The SMS consent checkbox, at 14px with the words spelled out: "Yes, {site.name} may text me at this number about my property. Consent isn't required to get an offer. Message frequency varies. Message and data rates may apply. Reply STOP to opt out or HELP for help." Link the Privacy Policy and Terms.
- Button: "Send my request". Under it: "Private. Never sold or shared for marketing." Then `responseLine()`, if there is one.
- A "Back" text button returns to step 1 with the address kept.

**Behaviour**

- Errors say exactly what to fix ("Enter the street address and city"). Show them inline and in a summary with `role="alert"`, and keep everything the seller typed.
- On a 502, show: "Your request didn't go through. Please call or text me at {phone}.", with tap-to-call and tap-to-text links.
- On success:
  1. Store `firstName`, `propertyType`, `occupancy` and `hasEmail` in `sessionStorage`.
  2. Fire `generate_lead` with the parameters in 8.1 (never personal information).
  3. Go to `/thank-you`.
- Generate a `submissionId` with `crypto.randomUUID()` on mount and send it with the lead.
- Keep the honeypot, the 3-second timing check and attribution (Section 8.2).
- Inputs are at least 48px tall with 17px text, so iOS doesn't zoom.

### 4.2 Delivery pipeline (`POST /api/leads`)

1. **Validate.** Parse with zod, as now, adding an optional `submissionId`.
   - Spam (honeypot or timing) gets a silent `ok`. Keep the rate limit.
   - A `submissionId` seen in the last 15 minutes on this instance returns `ok` without delivering again.
2. **Build the record** with `toLead()` in `src/lib/leads.ts`, as now, plus `submissionId` and the extended attribution.
3. **Deliver to every durable sink in parallel** (Section 4.3), with an 8-second timeout each. The owner alert email counts as durable, because it's a written record in Kane's inbox.
   - If at least one sink succeeds, return 200.
   - If none is configured or all fail: log the full record once as `[lead:undelivered]` and return 502, so the form shows the call-or-text fallback.
   - Only in `development`, a missing configuration logs a warning and returns `ok`. Delete the current "no destination means ok" path everywhere else.
4. **After the response,** using `after()` from `next/server` (read its guide first), send the owner text (Quo), the owner push (ntfy) and the seller confirmation. Each runs in isolation. Failures log the lead ID only, never personal information.
5. **Target:** under 2 seconds at the 95th percentile with Airtable and email configured.

### 4.3 Destinations (`src/lib/sinks/`)

```ts
export type SinkKind = "seller_lead" | "buyer_signup" | "opt_out";

export interface Sink {
  name: string;                                         // "airtable", "webhook:1", "owner-email"
  kinds: SinkKind[];
  send(kind: SinkKind, record: unknown): Promise<void>; // throws on failure
}
```

- **`airtable.ts`:** the existing field mapping (`sellerAirtableFields`), typecast behaviour and retry fallback, moved here unchanged.
- **`webhook.ts`:** the existing `postWebhook` client from `src/lib/delivery.ts`, one sink per URL. It follows redirects and treats a final 2xx as success.
- **`owner-email.ts`:** the Resend owner alert (template in 4.6).
- **`index.ts`:** `getSinks()` builds the list from environment variables. It replaces the destination logic in `deliverLead()` and `src/lib/delivery.ts`.

**Adding a CRM later.** Kane will move off Airtable when he scales. This folder is the only place that changes:

1. Add `src/lib/sinks/<crm>.ts` implementing `Sink`.
2. Register it in `index.ts` behind its own environment variables.
3. Add tests.

Document these steps in `docs/integrations/README.md`.

**Free backup: Google Sheets.** Write `docs/integrations/google-sheets-backup.gs` and its setup steps.

- The Apps Script `doPost` appends one row per record to the tabs "Seller leads", "Buyers" and "Opt-outs", creating a tab and its header row if missing.
- The row holds the time, lead ID, address, name, phone, email, property type, timeline, reason, notes and the full JSON.
- Apps Script can't read custom headers, so it checks a `?secret=` query parameter in the webhook URL.
- Kane deploys it as a web app ("Execute as: Me", "Who has access: Anyone") and adds the URL to `LEAD_WEBHOOK_URL`.
- Apps Script answers a POST with a redirect; `fetch` follows it by default.

### 4.4 Alerts to Kane

- **Email** (always; part of the durable set): the template is in 4.6. It's sent from `LEAD_EMAIL_FROM` to `LEAD_EMAIL_TO`.
- **Text through Quo** (dormant until `QUO_API_KEY`, `QUO_FROM_NUMBER` and `QUO_NOTIFY_TO` are set).
  - Send `POST {QUO_API_BASE ?? "https://api.openphone.com"}/v1/messages` with the header `Authorization: <API key>` (no "Bearer" prefix) and the JSON body `{ content, from, to: [e164] }`. Success is HTTP 202.
  - Confirm this against Quo's current API reference before you write the client.
  - Add `toE164()` next to `normalizePhone()` in `src/lib/lead-options.ts`.
- **Push through ntfy** (optional, free; dormant until `NTFY_TOPIC_URL` is set).
  - `POST` a plain-text body with the headers `Title`, `Priority` (`high` when the timeline is "ASAP", otherwise `default`) and `Tags: house`.
  - Add `Authorization: Bearer {NTFY_TOKEN}` when a token is set.
  - The push carries no personal information: only property type and timeline. The topic name must be long and random.

### 4.5 Confirmations to the seller

- **Email:** only when the seller gave an email address and `SELLER_ACK_EMAIL` isn't `"false"`. Send from `LEAD_EMAIL_FROM`, with reply-to set to the first address in `LEAD_EMAIL_TO`.
- **Text:** only when all of these are true:
  - Quo is configured and `SELLER_ACK_SMS === "true"`;
  - the seller ticked the SMS consent box;
  - it's between 08:00 and 21:00 in America/Edmonton.

  Otherwise skip the text; the email still goes.
- Both messages identify the sender, include a way to reach Kane and a way to opt out, and take every promise from `claims.ts`.

### 4.6 Message templates (`src/lib/notify/templates.ts`)

**Owner alert email.** Plain text plus simple HTML.

- Subject: `New lead: {address} ({timeline label})`.
- It starts with `{name}, {phone}` and large links:
  - "Call {firstName}" (`tel:`).
  - Only if the seller consented to texts: "Text {firstName}", an `sms:` link with the body "Hi {firstName}, it's Kane from Aurora Home Buyers. I got your request about {street}. Is now a good time for a quick call?"
  - Without consent, show "No text consent. Call instead." in place of the text link.
- Then the details: address, property type, timeline, condition, occupancy, reason, notes, email, source and campaign, landing page, lead ID and the submitted time in Edmonton time.

**Owner text (Quo), 320 characters or fewer:**

```
New lead: {address}. {name} {phone}. {property type}, {timeline}. OK to text: {Yes|No}.
```

**Owner push (ntfy).** Title "New seller lead"; body "{property type}, {timeline}. Details are in your email."

**Seller text:**

```
Hi {firstName}, it's Kane from Aurora Home Buyers. I got your request about {street}. I'll call you {window} from this number. Reply STOP to opt out.
```

`{window}` is `responsePromise.duringHours` when it's set (for example "within 2 hours"), otherwise "soon".

**Seller email.** Subject "Got your request, {firstName}":

```
Hi {firstName},

Thanks for telling me about {address}. I'll call you {window} from {phone}. Save the number so you know it's me.

Here's what happens next:
1. We talk about the place and what's going on.
2. I see it in person, or we do a video walkthrough.
3. You get a written offer {offerTimingPhrase}{", with the math laid out" when explainsOfferMath}. There's no obligation to take it.

If you'd like to see how I work out an offer first: {site.url}/how-it-works

Kane
Aurora Home Buyers
Edmonton, Alberta
{phone}

You're getting this because you asked for an offer at {site domain}. If you'd rather not hear from me, reply "stop" and I won't contact you again.
```

### 4.7 Opt-outs (`POST /api/opt-out` and `OptOutForm`)

People who got a letter, a door hanger or a knock can take themselves off Kane's list.

- **Where:** the form lives on `/hello` (Section 5.13), and the footer links to it as "Got a letter from me?".
- **Fields:**
  - "Property address" (required).
  - Name, phone and email (all optional).
  - "How did I reach you?": chips for "Letter", "Door hanger", "Knock at the door", "Text", "Phone call" and "Other".
  - A note (optional).
- **Protection:** the honeypot, the timing check and the rate limit.
- **Delivery:** every sink that accepts `opt_out`, under the same durable rules as leads:
  - the webhooks, including the Sheets "Opt-outs" tab;
  - the owner email, with the subject "Opt-out: {address}";
  - Airtable, only if `AIRTABLE_OPTOUT_TABLE` is set. The field names are TO CONFIRM; default to Address, Name, Phone, Email, Channel, Notes and Date.
- **Success message:** "Got it. I'll take {address} off my list. If you hear from me again by mistake, call or text {phone}." Fire `opt_out_submit`.

### 4.8 Campaign links and QR codes

These let Kane see which letter or door-hanger run produced each lead.

- **Config.** `src/config/campaigns.ts` exports an array of `{ code, label, to, utm: { source, medium, campaign, content? } }`. Leave two commented examples:
  - `l1` → `/hello`, with source `letter`, medium `direct_mail`, campaign `2026-10-letter`.
  - `dh1` → `/hello`, with source `door_hanger`, medium `door_hanger`, campaign `2026-10-door-hanger`.
- **Codes:** lowercase letters and digits, 2–12 characters, unique. A test enforces this.
- **Redirects.** `next.config.ts` generates a `/go/{code}` redirect for each entry (`permanent: false`), pointing at `{to}` with the UTM parameters appended.
- **QR codes.** `npm run qr` (`scripts/qr.mjs`, using the `qrcode` package) writes `public/qr/{code}.svg`, encoding `{site.url}/go/{code}` with error correction M and a four-module quiet zone.
  - It exits with an error unless `NEXT_PUBLIC_SITE_URL` is the real domain. Printed codes must never point at a temporary address.

### 4.9 Buyers list

Keep `BuyerForm` and `/api/buyers` logic, validation and consent text as they are. Restyle the form, and route its delivery through the sinks, so buyer sign-ups also reach the Sheets "Buyers" tab.

### 4.10 Launch guard

When `deployEnv() === "production"` and `isIndexable()` is true (the real domain; Section 7.1), `next.config.ts` fails the build unless all three are true:

- at least one durable seller sink (Airtable or a webhook) is configured;
- at least one owner alert (Resend email, Quo or ntfy) is configured;
- `NEXT_PUBLIC_SITE_URL` starts with `https://`.

On any other build, print the same findings as warnings.

**Tests for this section:**

- Sink selection from environment variables.
- All sinks failing returns 502. Development with no sinks returns `ok` with a warning.
- Duplicate `submissionId`s aren't delivered twice.
- The Quo request has the key without "Bearer" and `to` as an E.164 array.
- The quiet-hours and consent gates for seller texts.
- The ntfy body contains no name, phone, email or address.
- With every flag off, no template contains an unverified promise.
- Opt-out validation.
- Campaign code format and uniqueness.

---
## 5. Pages

Copy in quotes is final unless it depends on a flag; the flag dependency is noted. Anything marked "via claims" must come from `claims.ts`.

### 5.1 Routes

| Route | Purpose | Indexed | Primary keyword |
|---|---|---|---|
| `/` | Home | Yes | sell my house Edmonton (as-is, cash) |
| `/get-cash-offer` | Focused offer page for ads, QR codes and "Get my offer" links | Yes | cash offer for my house Edmonton |
| `/how-it-works` | The process, how offers are calculated, commitments | Yes | how selling a house for cash works |
| `/what-we-buy` | Property types hub | Yes | homes I buy in Edmonton |
| `/what-we-buy/[type]` | One page per property type that has a Markdown file | Yes | sell {type} Edmonton |
| `/cash-offer-vs-realtor` | Honest comparison and calculator | Yes | cash offer vs realtor Alberta |
| `/about` | Kane, the name, how he buys | Yes | brand |
| `/situations`, `/situations/[slug]` | Ten seller situations | Yes | per page |
| `/we-buy-houses`, `/we-buy-houses/[city]` | Eight area pages | Yes | we buy houses {city} |
| `/blog`, `/blog/[slug]` | Guides by Kane | Yes | per guide |
| `/faq`, `/contact`, `/investors`, `/privacy`, `/terms` | As now | Yes | |
| `/hello` | For people who got a letter, a door hanger or a knock | No | |
| `/thank-you` | After a seller submits | No | |
| `/go/[code]` | Campaign redirects | No | |
| `/styleguide` | Design review; non-production only | No | |

**Redirects.** Add a permanent redirect from `/situations/sell-condo-townhouse` to `/what-we-buy/condo-townhouses`. Keep the existing redirects.

### 5.2 Global shell

**Header**

- Sticky, 64px tall, `snow` at 94% opacity with a backdrop blur and a 1px `mist` bottom border.
- From 1024px up:
  - left: the logo lockup;
  - centre: "How it works", "What I buy", "Cash vs. listing", "About";
  - right: the phone number as a text link, then a compact primary button, "Get my offer".
- Below 1024px: the logo, a 44px phone button (`tel:`, `aria-label="Call Kane at {phone}"`) and a menu button.

**Mobile menu**

- A full-width sheet listing, in order:
  1. the four main links;
  2. "Situations", "Areas I buy in", "Guides", "FAQ" and "Contact";
  3. a divider, then "Investors: join the buyers list";
  4. Call and Text buttons.
- Trap focus while it's open, close on Escape, and return focus to the menu button.

**Sticky actions** (below 1024px only)

- Three buttons: "Call", "Text", "Get my offer".
- "Get my offer" scrolls to the nearest lead form on the page and focuses its first empty field. If the page has no form, it links to `/get-cash-offer`.
- Hide the bar whenever a lead form is in view (IntersectionObserver) and whenever focus is inside a form.
- Pages always reserve bottom padding for it, so it never covers content.
- On focus-layout pages it shows Call and Text only.

**Footer**

- The static roofline crop is its top edge (3.6).
- The logo lockup and one sentence: "I buy houses, townhouses, duplexes and condos directly from owners across Greater Edmonton."
- Phone, text, email (if set) and hours.
- Three short link groups:
  - Selling: How it works, What I buy, Cash vs. listing, Situations, Areas I buy in, Guides, FAQ.
  - About: About Kane, Contact, Got a letter from me?, Investors.
  - Legal: Privacy, Terms.
- The full disclosure (`site.disclosure`) in 14px `ink-2`.
- A final line: "© {year} {legal name}. General information, not legal, tax or financial advice."
- Remove the footer's lists of eleven situations and eight cities; the hubs link to them.

**Focus layout** (`/get-cash-offer` and `/hello`)

- `FocusHeader`: logo and phone only; no navigation.
- A slim footer with the disclosure and the legal links.

### 5.3 Home (`/`)

**Metadata**

- Title (absolute): "Sell your Edmonton home as-is for cash | Aurora Home Buyers".
- Description, built from the verified flags: "Sell your Edmonton house, townhouse or condo as-is to a local buyer who shows you the math behind the offer and tells you when listing would net more." Drop a clause when its flag is off.

**Sections, in order**

1. **Hero** (`snow`).
   - Left, 7 of 12 columns:
     - H1: `heroHeadline()`.
     - Lead paragraph, starting with a 40px round founder photo if there is one: "I'm Kane. I buy houses, townhouses and condos directly from owners across Greater Edmonton. Tell me about your place and I'll show you what I'd pay, how I got there, and whether you'd do better listing it." ("how I got there" needs `explainsOfferMath`; the last clause needs `tellsWhenListingWins`.)
     - Then "Call {phone}" and "Text me" as text links, and `responseLine()` if there is one.
   - Right, 5 of 12 columns: the `LeadForm` card.
   - Bottom edge: the Aurora Roofline, with its animated ribbon.
   - Phone order: H1, lead paragraph, form, call and text links, roofline.
2. **"An offer you can check"** (`frost`).
   - Left: `SampleOffer` using the house sample.
   - Right: the intro "A number on its own doesn't tell you much. Here's what comes with mine.", then `Commitments`.
     - The math item links to `/how-it-works#how-i-calculate`.
     - The listing item links to `/cash-offer-vs-realtor`.
     - The who's-buying item links to `/about#how-i-buy`.
   - If `explainsOfferMath` is false, title the section "How I make an offer" and describe the formula without first-person promises.
3. **"Hi, I'm Kane."** (`snow`): `FounderNote`.
   - "When you call Aurora Home Buyers, you get me: the person who looks at your home, runs the numbers and signs the offer." Then `founder.shortBio` if it's set.
   - Then: "About the name: I grew up in Manning, up the Mackenzie Highway in the County of Northern Lights. The town was called Aurora until postal authorities turned the name down because of Aurora, Ontario. This business is a nod to home."
   - Link: "More about me".
   - Show the video if it's set.
4. **"How it works"** (`frost`): `Steps`.
   1. "Tell me about the place": "Fill in a two-minute form or make one phone call: the address, a few details and what's going on."
   2. "I see it": "One visit at a time that suits you, or a video walkthrough. No cleaning, no staging."
   3. "You get a written offer": "I send it {offerTimingPhrase}{, with the math laid out}. Take your time, and show it to family, a lawyer or an agent."
   4. "You choose the closing date": "We close {closingPhrase}. Lawyers on both sides handle the title, the mortgage payout and the paperwork, and you're paid through your lawyer's trust account." Then `legalFeesSentence()`.

   Link: "The full process".
5. **"What I buy"** (`snow`).
   - Intro: "Houses, townhouses, duplexes and condos across Greater Edmonton, as-is. The condition sets the price. Not sure your place fits? Send the address and I'll tell you straight."
   - Then the shown property types as a two-column list: the label, which links to the type's page if it has one, and the note underneath. No cards.
6. **Night section.**
   - H2: "Sometimes listing wins. I'll tell you when." (needs `tellsWhenListingWins`; otherwise "Cash sale or listing? Here's the math.").
   - Body, computed from the calculator example in `net-sheet.ts`, never hard-coded: "Take a house worth {arv} after {repairs} of work. Listed as-is, it would likely net about {difference, rounded to the nearest $500} more than a {cash offer} cash offer, if the owner can carry it for {months} months and handle showings and inspections. Plenty of owners should list. Others need the certainty and speed of a cash sale. The calculator shows where your place lands."
   - `NetBars` for the three nets, then an on-night button, "Run your own numbers", linking to `/cash-offer-vs-realtor#calculator`.
   - The bright ribbon runs along the top of the section.
7. **"More straight answers"** (`snow`), two columns.
   - Left: "Selling because of something hard?", with the ten situation labels as links.
   - Right: "Guides", with the three newest guides (title plus one line each) and "All guides".
   - Underneath, one line: "I buy across {cities}.", each city linked to its area page.
8. **FAQ** (`frost`): five questions, with answers built from claims.
   - "How do you work out your offer?" — "I start with what the home would likely sell for once it's fixed up, based on recent sales nearby. Then I subtract the repairs, the costs of buying, holding and reselling, and a profit. I walk you through each number."
   - "Will your offer be lower than listing?" — "Usually, yes. A cash buyer takes on the repairs, the carrying costs and the risk. What matters is what you walk away with, and how soon. If listing would likely net you more, I'll tell you."
   - "Does it cost anything to get an offer?" — "No. There's no fee to talk, no fee for an offer, no commission and no obligation to accept." Then `legalFeesSentence()`.
   - "Do you buy the home yourself, or assign the contract?" — "Either. Sometimes I buy it myself; sometimes I assign my contract to another investor who buys it. You'll know which, in writing, before you sign."
   - "How fast can you close?" — "We close {closingPhrase}. Your lawyer handles the paperwork and the money."
9. **Final call to action** (`snow`).
   - Left: H2 "Get a straight answer on your place.", one short paragraph, then the call and text links.
   - Right: `LeadForm` with `id="offer-bottom"`.

**Sample data** (`src/content/samples.ts`). Both samples are labelled "Illustrative numbers, not a real property." A test checks that every sample adds up.

House sample: "1960s bungalow in north Edmonton"

| Row | Amount | Note |
|---|---|---|
| After-repair value | 425,000 | What it would likely sell for once fixed up, based on recent nearby sales |
| Repairs | −62,000 | Roof, Poly-B replacement, kitchen, flooring and paint |
| Buying and closing costs | −4,000 | Legal fees, title insurance and adjustments |
| Holding costs | −14,000 | About four months of taxes, insurance, utilities and financing |
| Resale costs | −19,100 | Commission plus GST, and legal fees, when it's sold again |
| Profit | −42,000 | Covers my fee, plus the renovating investor's profit if I assign the contract |
| **Offer** | **283,900** | Before your mortgage payout and anything else registered on title |

Condo sample: "3-bedroom condo townhouse in a 1979 complex"

| Row | Amount | Note |
|---|---|---|
| After-repair value | 265,000 | |
| Repairs | −34,000 | Flooring, kitchen, bathroom and paint |
| Special assessment owing | −8,000 | Your share, per the notice. The contract says who pays it |
| Buying and closing costs | −3,500 | Legal fees and the condo document package |
| Holding costs | −9,200 | About four months of condo fees, taxes, insurance, utilities and financing |
| Resale costs | −14,050 | Commission plus GST, and legal fees |
| Profit | −26,500 | Covers my fee, plus the renovating investor's profit if I assign the contract |
| **Offer** | **169,750** | |

When `showsMarginInWriting` is false, `sampleOfferRows()` merges the buying, holding and resale costs and the profit into one row: "Buying, holding and resale costs, and profit" (−79,100 for the house, −53,250 for the condo). Its note reads: "What it costs to buy, carry and resell the home, and the profit that makes it worth doing."

### 5.4 Get a cash offer (`/get-cash-offer`, focus layout)

- **Metadata:** title "Get a cash offer on your Edmonton home".
- **H1:** "Get a cash offer on your Edmonton home."
- **Lead:** "Tell me about the place. I'll call you, see it, and send a written offer {offerTimingPhrase}{, with the math laid out}. No obligation."
- **Sections:**
  1. The form, prominent.
  2. A compact three-step "What happens next".
  3. `SampleOffer` (house sample).
  4. A compact `FounderNote`.
  5. Four FAQs.
- Must be 5,000px or less at 390px wide.

### 5.5 How it works (`/how-it-works`)

**Metadata:** title "How selling your home for cash works in Edmonton".
**H1:** "How selling your home to me works"

**Sections, in order**

1. **The steps.** Detailed `Steps`: what the first call covers; what happens at the visit; what the offer includes; what you'll sign; closing.
2. **"How I calculate an offer"** (`id="how-i-calculate"`). The formula as an annotated `Ledger`:
   - after-repair value (what it would likely sell for fully repaired, from recent nearby sales);
   - repairs (Kane's estimate to bring it to market condition);
   - buying, holding and resale costs (legal, taxes, insurance, utilities, condo fees, financing, and commission plus GST on resale);
   - profit (Kane's fee, plus the renovating investor's profit if he assigns); a separate line only when `showsMarginInWriting` is true;
   - equals your offer, before the mortgage payout and anything else registered on title.

   Then the house and condo samples side by side on desktop, stacked on phones.
3. **"My commitments."** `Commitments`, then `legalFeesSentence()` and `offerOpenSentence()`.
4. **"What you'll sign"** (`id="what-youll-sign"`). "The purchase contract sets out the price, the deposit and where it's held in trust, any conditions and the dates they come off, the closing date, and whether I may assign the contract. Your lawyer can review it before you sign, and you can say no to any offer." Then the disclosure.
5. **FAQ.** The three existing process questions, rewritten.
6. **Final call to action.**

### 5.6 What I buy (`/what-we-buy`)

- **Metadata:** title "What I buy: houses, townhouses and condos in Edmonton".
- **H1:** "What I buy in Greater Edmonton"
- **Intro:** "I buy homes directly from owners, as-is. Here's what that covers."
- **The types.** Each shown type from config, in order, as a section block (not a card):
  - the label as an H2;
  - the note;
  - "Selling a {label}", linking to its page if one exists;
  - a secondary button, "Get an offer on a {label, lower-case}", linking to `/get-cash-offer?type={value}`.
- **"When I'm not the right buyer"** (needs `tellsWhenListingWins`): "If your home is move-in ready and you have time to sell, listing will probably net you more, and I'll say so. If it's outside the areas I buy in, I'll tell you that too."
- **Final call to action.**

### 5.7 Property type pages (`/what-we-buy/[type]`)

**Collection.** `content/property-types/*.md`, loaded by `getPropertyTypes()` in `src/lib/content.ts`, with this frontmatter:

```yaml
title: "..."          # 65 characters or fewer
description: "..."    # 110–160 characters
h1: "..."
label: "Condo townhouses"
leadValue: "Condo townhouse"   # must be a PROPERTY_TYPES value; preselects the form
summary: "..."        # one or two sentences, used in lists
order: 1
featured: true
answer: "..."         # 40–60 words; the StraightAnswer callout
question: "..."       # the StraightAnswer question
sample: condo         # which sample ledger to show: house | condo
related: [sell-rental-property-with-tenants, sell-inherited-house]  # situation slugs
draft: false
faqs:
  - q: "..."
    a: "..."
```

Validate it in the content tests:

- `leadValue` must be a `PROPERTY_TYPES` value;
- the title, description and answer must be within their lengths;
- there must be at least three FAQs;
- related slugs must exist.

**Template**

1. A hero with the form, with `leadValue` preselected.
2. `StraightAnswer`.
3. The Markdown body.
4. `SampleOffer` (per `sample`).
5. FAQ.
6. Related situations.
7. A final call to action.

Draft pages render only when `showDrafts()` is true, and never enter the sitemap.

**Launch files**

`condo-townhouses.md` is the flagship (`featured: true`). Migrate it from `content/situations/sell-condo-townhouse.md`, rewrite it in Kane's voice without the over-claims, then delete the old file (the redirect covers it).

- Question: "Can I sell my condo townhouse as-is if there's a special assessment?"
- Answer: "Yes. A special assessment doesn't stop a sale; it changes the math. Tell me the amount and the date on the notice. The contract will say who pays it, and my written offer shows it as its own line, so you can see exactly how it affects your price."
- The body covers:
  - why older complexes can be slow to sell (fees, reserve funds, special assessments, condo-document conditions, lender and insurance questions, bylaws);
  - when a direct sale fits;
  - how Kane handles condo documents, fee arrears and assessments;
  - selling with a tenant in place.
- Keep the Alberta details correct and hedged.

`half-duplexes.md` is written but stays `draft: true` until Kane confirms. It covers shared walls and roofs, basement suites, and selling one side.

How to add a type later goes in `docs/content-playbook.md`: write the Markdown file, check the config line, run the checks.

### 5.8 Cash offer vs. listing (`/cash-offer-vs-realtor`)

**Metadata:** title "Cash offer vs. realtor in Alberta: net proceeds calculator".
**H1:** "Cash offer or listing: which puts more in your pocket?"

**Sections, in order**

1. **Intro:** "The highest price isn't always the most money in your pocket. Here's an honest way to compare, with your own numbers."
2. **The calculator** (`id="calculator"`).
3. **"What each path costs you".** A neutral table: rows for the price you get, repairs, commission and GST, legal fees, carrying costs, conditions and risk, time, and your effort; columns for repair-and-list, list as-is and cash sale. Plain text in every cell: no check or X icons, no highlighted column. On phones it becomes stacked definition lists, with no sideways scrolling.
4. **"When listing is usually better" and "When a cash sale is usually better".** The existing lists, rewritten.
5. **FAQ:** three questions.
6. **Final call to action.**

**The calculator.** Put the math in `src/lib/net-sheet.ts`, moved out of the page file and unit-tested, and the UI in `src/components/calculator/NetProceedsCalculator.tsx` (a client component).

Inputs, with defaults from the existing worked example:

| Input | Label | Default |
|---|---|---|
| `arv` | Likely sale price after repairs | 400,000 |
| `asIsPrice` | Likely sale price as-is, listed | 335,000 |
| `repairs` | Repairs to get the top price | 45,000 |
| `monthly` | Monthly carrying costs (help text: mortgage interest, property taxes, condo fees, insurance and utilities) | 2,200 |
| `monthsRepairList` | Months to repair and sell | 5 |
| `monthsAsIs` | Months to sell as-is | 4 |
| `commission` | "Common Alberta structure: 7% on the first $100,000 and 3% on the rest, plus GST" (default), or a flat rate (default 4%) with a GST toggle (default on) | Structure |
| `legal` | Legal fees and mortgage discharge | 1,500 |
| `repairCredit` | Credit to the buyer after inspection (repaired home) | 4,000 |
| `asIsCut` | Price cut after inspection (as-is) | 10,000 |
| `cashOffer` | A cash offer you have (optional) | blank |

Constants: `cashMonths` = 0.5. Legal fees drop out of the cash path only when `coversLegalFees` is verified; pass that flag in from the server component.

Outputs:

- The net for each path, `NetBars`, and the time each path takes.
- With no cash offer entered, the break-even sentence: "In this scenario, a cash offer above {break-even} would beat listing as-is." The break-even is the as-is net plus the seller's legal fees (unless covered) plus the cash-path carrying costs.
- With a cash offer entered, the difference from each listing path, in words.
- Results are announced with `aria-live="polite"`.

Also:

- A "Reset to the example" button.
- The note: "An estimate for comparing options, not financial or legal advice."
- Inputs use `inputmode="numeric"` and format with thousands separators on blur.
- Events: `calculator_interact` on the first change and `calculator_offer_entered` when a cash offer is entered.

Tests with the example defaults:

| Case | Expected |
|---|---|
| Repair-and-list net | 321,700 |
| List as-is net | 299,947 |
| Cash net on a 265,000 offer, legal fees not covered | 262,400 |
| Cash net, legal fees covered | 263,900 |
| Break-even, legal fees not covered | 302,547 |

Also test the flat rate, the GST toggle, and empty or invalid inputs.

### 5.9 About (`/about`)

- **Metadata:** title "About Kane and Aurora Home Buyers in Edmonton". Add `Person` JSON-LD (Section 7.3).
- **H1:** "Hi, I'm Kane."
- **Intro,** with the portrait if there is one: "I run Aurora Home Buyers. I buy homes directly from owners across Greater Edmonton: {shown types in plain words}, as-is. When you call, you get me." Then `founder.shortBio`.
- **"Why Aurora":** the full story from 2.4, with "Source: The Canadian Encyclopedia" in fine print.
- **"How I buy"** (`id="how-i-buy"`): "I'm not a realtor, and I don't list homes. I buy them. Sometimes I buy a home myself; sometimes I sign a contract to buy it and assign that contract to another investor. Either way, you'll know which, in writing, before you sign." Then the formal disclosure block.
- **"What I've committed to":** `Commitments`.
- **Video,** if it's set.
- **Final call to action,** with the phone number.
- Delete the "many homeowners we meet" and "Most of the homes we buy…" copy.

### 5.10 Promise items

`claims.promiseItems()` returns these, in this order, filtered by their flags. The same items appear on the home, How it works and About pages.

| Flag | Title | Sentence |
|---|---|---|
| `explainsOfferMath` | You see the math | "Your offer comes with the after-repair value, the repair estimate and my costs, so you can check my work." With `showsMarginInWriting`: "Your written offer lists the after-repair value, the repairs, my costs and my profit, line by line." |
| `tellsWhenListingWins` | You hear it when listing wins | "If you'd likely net more by listing with an agent, I'll tell you, and show you the comparison." |
| `assignmentDisclosedBeforeSigning` | You know who's buying | "I either buy your home myself or assign my contract to another investor. Either way, you'll know in writing before you sign." |
| `noRetrades` | The price holds | "Once we agree on a price, I don't cut it unless something new and material turns up that neither of us knew about, and I'll show you what it is." |

`closeInDays`, `offerWithinHours` and `coversLegalFees` are phrases and sentences rather than items (see 2.5).

### 5.11 Thank you (`/thank-you`, noindex)

- **H1** (centred), built from `sessionStorage` by a small client component: "Thanks, {firstName}. I've got your request." Without a name: "Thanks. I've got your request."
- **Next line:**
  - with `responsePromise.duringHours` set: "I'll call you {duringHours} from {phone}. After hours, I'll call {afterHours}."
  - otherwise: "I'll call you from {phone}. Save the number so you know it's me."
  - Add "I've also emailed you a copy." when `hasEmail` is true and seller emails are on.
- **Booking** (if `bookingUrl` is set): "Rather pick a time?", with a "Book a call" button. Fire `booking_click`.
- **"If you have them handy"** (none of it is required):
  - For everyone: a recent mortgage statement or payout amount, and anything you know the place needs.
  - Condo types add: the monthly condo fee, any special assessment notice, and the latest AGM minutes, budget and reserve fund study.
  - When occupancy is `Tenanted`: the lease and the monthly rent.
- **"While you wait":** links to "How I calculate an offer", the calculator, and "How to spot a legitimate cash home buyer".
- **A compact `FounderNote`.**
- Keep it `noindex` and disallowed in `robots.txt`.

### 5.12 Contact (`/contact`)

- **H1:** "Talk to Kane"
- **Contact methods** as plain rows, not icon tiles: call, text, email (if set), hours and areas.
- **The form,** then the booking link if it's set.

### 5.13 Got a letter from me? (`/hello`, focus layout, noindex)

The campaign QR codes and letters point here.

- **H1:** "Got a letter or a door hanger from me?"
- **Intro,** with the founder photo: "That was me, Kane. I'm a real person, and I buy homes directly from owners in Edmonton. Here's who I am, why you heard from me, and how to take yourself off my list."
- **"Why you heard from me":** "I contact owners in neighbourhoods where I buy homes. There's no catch and no cost to talk. If you're not thinking about selling, that's the end of it." Add one sentence on where addresses come from only after Kane confirms it (TO CONFIRM).
- **"Thinking about selling?":** the form.
- **"Not interested? I'll take you off my list.":** `OptOutForm`.
- **"How to check I'm legit":**
  - search "Aurora Home Buyers Edmonton" to find the Google Business Profile, once it's live;
  - "I never ask for money up front. Real estate lawyers handle the paperwork and the money.";
  - "Have your own lawyer review anything before you sign.";
  - a link to the guide "How to spot a legitimate cash home buyer".
- Leave it out of the sitemap and navigation. The footer link "Got a letter from me?" points here.

### 5.14 Situations (`/situations`, `/situations/[slug]`)

**Hub**

- Title: "Selling your house in a difficult situation in Edmonton". This replaces "any situation", a banned phrase.
- H1: "When selling isn't simple"
- Intro: "Foreclosure, an inheritance, a separation, tenants, repairs you can't afford, a move for work. Here's what to know about each, and how a direct sale works."
- Then a clean list of the ten situations.

**Template**

1. A hero with the form, with the reason preselected.
2. `StraightAnswer`.
3. The body.
4. FAQ.
5. Related guides.
6. A final call to action.

Add a required `answer` field (40–60 words) and a `question` field to every situation's frontmatter (Section 6.4).

### 5.15 Areas (`/we-buy-houses`, `/we-buy-houses/[city]`)

Keep the eight areas. The city template keeps:

1. a hero with the form;
2. the local intro;
3. local details;
4. a compact "What I buy in {city}" list;
5. the city FAQ;
6. nearby areas.

Remove `ValueProps`, `ComparisonTable` and the generic situations grid from city pages.

Rewrite `src/content/locations.ts` so it describes the housing stock and the situations sellers face in each area. It must never claim how often Kane buys there (Section 6.2). The existing uniqueness test stays.

### 5.16 Guides (`/blog`, `/blog/[slug]`)

**Article layout**

- Byline "By Kane" (the default `author` is `founderDisplayName()`), with a small avatar if there's a photo, plus the date and reading time.
- `StraightAnswer` when the post has `answer` frontmatter.
- A table of contents.
- On phones, an inline call to action after the third H2; on desktop, a sticky form in the sidebar.
- Related guides at the end.
- `BlogPosting` JSON-LD with the author as the founder `Person`.

**Index.** Use a clean list grouped by category; drop the grid of identical cards.

### 5.17 FAQ (`/faq`)

- Group the questions under "Offers and money", "The process", "Situations and property types" and "About me".
- Rewrite every answer to the voice rules and claims. Add "Who are you?", answered in first person.
- Keep the FAQPage JSON-LD on this page only.

### 5.18 Investors (`/investors`)

- Remove it from the header and mobile main navigation; it stays in the footer and at the bottom of the mobile menu.
- Restyle it with the new system.
- Build "What I buy" from `site.propertyTypes`. Delete "Our specialty" and "within a day or two".
- Add: "I share deals privately, by email and text, only with people on this list. I don't advertise specific properties publicly."
- Keep the form, consent text and expectations.

### 5.19 Legal pages and 404

- Restyle `LegalPage`, and update the privacy policy per Section 9.
- 404:
  - H1: "That page isn't here."
  - Links to the home page, "Get my offer" and "How it works", plus the phone number.

### 5.20 Page-length budgets

| Page | 390×844 | 1440×900 |
|---|---|---|
| Home | 7,600px or less | 5,600px or less |
| Get a cash offer | 5,000px or less | |

The screenshot script prints every page's height and warns when a budget is exceeded. Fix overruns by cutting, not by shrinking type.

---
## 6. Content and copy

### 6.1 Rules that apply to every word

- The voice rules and banned phrases in 2.3.
- Every promise comes from `claims.ts` (2.5).
- Every legal, tax or financial statement stays general, Alberta-correct and hedged, with the existing "talk to a lawyer or accountant" lines.
- No statistic without a linked source.
- No invented reviews, testimonials, deal counts or years in business.

### 6.2 Specific fixes

Fix every item below, then search the whole repo with the banned list and patterns from 2.3 and fix whatever else turns up. The claims test must pass with no allowlist.

| File | Fix |
|---|---|
| `src/components/sections.tsx` | Delete the old section components. Their copy ("We've seen it before", "we've helped homeowners through it", "fair, no-obligation cash offer within…", "Fair cash price") goes with them. |
| `src/components/LeadForm.tsx` | Default title becomes "What would you get for your place?" (4.1). |
| `src/components/SiteFooter.tsx` | Replace "in any condition and any situation" with the footer copy in 5.2. |
| `src/config/site.ts` | New tagline (2.1). |
| `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/how-it-works/page.tsx` | Build descriptions from claims; no raw `closeInDays`. |
| `src/app/get-cash-offer/page.tsx` | Title and H1 per 5.4. |
| `src/app/situations/page.tsx`, `src/app/situations/[slug]/opengraph-image.tsx` | Title, subtitle, alt text and fallback per 5.14; remove "any situation". |
| `src/app/we-buy-houses/page.tsx`, `src/app/we-buy-houses/[city]/page.tsx` | Remove "fair, no-obligation offer", "Fair offer in {hours} hours" and "come to us… the most common". |
| `src/app/about/page.tsx` | Rewrite per 5.9. |
| `src/app/faq/page.tsx`, `src/content/faqs.ts` | Remove "ask us most", "buy most often", "regularly" and "any condition and any situation"; use claims (5.17). |
| `src/app/investors/page.tsx` | Per 5.18. |
| `src/app/llms.txt/route.ts` | Rewrite per 7.4. |
| `src/lib/schema.ts` | New description; see 7.3. |
| `src/content/locations.ts` | Remove "a normal purchase for us", "Sellers there often call us", "Vacant houses are a common purchase" and "within a day or two". Describe places, not Kane's volume. |
| `content/situations/sell-house-that-needs-repairs.md` | "Problems we regularly buy through" becomes "Problems that don't stop a sale". |
| `content/situations/sell-house-when-downsizing.md` | Remove "Without the Hassle" from the H1. |
| `content/situations/sell-condo-townhouse.md` | Migrate to `content/property-types/condo-townhouses.md` (5.7), then delete. |

### 6.3 Placeholders

Eleven content files use `{{closeDays}}` or `{{offerHours}}`, 18 times in all. Replace them with `{{closingPhrase}}`, `{{offerTimingPhrase}}` and `{{legalFeesSentence}}` (2.5). Rewrite each sentence so it reads naturally with either version of the phrase, for example "You choose the closing date, and we close {{closingPhrase}}."

### 6.4 Straight answers

Add `question` and `answer` (40–60 words) to all ten situations, and optionally to guides. Write them as direct, general answers.

Example for foreclosure:

- Question: "Can I still sell my house if it's in foreclosure in Alberta?"
- Answer: "Usually, yes. In Alberta you can generally sell until the court approves a sale or the lender takes title, and a sale can pay out the mortgage and stop the process. Timelines vary, so talk to a lawyer early and tell me where things stand."

Check every answer against the page's own body text; the answer must not claim more than the body does.

### 6.5 Guide dates and author

- Set each guide's `date` to the day its file was first committed:

  ```
  git log --diff-filter=A --follow --format=%as -- <file> | tail -1
  ```

  Add `updated` when you change a guide substantially.
- `author` defaults to `founderDisplayName()`.
- A content test fails if any date is in the future.

### 6.6 Three new guide drafts

Write these with `draft: true` and Kane's byline. Put `<!-- VERIFY: … -->` above every statement that depends on law, regulation, a fee or a number, and link a primary source where one exists. Each ends with a short call to action and links to the relevant property-type or situation page and to the calculator.

1. **`selling-condo-special-assessment-alberta.md`**, "Selling a condo with a special assessment in Alberta":
   - what an assessment is;
   - who pays when you sell, which depends on the notice and the purchase contract;
   - where it shows up in the condo documents;
   - the options: pay it, credit the buyer, or sell as-is;
   - how it appears as its own line in a written offer.
2. **`condo-documents-alberta.md`**, "The condo documents buyers ask for in Alberta":
   - the documents a buyer's lawyer typically requests (estoppel certificate, bylaws, budget, financial statements, reserve fund study and plan, AGM minutes, insurance certificate);
   - why deals fall through at the condo-document condition;
   - how to request them early, and what the regulations allow a corporation to charge (VERIFY).
3. **`selling-house-poly-b-edmonton.md`**, "Selling a house with Poly-B plumbing in Edmonton":
   - what Poly-B is and why insurers and lenders ask about it;
   - the options: replace it, credit the buyer, or sell as-is;
   - cost ranges only with a source.

### 6.7 Content playbook

Write `docs/content-playbook.md` for Kane and future Claude Code sessions. It covers:

- the voice rules and banned phrases;
- the claims system;
- how to add a property type, a city, a guide and a FAQ;
- how to mark something a draft and preview it;
- a future "deal notes" format, described but not built: real, anonymized deals with the seller's written permission, shown as a ledger.

---

## 7. SEO and structured data

### 7.1 Site URL, environments and indexing (replaces PR #2)

```ts
// src/config/site.ts
function resolveSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) return explicit.replace(/\/+$/, "");
  const vercel =
    process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL;
  if (vercel) return `https://${vercel}`;
  return "http://localhost:3000";
}
```

In `src/lib/env.ts`:

- `isFinalDomain(url)` is false for `*.vercel.app`, `*.netlify.app`, `*.pages.dev`, `*.onrender.com`, `example.com`, `localhost` and `127.0.0.1`.
- `isIndexable()` is `deployEnv() === "production" && isFinalDomain(site.url) && process.env.SITE_INDEXABLE !== "false"`.

**`robots.ts`**

- When the site isn't indexable, disallow everything.
- Otherwise allow everything except `/api/`, `/thank-you`, `/hello`, `/go/` and `/styleguide`, and point to the absolute sitemap URL.

**Belt and braces.** The root layout also sets `robots: { index: false, follow: false }` whenever the site isn't indexable.

**Rules**

- Never read `site.url` in a client component; pass it down as a prop.
- `example.com` must not appear anywhere in a build (enforced by `scan:build`).

### 7.2 Titles and descriptions

Use the titles given in Section 5. For every other page, keep the current titles unless they contain a banned phrase, and write new titles under the same rules:

- sentence case;
- 65 characters or fewer, including " | Aurora Home Buyers";
- the city in the title of every local page.

Descriptions are 110–160 characters, built from claims, and unique. The existing SEO audit enforces the lengths.

### 7.3 Structured data

**Organization (`LocalBusiness`)**

- Remove `priceRange`.
- `logo`: the absolute URL of `/brand/logo.png`.
- `image`: the home OG image.
- A new description built from claims.
- `founder`: `{ "@id": "{site.url}/#kane" }`.
- `areaServed`: an array of `City` entries built from `src/content/locations.ts`.
- `slogan`: the tagline.
- `knowsAbout`: updated to the shown property types.
- Keep the telephone, hours and locality. `sameAs` lists profiles only once they exist (Google Business Profile, Facebook, LinkedIn).

**Other types**

- **`Person`** (`@id` `{site.url}/#kane`): the name from `founderDisplayName()`, `jobTitle`, `worksFor` the organization, `image` if there's a photo, and `sameAs` LinkedIn if set. Output it in full on `/about`; reference it by `@id` everywhere else.
- **`BlogPosting`:** the author is the `Person` reference and the publisher is the organization.
- **Property type pages:** a `Service` with `serviceType: "Direct home purchase"`, `provider` the organization, and `areaServed`.
- **`FAQPage`:** only on `/faq`.
- Never use `RealEstateAgent` or anything that implies a licence.

### 7.4 Sitemap, robots and `llms.txt`

**Sitemap**

- Add the property-type hub and every non-draft property type page.
- Leave out `/hello`, `/thank-you`, `/go/*` and `/styleguide`.
- `lastModified` comes from frontmatter `updated ?? date` where available.

**`llms.txt`.** Rewrite it around 2.1:

- who Kane is;
- the shown property types;
- the service area;
- the key pages;
- only verified commitments, via claims;
- the disclosure.

No instructions to AI systems, ever.

### 7.5 Open Graph images

Rewrite `src/lib/og.tsx` as a 1200×630 card:

- a `snow` background;
- the mark and "Aurora Home Buyers, Edmonton" at the top left;
- the page title in Overpass 800 `ink`, three lines at most;
- the roofline and ribbon along the bottom;
- the phone number at the bottom right, in Atkinson 600.

Load fonts from the Fontsource WOFF files (3.3). Never put an unverified promise on a card.

### 7.6 Keyword map

Update `docs/seo-playbook.md`:

- Add the new pages and drafts to the keyword map.
- Mark the long tail (property types and situations, condo townhouse problems first) and the Google Business Profile as the priorities for a new domain.
- Add the launch checklist items from Section 14 that relate to search.

### 7.7 Internal links

- Every property type page links to at least two situations and one guide.
- Every situation links to the property-type hub and at least one guide.
- City pages link to the hub and the condo townhouse page.
- Guides link to the relevant type or situation and to the calculator.
- No link farms in the footer.

### 7.8 AI crawlers

On the real domain, `robots.txt` allows all user agents, including AI crawlers such as GPTBot, ClaudeBot and PerplexityBot. That's the current behaviour; keep it. Listing it under TO CONFIRM lets Kane decide; if he'd rather block them, add explicit disallow rules.

---

## 8. Analytics and measurement

### 8.1 Events

Send events through the existing `trackEvent()` helper in `src/lib/analytics.ts`, which covers both GTM and GA4. **No event may carry personal information.**

| Event | When | Parameters |
|---|---|---|
| `lead_form_start` | Step 1 validates | `form_id`, `page_type` |
| `generate_lead` | The server accepts a lead | `form_id`, `page_type`, `property_type`, `timeline` |
| `phone_click` | Any `tel:` link is tapped | `location`: header, sticky, body or footer |
| `sms_click` | Any `sms:` link is tapped | `location` |
| `booking_click` | The booking link is used | `location` |
| `calculator_interact` | First change to a calculator input | |
| `calculator_offer_entered` | A cash offer is entered | |
| `buyer_signup` | The server accepts a buyer | |
| `opt_out_submit` | The server accepts an opt-out | `channel` |

Add a `ClickTracker` client component to the root layout. It uses event delegation on `a[href^="tel:"]`, `a[href^="sms:"]` and `[data-track]`.

### 8.2 Attribution

Extend `src/lib/attribution.ts`:

- **First touch** (UTM parameters, `gclid`, landing page, referrer and time) is kept in `localStorage` for 30 days, wrapped in try/catch.
- **Last touch** is kept in `sessionStorage`.
- Both are sent with seller leads and opt-outs, and written into the Airtable notes as today. Don't add new Airtable fields.

### 8.3 Optional tools, off by default

- **Microsoft Clarity** (`NEXT_PUBLIC_CLARITY_ID`): free heatmaps and session recordings. Load it after the page is interactive. Kane sets masking to "Strict" in Clarity.
- **Cloudflare Turnstile** (`NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY`): free, invisible bot checks. Turn it on only if spam gets past the honeypot. Verify tokens on the server.

When either is enabled, the privacy policy names it.

---

## 9. Compliance and privacy

Kane's lawyer reviews the final wording of everything in this section before launch (Section 14).

**Competition Act.** Claims are gated by the verified flags; the banned-phrase tests run; samples are labelled illustrative; there are no testimonials or reviews until real ones exist; the "Unconfirmed" tag never ships.

**Disclosure.** It appears in the footer of every page, and on `/terms`, `/faq`, `/about#how-i-buy` and `/how-it-works#what-youll-sign`. A test checks the built HTML of those pages.

**CASL**

- The buyers-list consent stays as it is.
- Seller texts go only with consent, and include the sender's name and STOP.
- Seller emails identify the sender, give contact details and an opt-out.
- Opt-outs are honoured within 10 business days; the playbook tells Kane how.

**Privacy (Alberta PIPA).** Update `content/legal/privacy.md` to cover:

- what's collected, including the 30-day first-touch attribution;
- why it's collected;
- the service providers by name: the website host, Airtable, Resend, Google (Tag Manager, Analytics, Sheets), and, when enabled, Quo, ntfy (no personal information is sent), Cloudflare Turnstile and Microsoft Clarity;
- that some providers are in the United States, so information may be stored or processed outside Canada;
- how long information is kept;
- how to access or correct it, or withdraw consent;
- who to contact with questions.

**Real estate licensing (RECA)**

- Never advertise a specific property publicly: not on the Investors page, not on social cards, not in guides.
- Never describe Kane as an agent, a realtor or licensed.
- The buyers-list process and the assignment contracts get a lawyer's review.

**Accessibility.** WCAG 2.1 AA. Nothing below 14px, touch targets of at least 44px, visible focus, and reduced motion honoured.

---

## 10. Environment variables

Document all of these in `.env.example` and the README. Never commit secrets.

| Variable | When needed | Purpose |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | Production | Canonical origin, e.g. `https://yourdomain.ca` |
| `SITE_ENV` | Hosts other than Vercel | `production`, `preview` or `development` (Vercel sets `VERCEL_ENV`) |
| `SITE_INDEXABLE` | Optional | Set to `false` to keep a real domain out of search |
| `NEXT_PUBLIC_PREVIEW_UNCONFIRMED` | Preview builds | `true` shows gated items with tags; ignored in production |
| `AIRTABLE_TOKEN`, `AIRTABLE_BASE_ID` | One durable sink required | Seller Leads and Buyers tables |
| `AIRTABLE_OPTOUT_TABLE` | Optional | Opt-outs table (field names TO CONFIRM) |
| `LEAD_WEBHOOK_URL`, `LEAD_WEBHOOK_SECRET` | Recommended | Google Sheets backup (its URL includes `?secret=`) and any other webhooks, comma-separated |
| `RESEND_API_KEY`, `LEAD_EMAIL_TO`, `LEAD_EMAIL_FROM` | One owner alert required | Owner alert emails and seller confirmations |
| `SELLER_ACK_EMAIL` | Optional (default on) | Confirmation email to sellers who gave one |
| `QUO_API_KEY`, `QUO_FROM_NUMBER`, `QUO_NOTIFY_TO` | Once Kane has Quo | Texts to Kane; seller confirmation texts |
| `QUO_API_BASE` | Optional | Defaults to `https://api.openphone.com` |
| `SELLER_ACK_SMS` | Optional (default off) | Text consenting sellers, 08:00–21:00 Edmonton time |
| `NTFY_TOPIC_URL`, `NTFY_TOKEN` | Optional | Instant push to Kane's phone, with no personal information |
| `NEXT_PUBLIC_GTM_ID` or `NEXT_PUBLIC_GA_ID` | Recommended | Analytics |
| `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION`, `NEXT_PUBLIC_BING_SITE_VERIFICATION` | Launch | Search Console and Bing Webmaster Tools |
| `NEXT_PUBLIC_CLARITY_ID` | Optional | Heatmaps |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY` | Optional | Bot check |

---

## 11. Tooling, tests and CI

### 11.1 Dependencies

- Dependencies: `@fontsource/overpass` and `@fontsource/atkinson-hyperlegible-next` (OG fonts).
- Dev dependencies: `playwright`, `@axe-core/playwright`, `qrcode` and `cross-env`.
- Before the first screenshot run: `npx playwright install chromium`.

### 11.2 Scripts (`package.json`)

- `build:preview`: `cross-env SITE_ENV=preview NEXT_PUBLIC_PREVIEW_UNCONFIRMED=true next build`
- `screenshots`: `node scripts/screenshots.mjs`
- `a11y`: `node scripts/a11y.mjs`
- `scan:build`: `node scripts/scan-build.mjs`
- `qr`: `node scripts/qr.mjs` (4.8)

### 11.3 What each script does

**`scripts/screenshots.mjs`**

- `BASE_URL` defaults to `http://localhost:3000`.
- Routes: every sitemap URL, plus `/thank-you`, `/hello`, `/styleguide` (when it returns 200) and a missing path for the 404.
- Viewports 390×844 and 1440×900. For each, save a full-page PNG and an above-the-fold PNG to `screenshots/{label}/{route}-{viewport}.png`, with `--label` (default: a timestamp).
- Print a table of page heights, with the budget warnings from 5.20.
- Add `screenshots/` to `.gitignore`.

**`scripts/a11y.mjs`**

- Same routes; axe with the `wcag2a`, `wcag2aa`, `wcag21a` and `wcag21aa` tags.
- Exit with code 1 on any serious or critical violation.
- Also fail if any visible text renders below 14px, and warn on touch targets smaller than 44px at 390px wide.

**`scripts/scan-build.mjs`**

Scan the prerendered HTML under `.next/server/app` and fail, printing the file and a snippet, on:

- banned phrases and patterns (2.3);
- `example.com`;
- "Unconfirmed" or "Draft" tags in a production build;
- promise text whose flag is off, such as "{n} hours", "{n} days" next to "close" or "offer", or "I pay your standard legal fees".

### 11.4 Tests (Vitest, in `tests/` as now)

Keep the banned phrases and patterns in one shared file outside `src/` and `content/` (for example `tests/banned-phrases.mjs`), imported by both the claims test and `scripts/scan-build.mjs`, so the scan never flags the list itself.

- **`claims.test.ts`:** each export under each flag state; banned phrases and patterns absent from `src/` and `content/`; old placeholders absent.
- **`net-sheet.test.ts`:** the values in 5.8.
- **`samples.test.ts`:** the samples add up, and the combined row equals the sum of its parts.
- **Sinks, notifications and opt-outs:** the tests listed at the end of Section 4.
- **`env.test.ts`:** `resolveSiteUrl`, `isFinalDomain`, `isIndexable` and `deployEnv`.
- **Content tests:** property types, straight answers, dates not in the future, author defaults.
- **SEO tests:** new routes, the redirect, sitemap exclusions and the disclosure on the required pages.

### 11.5 CI

Update `.github/workflows/ci.yml`:

1. After `npm run build`, run `npm run scan:build`.
2. Install Chromium with `npx playwright install --with-deps chromium`.
3. Start the server as today, then run `npm run seo:audit` and `npm run a11y`.

### 11.6 Performance budgets

On a production build of the home page:

- LCP 2.0 seconds or less, CLS 0.05 or less and TBT 150ms or less, measured with Lighthouse mobile (Chrome DevTools, or `npx lighthouse http://localhost:3000 --form-factor=mobile --only-categories=performance`);
- 130 KB or less of first-load JavaScript, gzipped, as reported by `next build`.

The hero has no raster image, so the LCP element is the H1. Put the Lighthouse results in the pull request.

---
## 12. Build phases

Each phase ends with `npm run check`, `npm run build` and a commit (rule 3). Phases that change pages also end with screenshots and a critique (rule 4).

**Phase 0: setup and baseline**

1. Save this brief and create the branch.
2. Run `npm ci` and confirm the current checks and build pass.
3. Add the Playwright and axe dev dependencies, `scripts/screenshots.mjs` and `scripts/a11y.mjs`.
4. Capture the `before` screenshots. Record the current accessibility results, but don't fix them yet.

**Phase 1: foundations**

- `src/lib/env.ts`; the site URL, indexing, `robots.ts` and noindex rules (7.1).
- The config additions (2.5), `claims.ts`, the placeholder migration (6.3), preview and draft handling, and `placeholderWarnings()`.
- Route every existing hard-coded promise through claims now, so production is truthful even before the redesign lands.
- `scan-build.mjs`, the claims and env tests, and the launch guard (4.10).
- **Done when:** a production build contains no unverified promise and no `example.com`.

**Phase 2: design system**

- The tokens, fonts, logo and icons, the Aurora Roofline, every UI component, the header, mobile menu, sticky actions, footer and focus header, and `/styleguide`.
- **Done when:** the styleguide shows every state, passes `a11y`, and shows none of the tells in 3.10.

**Phase 3: lead system**

- Everything in Section 4: the form, pipeline, sinks, alerts, confirmations, templates, opt-outs, campaign links, QR script, buyers-form restyle, the Sheets script, `docs/integrations/README.md`, and tests.
- **Done when:** every Section 4 test passes, and the 502 fallback has been checked by hand.

**Phase 4: core pages**

- Home, Get a cash offer, How it works, About, Thank you, Contact, `/hello` and the 404, with the new shell applied site-wide.
- **Done when:** the page-length budgets are met and `a11y` passes.

**Phase 5: calculator**

- `net-sheet.ts` and its tests, the calculator, and the rebuilt comparison page.
- **Done when:** it works with a keyboard and a screen reader, and nothing scrolls sideways at 390px.

**Phase 6: property types**

- The collection, loader and validation; the hub; the template; the condo townhouse flagship; the half duplex draft; the redirect; the sitemap; internal links.

**Phase 7: content pass**

- Situations (answers, claims, template), areas, the FAQ, guides (dates, byline, template, index), Investors, and the legal and privacy updates.
- The three guide drafts and the content playbook.

**Phase 8: SEO and analytics**

- Schema, OG images, `llms.txt`, the final sitemap and robots, a review of every title and description, and the keyword map.
- Events, `ClickTracker`, attribution, the optional Clarity and Turnstile switches, and the CI updates.

**Phase 9: docs, QA and pull request**

1. Update `CLAUDE.md` (the new rules: claims, voice, banned phrases, property types, design tokens, no Vercel-only products, screenshot and a11y scripts), `README.md`, `.env.example` and `docs/seo-playbook.md`. Write `docs/brand.md`, with tokens, type, logo usage, photo rules and voice.
2. Run everything: `check`, `build`, `scan:build`, `seo:audit`, `a11y`, then `after` screenshots in both preview and production mode, plus Lighthouse.
3. Look at every page at 390px wide with your own eyes, and fix what's off.
4. Open the pull request (rule 9).

---

## 13. TO CONFIRM (Kane)

Until each item is confirmed, the site uses the default shown, and nothing unconfirmed appears in production.

| # | Question for Kane | Where it goes | Default until confirmed |
|---|---|---|---|
| 1 | Last name on the site? | `founder.lastName` | "Kane" |
| 2 | Portrait photos | `public/images/kane/`, `founder.photo`, `photoAlt` | Layouts without photos |
| 3 | A one- or two-sentence bio | `founder.shortBio` | Hidden |
| 4 | LinkedIn, signature, intro video | `founder.*` | Hidden |
| 5 | How fast you reply during business hours | `responsePromise.duringHours` | No promise |
| 6 | Can you reliably close in 7 days? | `verified.closeInDays` | "On the date you choose" |
| 7 | Can you reliably send an offer within 24 hours of seeing a home? | `verified.offerWithinHours` | "After I've seen the place" |
| 8 | Do you pay sellers' standard legal fees? | `verified.coversLegalFees` | Not mentioned |
| 9 | Will written offers itemize your profit? | `verified.showsMarginInWriting` | Costs and profit shown as one line |
| 10 | No price cuts after agreement unless something new turns up? | `verified.noRetrades` | Not mentioned |
| 11 | How many days does an offer stay open? | `offerStaysOpenDays` | Not mentioned |
| 12 | Which property types to show now | `propertyTypes[].show` | All six |
| 13 | Publish the half duplex page? | `half-duplexes.md` `draft` | Draft |
| 14 | Service areas | `src/content/locations.ts` | The current eight |
| 15 | Business hours | `site.hours` | Mon–Sat, 8am–8pm |
| 16 | Public email address | `site.email` | Hidden |
| 17 | Domain | `NEXT_PUBLIC_SITE_URL` | Not indexed |
| 18 | Long-term public phone number | `site.phone` | (780) 836-5156 |
| 19 | Booking link | `bookingUrl` | Hidden |
| 20 | Registered legal name | `site.legalName` | "Aurora Home Buyers" |
| 21 | Your finished logo | `public/brand/logo.svg` | Interim mark |
| 22 | Where letter addresses come from (optional sentence) | `/hello` | Sentence left out |
| 23 | Airtable opt-out table and field names | `AIRTABLE_OPTOUT_TABLE` | Sheets and email only |
| 24 | Allow AI crawlers? | `robots.ts` | Allowed |
| 25 | Seller confirmation texts once Quo is set up? | `SELLER_ACK_SMS` | Off |

---

## 14. Kane's launch checklist

Claude Code: copy this list into the pull request description.

**Before launch**

1. **Buy the domain.** A short `.ca` with no hyphens: `aurorahomebuyers.ca` if it's available, otherwise add "edmonton" or "yeg". Add it to the Vercel project and set `NEXT_PUBLIC_SITE_URL`. Vercel is a real host; the `vercel.app` address is only its default name, and your domain simply points at it.
2. **Upgrade to Vercel Pro** before taking leads. Hobby doesn't allow commercial use. If you ever move hosts, the code is portable.
3. **Make the GitHub repository private.**
4. **Lock the public phone number** before creating any profile or printing anything. If (780) 836-5156 is your personal cell, choose the business number first. Quo can port an existing number if you'd rather keep this one.
5. **Resend.**
   - Verify your domain (a few DNS records) and create an API key.
   - Set `RESEND_API_KEY`, `LEAD_EMAIL_TO` and `LEAD_EMAIL_FROM` (for example, "Kane at Aurora Home Buyers <kane@yourdomain.ca>").
   - On your phone, turn on priority notifications for that sender.
6. **ntfy** (optional, free). Install the app, subscribe to a long random topic, and set `NTFY_TOPIC_URL`.
7. **Airtable.**
   - Create a token with record write access to the base; set `AIRTABLE_TOKEN` and `AIRTABLE_BASE_ID`.
   - Add "Website" as a Source option in Buyers.
   - Keep website leads in a base that won't hit the free plan's 1,000-record limit.
8. **Google Sheets backup.** Make a sheet, paste `docs/integrations/google-sheets-backup.gs` into Extensions > Apps Script, deploy it as a web app, and add its URL, including `?secret=`, to `LEAD_WEBHOOK_URL`.
9. **Answer the TO CONFIRM list** (Section 13), and have Claude Code flip the flags you'll stand behind.
10. **Photos and video.** Book the photographer with the shot list in 3.8; add the files.
11. **Logo.** When yours is finished, save it as `public/brand/logo.svg`.
12. **Lawyer review:** the disclosure, privacy policy, terms, seller texts and emails, the purchase and assignment contracts, and the buyers-list process.
13. **Test it.** Submit a seller lead, a buyer sign-up and an opt-out on the live domain. Confirm each one arrives everywhere it should, then delete them.

**At launch**

14. **Google Business Profile.** Set it up as a service-area business under the real business name only (no keywords), with the same phone number and website. Add photos of yourself.
15. **Search consoles.** Verify Google Search Console with `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` and submit the sitemap. Import the site into Bing Webmaster Tools.
16. **Analytics.** Set the GTM or GA4 ID. Mark `generate_lead`, `phone_click` and `sms_click` as key events.
17. **Consistent listings.** Bing Places, Apple Business Connect, a Facebook page and YellowPages.ca, each with the identical name, phone number and website.
18. **Letters and door hangers.** Add campaign codes (4.8), run `npm run qr` once the domain is live, and print the `/go/` link and QR code on each piece.

**After launch**

19. Ask every seller you deal with, whether they sell to you or not, for an honest Google review. Ask everyone the same way, and never offer anything in return.
20. **When you get Quo,** set the `QUO_*` variables. Turn on `SELLER_ACK_SMS` if you want sellers to get a confirmation text.
21. **When you change CRM,** ask Claude Code to add a sink for it (4.3) and switch the environment variables.
22. **When you start buying a new property type,** flip its `show` flag and add its page (5.7).
23. **Monthly:** check Search Console queries, leads by source and campaign, and calculator use. Write the next guide from real seller questions.

---

## 15. Running costs

This covers the website only. Quo and a new CRM are excluded, as Kane asked; he's treating them as separate costs for when he scales. Prices are as of September 2026; check them before buying.

| Item | Per month | Notes |
|---|---|---|
| Vercel Pro | US$20 (about C$28) | Includes US$20 of usage credit, which a site this size should stay within. Another host that runs Next.js server functions costs about the same. |
| `.ca` domain | About C$2 | Roughly C$20–30 a year |
| Resend | $0 | Free tier: 3,000 emails a month, 100 a day |
| Google Sheets backup, Tag Manager, Analytics, Search Console, Business Profile, Bing | $0 | |
| ntfy push | $0 | |
| Cal.com booking (optional) | $0 | Free plan |
| Cloudflare Turnstile and Microsoft Clarity (optional) | $0 | |
| Mailbox on your domain (optional) | About C$10 | For example Google Workspace; or free forwarding to Gmail |
| **Total** | **About C$30, or C$40 with a mailbox** | Well under the $100 a month cap |

**One-time design investments**

- **Photography:** a half-day session with a local photographer (shot list in 3.8).
- **Intro video:** a phone and a clip-on mic are enough; hire a local videographer if you'd rather.
- **Logo:** finish yours, or have a designer refine the interim mark using these colours and fonts.
- **Illustration** (optional): an illustrator redraws the Aurora Roofline by hand, in the same spirit.
- **Lawyer review** (Section 9).
- **Print:** letters and door hangers in the same colours, type and roofline, each with its own campaign QR code.

End of brief.
