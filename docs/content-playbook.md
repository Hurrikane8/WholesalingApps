# Content playbook

How to write and add content for the Aurora Home Buyers site, for Kane and for anyone (or any Claude Code session) editing it later. The brief behind it is `docs/aurora-v2-spec.md`; SEO rules and the keyword map are in `docs/seo-playbook.md`.

## 1. Voice

- **First person singular, as Kane,** on everything a seller reads: page copy, forms, commitments, the thank-you page, `/hello`, messages to sellers. "I buy", "my offer", "call me". Use "Aurora Home Buyers" and "we" only in legal and disclosure text. "We close on the date you choose" is fine: that "we" is Kane and the seller.
- **Plain and specific.** Plain verbs, short sentences, sentence case everywhere (titles, headings, buttons), Canadian spelling (neighbourhood, mould, cheque), no exclamation marks. Explain; don't sell. Say something specific and checkable, or say nothing.
- **Honest about listing.** Where it's true, say listing would likely net more. It's one of the three pillars.
- **Alberta, not the US.** Real estate lawyers (not title companies), Land Titles, deposits held in trust, conditions (not contingencies), grants of probate and personal representatives, Court of King's Bench, the principal residence exemption and deemed disposition, CASL for commercial texts and email.
- **Legal, tax and money topics stay general.** Hedge ("usually", "generally", "often"), point to a lawyer, accountant, licensed insolvency trustee or non-profit credit counsellor, and don't cite statutes, deadlines or dollar limits unless they've been checked. In drafts, put `<!-- VERIFY: … -->` above any such statement and link a primary source (for example alberta.ca or open.alberta.ca).
- **No statistic without a linked source.** No invented reviews, testimonials, deal counts, years in business or "most sellers…" claims.

### Banned phrases and patterns

The tests and `npm run scan:build` reject these (the list lives in `tests/banned-phrases.mjs`):

- fair cash offer, fair offer, fair price, hassle, hassle-free, stress-free, seamless, we've helped, I've helped, thousands of homeowners, trusted by, #1, number one, best price, top dollar, guaranteed offer, most often, regularly buy, we've seen it, any situation, our specialty, most common reasons, come to us, often call us;
- first-person track-record claims: "we/I have helped / bought / seen / closed / worked with…", "I buy … regularly / often / every month", "a common / normal / typical purchase".

If a sentence needs one of these to make its point, the point is probably a claim nobody has confirmed. Cut it.

## 2. Promises come only from `src/lib/claims.ts`

Anything about speed, fees or process is a promise, and each promise has a flag in `site.verified` (`src/config/site.ts`). A promise renders only when Kane has confirmed it and flipped its flag to `true`. Production never shows an unconfirmed claim; preview builds show it with a dashed "Unconfirmed" tag.

| Flag | What it unlocks |
|---|---|
| `explainsOfferMath` | "You see the math", "with the math laid out", the home H1 |
| `tellsWhenListingWins` | "I'll tell you when listing wins" |
| `assignmentDisclosedBeforeSigning` | "You'll know who's buying, in writing, before you sign" |
| `showsMarginInWriting` | The profit as its own line on sample offers |
| `noRetrades` | "The price holds" |
| `closeInDays` | "as soon as 7 days, or on the date you choose" |
| `offerWithinHours` | "within 24 hours of seeing the place" |
| `coversLegalFees` | "I pay your standard legal fees." |

**In Markdown,** never type a number of days or hours, or "legal fees covered". Use the placeholders, and write the sentence so it reads well with either version:

- `{{closingPhrase}}`: "as soon as 7 days, or on the date you choose" / "on the date you choose". Example: "We close {{closingPhrase}}."
- `{{offerTimingPhrase}}`: "within 24 hours of seeing the place" / "after I see the place". Example: "I send a written offer {{offerTimingPhrase}}."
- `{{legalFeesSentence}}`: "I pay your standard legal fees." / nothing. Put it at the end of a paragraph.

Other placeholders: `{{company}} {{legalName}} {{market}} {{region}} {{province}} {{phone}} {{email}} {{siteUrl}} {{disclosure}}`. The old `{{closeDays}}` and `{{offerHours}}` fail the build.

**In code,** import the phrase from `claims.ts` (`closingPhrase()`, `offerTimingPhrase()`, `offerMathClause()`, `legalFeesSentence()`, `promiseItems()`…) and tag preview-only claims with `<Unconfirmed show={isUnconfirmed(flag)} />`.

**Things that are not promises until Kane says so:** a free clean-out, taking furniture, paying condo document fees, "close in a week", reply times. Say "what stays in the house is agreed in the contract" instead.

## 3. Adding content

Run `npm run check` after every change, and `npm run build && npm run scan:build` before you commit.

### A property type (`/what-we-buy/{slug}`)

1. Check the type is in `site.propertyTypes` (`src/config/site.ts`) with `show: true`. Its `value` must be one of `PROPERTY_TYPES` in `src/lib/lead-options.ts`; never change those values, they're Airtable choices.
2. Copy `content/property-types/condo-townhouses.md` to `content/property-types/{slug}.md` and fill in the frontmatter:
   - `title` (65 characters or fewer), `description` (110–160), `h1`, `label`, `summary`;
   - `leadValue`: the `PROPERTY_TYPES` value (it preselects the form);
   - `order`, `featured`;
   - `question` and `answer` (40–60 words): the straight answer at the top;
   - `sample`: `house` or `condo`;
   - `related`: situation slugs;
   - at least three `faqs`;
   - `draft: true` until Kane approves it.
3. Write the body: why this type can be slow to sell, when a direct sale fits, how Kane handles its particular issues, what happens next. End with the general-information line.
4. Add a row to the keyword map in `docs/seo-playbook.md`.

The page, the hub link, the sitemap entry (once it isn't a draft) and the links from every list of property types happen automatically.

### A city (`/we-buy-houses/{slug}`)

Add an entry to `src/content/locations.ts`: `slug` ("city-ab"), `city`, `provinceAbbr`, a unique `intro` about the local housing stock and what sellers there face, two to four unique `localDetails`, `nearby` slugs and `geo`. Set `region` only if the community is part of another municipality (Sherwood Park is in Strathcona County; St. Albert is not part of Sturgeon County). Never say how often Kane buys there. The tests reject duplicate copy, so don't clone another city's text. Add the row to the keyword map.

### A guide (`/blog/{slug}`)

Create `content/blog/{slug}.md` with `title` (≤ 65), `description` (110–160), `date` (the day it's first committed, `YYYY-MM-DD`), `category` (sentence case; reuse an existing one), and optionally `question` + `answer` (40–60 words) and `updated` for a substantial revision. `author` defaults to Kane. Start as `draft: true`. End with a short call to action that links the relevant situation or property-type page and the calculator (`/cash-offer-vs-realtor#calculator`). Internal links must point at real routes; the tests check.

### A situation (`/situations/{slug}`)

Create `content/situations/{slug}.md` with `title`, `description`, `h1`, `label`, `summary`, `icon`, `reason` (one of `REASONS` in `src/lib/lead-options.ts`), `order`, `question` and `answer` (40–60 words; never claim more than the body does), `guides` (guide slugs), and `faqs`.

### A FAQ

General questions live in `src/content/faqs.ts`, in four groups: "Offers and money", "The process", "Situations and property types" and "About me". Build any promise from `claims.ts` and set `unconfirmed: isUnconfirmed(flag)` so previews tag it. Questions must be unique. FAQPage structured data is emitted on `/faq` only.

## 4. Drafts and previews

- `draft: true` in any collection keeps a page out of production and out of the sitemap. In a preview build it renders with a "Draft" banner.
- `npm run build:preview` (or a Vercel preview deploy with `NEXT_PUBLIC_PREVIEW_UNCONFIRMED=true`) shows drafts and unconfirmed claims, each tagged. Take design screenshots there, then check a production build (`npm run build && npm run scan:build`) to be sure every layout still looks finished with them hidden.
- To publish: remove the VERIFY notes after checking them, set `draft: false`, and run the checks.

## 5. Opt-outs (CASL)

Opt-out requests arrive by email alert and in the opt-out table (see `docs/integrations/README.md`). Act on each one promptly: remove the address from mailing and door-hanger lists and the number from text lists. CASL allows up to 10 business days; sooner is better. Keep the record so the address isn't contacted again.

## 6. Future: deal notes (described, not built)

Real, anonymized deals, published only with the seller's written permission, each shown as a ledger like the sample offers: after-repair value, repairs, costs, profit if itemized, and the offer, with the neighbourhood (not the address), the property type and a sentence about the situation. Rules when it's built:

- written permission from the seller for each note, kept on file;
- no address, names, photos of identifiable homes or dates that identify the seller;
- the numbers are the real written offer's numbers, not rounded to flatter;
- never a property that's for sale (RECA: no public advertising of specific properties);
- a new `content/deals/` collection with its own tests (the ledger must add up), and `Review`/`aggregateRating` schema still omitted.
