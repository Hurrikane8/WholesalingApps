# SEO playbook

How this site is set up to rank for motivated-seller searches, what's left to do at launch, and how to keep growing organic leads, including how to hand the work to Claude.

---

## 1. What's already built in

### Technical SEO

| Feature | Where |
|---|---|
| Every page pre-rendered as static HTML (fast, fully crawlable) | `next build` output |
| Unique title, meta description and canonical URL on every page | `pageMetadata()` in `src/lib/seo.ts` |
| Titles drop the " \| Aurora Home Buyers" suffix when they'd exceed 65 characters | `src/lib/seo.ts` |
| Nothing is indexed until the site is live on its real domain: robots.txt disallows everything and every page is noindex on `*.vercel.app`, previews and localhost | `src/lib/env.ts` (`isIndexable()`), `src/app/robots.ts` |
| On the real domain, robots.txt allows everything except `/api/`, `/thank-you`, `/hello`, `/go/` and `/styleguide`, and allows AI crawlers | `src/app/robots.ts` |
| XML sitemap of every indexable page, with `lastModified` from guide frontmatter; drafts, `/hello` and `/thank-you` stay out | `src/app/sitemap.ts` |
| Structured data: `LocalBusiness` (founder, cities served, slogan), `Person` (Kane, in full on /about), `WebSite`, `Service` (home, cities, situations, property types), `BlogPosting` (author: Kane), `BreadcrumbList`, and `FAQPage` on /faq only. Never `RealEstateAgent` or anything implying a licence | `src/lib/schema.ts` |
| Social cards on snow with the roofline, per page type; only verified claims ever appear on a card | `src/lib/og.tsx`, `opengraph-image.tsx` routes |
| `/llms.txt` summary for AI assistants and AI search (describes the business; never instructs AI systems) | `src/app/llms.txt/route.ts` |
| Mobile-first layout, sticky call/text/offer bar, accessible forms | components |
| Security headers, no `X-Powered-By` | `next.config.ts` |
| Automated checks: metadata lengths, duplicate titles, broken links, internal-link rules, one H1 per page, valid JSON-LD, og:image, the disclosure on every page, no unverified promise | `npm test`, `npm run seo:audit`, `npm run scan:build` |

### Content architecture (topic clusters)

```
Home  ──  "sell my house Edmonton" (as-is, cash)
 ├── /get-cash-offer                      conversion page (ads, QR codes, organic)
 ├── /what-we-buy                         property-type hub
 │    └── /what-we-buy/{type}             "sell {type} Edmonton" (condo townhouses first)
 ├── /situations                          hub → every situation page
 │    └── /situations/{slug}              "sell house {situation}"
 ├── /we-buy-houses                       hub → every area page
 │    └── /we-buy-houses/{city}-ab        "we buy houses {city}"
 ├── /cash-offer-vs-realtor               comparison + calculator (decision stage)
 ├── /how-it-works                        process, how offers are calculated, what you sign
 ├── /blog/{slug}                         guides by Kane → situations, types and the calculator
 └── /about, /faq, /contact               trust (E-E-A-T)
```

**Internal link rules** (spec 7.7; the content tests enforce the first three):

- Every property type page links at least two situations and one guide.
- Every situation links at least one guide and the property-type hub.
- Every guide links the relevant situation or property type page and the calculator.
- City pages link the hub and the condo townhouse page.
- No published page links to a draft.
- No link farms in the footer: it links the hubs, not every city and situation.

### Keyword map

Each page has one job. Don't create a second page targeting the same primary keyword (that's keyword cannibalization).

| Page | Primary keyword | Supporting keywords |
|---|---|---|
| `/` | sell my house Edmonton (as-is, cash) | sell house for cash Edmonton, cash home buyers Edmonton |
| `/we-buy-houses/edmonton-ab` | we buy houses Edmonton | cash for houses Edmonton |
| `/we-buy-houses/{area}` | we buy houses {area} | sell my house fast {area}, cash home buyers {area} |
| `/get-cash-offer` | cash offer for my house Edmonton | get a cash offer on my home |
| `/how-it-works` | how selling a house for cash works | how cash offers are calculated |
| `/what-we-buy` | homes I buy in Edmonton | types of homes cash buyers buy |
| `/what-we-buy/condo-townhouses` | sell condo townhouse Edmonton | sell condo with special assessment, high condo fees, condo fee arrears |
| `/what-we-buy/half-duplexes` (draft) | sell half duplex Edmonton | sell one side of a duplex, basement suite |
| `/situations/sell-house-facing-foreclosure` | avoid foreclosure Alberta | behind on mortgage payments Edmonton |
| `/situations/sell-inherited-house` | sell inherited house Edmonton | sell estate property, probate house sale Alberta |
| `/situations/sell-house-during-divorce` | sell house during divorce Alberta | separation house sale |
| `/situations/sell-house-fast-relocating` | sell house fast relocating Edmonton | job transfer sell house |
| `/situations/sell-rental-property-with-tenants` | sell rental property with tenants Alberta | tired landlord Edmonton |
| `/situations/sell-house-that-needs-repairs` | sell house as-is Edmonton | sell house with Poly-B, foundation problems |
| `/situations/sell-house-behind-on-property-taxes` | sell house with tax arrears Edmonton | writs, builders' liens |
| `/situations/sell-vacant-house` | sell vacant house Edmonton | sell empty house, out-of-town owner |
| `/situations/sell-fire-damaged-house` | sell fire damaged house Edmonton | water damage, sewer backup, hail damage |
| `/situations/sell-house-when-downsizing` | sell house downsizing Edmonton | parent moving to seniors' housing |
| `/cash-offer-vs-realtor` | cash offer vs realtor Alberta | realtor commission Alberta 7/3 |
| `/investors` | off-market properties Edmonton | wholesale properties Edmonton, investor buyers list |
| `/about` | Aurora Home Buyers (brand) | Kane, Aurora Home Buyers Edmonton |
| `/faq` | selling a house for cash questions | cash home buyer fees, assignment |
| `/blog/cash-offer-vs-listing-net-proceeds` | cash offer vs listing net proceeds | selling costs Alberta |
| `/blog/how-cash-home-buyers-calculate-offers` | how do cash buyers calculate offers | 70% rule, why cash offers are low |
| `/blog/how-to-sell-an-inherited-house` | how to sell an inherited house Alberta | grant of probate, estate taxes |
| `/blog/selling-a-house-as-is` | selling a house as-is Alberta | disclosure, buyer beware |
| `/blog/how-to-spot-a-legitimate-cash-home-buyer` | are cash home buyers legit | we buy houses scams |
| `/blog/what-is-a-real-estate-wholesaler` | what is a real estate wholesaler | assignment of contract Alberta |
| `/blog/how-long-does-it-take-to-sell-a-house-for-cash` | how long to sell a house for cash | cash closing timeline Alberta |
| `/blog/selling-condo-special-assessment-alberta` (draft) | selling a condo with a special assessment Alberta | special levy, who pays special assessment when selling |
| `/blog/condo-documents-alberta` (draft) | condo documents Alberta | estoppel certificate, condo document condition |
| `/blog/selling-house-poly-b-edmonton` (draft) | selling a house with Poly-B Edmonton | Poly-B insurance, replace or sell as-is |

Not indexed, on purpose: `/hello` (for letter and door-hanger recipients), `/thank-you`, `/go/*` (campaign redirects) and `/styleguide`.

### Priorities for a new domain

A new domain won't rank for "sell my house Edmonton" or "we buy houses Edmonton" for a long time; those terms are crowded. Put the effort where a new site can win:

1. **The Google Business Profile.** It's the biggest local-ranking lever, and it works from day one (launch checklist below).
2. **The long tail: property types and situations, condo townhouse problems first.** Specific, answerable searches ("sell condo with special assessment Edmonton", "condo documents Alberta", "sell rental with tenants Alberta") have less competition and more motivated searchers. Publish the condo drafts once Kane has checked their VERIFY notes.
3. **Guides from real seller questions,** each linked to its situation or property type and the calculator.
4. The head terms come last, as the long-tail pages earn links and reviews build up.

---

## 2. Launch checklist

The search-related items from the full launch checklist (spec section 14, copied into the pull request). Do them in this order.

1. **Lock the public phone number first,** before creating any profile or printing anything. Google Business Profile and directory listings should all show the same name and number from day one; changing them later dilutes local rankings. If (780) 836-5156 is a personal cell, choose the business number first (Quo can port an existing number). Before committing to "Aurora Home Buyers", run a NUANS name search and check trademarks. "Aurora" is also a city in Ontario (and elsewhere), so keep "Edmonton" next to the brand in profiles and ads.
2. **Buy the domain:** a short `.ca` with no hyphens (`aurorahomebuyers.ca` if it's free, otherwise add "edmonton" or "yeg"). Add it to the host and set `NEXT_PUBLIC_SITE_URL`. Until then the site stays noindex.
3. **Deploy on the domain.** Choose `www.` or the bare domain and redirect the other.
4. **Google Business Profile.** Set it up as a **service-area business** under the real business name only (no keywords: "… We Buy Houses Edmonton" breaks Google's guidelines and is a common reason for suspensions), with the same phone number and website, hiding the home address. List the service areas, pick the most accurate category (never one that implies a licensed agent), and add real photos of Kane. Put the profile URL in `site.social.googleBusinessProfile`; it then appears in the schema `sameAs` and on `/hello`.
5. **Search consoles.** Verify Google Search Console with `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` and submit `https://yourdomain.ca/sitemap.xml`. Import the site into Bing Webmaster Tools (`NEXT_PUBLIC_BING_SITE_VERIFICATION`).
6. **Analytics.** Set `NEXT_PUBLIC_GTM_ID` (or `NEXT_PUBLIC_GA_ID`). Mark `generate_lead`, `phone_click` and `sms_click` as key events in GA4 (and `buyer_signup` for investors).
7. **Consistent listings.** Bing Places, Apple Business Connect, a Facebook page and YellowPages.ca, each with the identical name, phone number and website.
8. **Letters and door hangers.** Add campaign codes (`src/config/campaigns.ts`), run `npm run qr` once the domain is live, and print the `/go/` link and QR code on each piece. Visits show up in analytics with their campaign.
9. **Reviews, after launch.** Ask every seller you deal with, whether they sell to you or not, for an honest Google review. Ask everyone the same way, and never offer anything in return. Reply to every review. Add real, permissioned testimonials to `site.testimonials`.
10. **Legal review** before launch: the disclosure, privacy policy, terms, seller texts and emails, the contracts and the buyers-list process. RECA regulates "trading in real estate"; never advertise a specific property publicly. CASL applies to every commercial email and text.

## 3. Growing organic leads after launch

### Monthly routine

1. **Search Console → Performance → Pages:** find pages with lots of impressions but a low click-through rate, and rewrite their titles and descriptions to be more compelling.
2. **Search Console → Queries:** find queries where you rank in positions 5–20. Improve the page that ranks for each one: answer the query directly, add a relevant FAQ, and link to it from related pages.
3. **Publish 2–4 new guides** targeting questions sellers actually ask you on the phone.
4. **Refresh one older article:** update facts, add new questions, and set `updated:` in its frontmatter.
5. **Run `npm run seo:audit`** against production and fix anything it flags.

### Content ideas (check the keyword map first to avoid overlap)

- The three drafts in `content/blog/` (special assessments, condo documents, Poly-B): publish them first, after the VERIFY checks
- *What happens if you don't pay property taxes in Edmonton* (verify with the City and a lawyer)
- *Selling a house with a reverse mortgage (CHIP) in Alberta*
- *Selling a home with an unpermitted basement suite*
- *How to sell a house you inherited with siblings*
- Neighbourhood guides for areas you work most (Mill Woods, Clareview, Castle Downs…) — only with genuinely local insight
- Deal notes: real, anonymized deals with the seller's written permission, shown as a ledger (format in `docs/content-playbook.md`). Unique content that competitors can't copy.

### Adding city pages

Add a city only when you actually buy there **and** can write something genuinely local about it. Ten strong city pages beat a hundred thin ones; Google treats mass-produced near-duplicate city pages as doorway pages. Link new cities from the `nearby` lists of neighboring cities.

### Local links

Links from real local organizations move local rankings more than anything you can buy:

- The Edmonton Chamber of Commerce and local business associations
- Sponsoring a local youth team, charity event or neighborhood cleanup
- Referral partners who may link to you: estate lawyers, estate sale companies, property managers, condo management companies, contractors, moving companies
- Local news and podcasts (offer expert commentary on the housing market)
- Avoid paid link schemes and private blog networks; they risk penalties.

---

## 4. Working with Claude on SEO

The repo's `CLAUDE.md` gives Claude the rules for this codebase. Good prompts to start a session with:

- *"Read CLAUDE.md and docs/seo-playbook.md. Here's my Search Console export (attached CSV of queries and pages). Find pages ranking in positions 5–20, improve their titles, descriptions and content for those queries, then run `npm run check` and the SEO audit."*
- *"Add an area page for {community}. Here's what I know about selling there: … Keep the copy unique, add it to the nearby links, and add it as a Target Areas option in Airtable if buyers will want it."*
- *"Write a new seller guide targeting '{keyword}'. Check the keyword map for overlap first, link it from the most relevant situation page, add it to the keyword map, and run the checks."*
- *"Audit production with `BASE_URL=https://www.mydomain.com npm run seo:audit` and fix whatever it finds."*
- *"Here are three real testimonials and a photo of our team. Add them to the site."*

Claude can't see your Search Console or Analytics data unless you export it or connect it, so attach CSV exports when asking for data-driven changes.
