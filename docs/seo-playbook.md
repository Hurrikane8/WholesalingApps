# SEO Playbook

How this site is set up to rank for motivated-seller searches, what's left to do at launch, and how to keep growing organic leads, including how to hand the work to Claude.

---

## 1. What's already built in

### Technical SEO

| Feature | Where |
|---|---|
| Every page pre-rendered as static HTML (fast, fully crawlable) | `next build` output |
| Unique title, meta description and canonical URL on every page | `pageMetadata()` in `src/lib/seo.ts` |
| Titles automatically drop the " \| Brand" suffix when they'd exceed ~65 characters | `src/lib/seo.ts` |
| XML sitemap of every indexable page | `/sitemap.xml` (`src/app/sitemap.ts`) |
| robots.txt that blocks `/api/` and `/thank-you`, and noindexes Vercel preview deployments | `src/app/robots.ts` |
| Structured data (JSON-LD): `LocalBusiness`, `WebSite`, `Service` (per city), `FAQPage`, `BreadcrumbList`, `BlogPosting` | `src/lib/schema.ts` |
| Branded social share images per city, situation and article | `opengraph-image.tsx` routes |
| `/llms.txt` summary for AI assistants and AI search | `src/app/llms.txt/route.ts` |
| Mobile-first layout, sticky call/text/offer bar, accessible forms | components |
| Security headers, no `X-Powered-By` | `next.config.ts` |
| Automated checks: metadata lengths, duplicate titles, broken links, one H1 per page, valid JSON-LD, og:image | `npm test`, `npm run seo:audit` |

### Content architecture (topic clusters)

```
Home  ──  "sell my house fast {market}"
 ├── /get-cash-offer                      conversion page (ads + organic)
 ├── /we-buy-houses                       hub → every city page
 │    └── /we-buy-houses/{city}-{st}      "we buy houses {city}"
 ├── /situations                          hub → every situation page
 │    └── /situations/{slug}              "sell house {situation}"
 ├── /cash-offer-vs-realtor               comparison / decision stage
 ├── /how-it-works                        trust + process
 ├── /blog/{slug}                         informational guides → link to situations & offer
 └── /about, /faq, /contact               trust (E-E-A-T)
```

Every city page links to every situation page and to nearby cities. Situation pages link to related guides, and guides link back to situation pages and the offer page. Keep that web intact when you add pages.

### Keyword map

Each page has one job. Don't create a second page targeting the same primary keyword (that's keyword cannibalization).

| Page | Primary keyword | Supporting keywords |
|---|---|---|
| `/` | sell my house fast Edmonton | sell house for cash Edmonton, cash home buyers Edmonton |
| `/we-buy-houses/edmonton-ab` | we buy houses Edmonton | cash for houses Edmonton |
| `/we-buy-houses/{area}` | we buy houses {area} | sell my house fast {area}, cash home buyers {area} |
| `/get-cash-offer` | cash offer for my house Edmonton | get a cash offer on my home |
| `/situations/sell-condo-townhouse` | sell condo townhouse Edmonton | sell condo with special assessment, high condo fees |
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
| `/blog/cash-offer-vs-listing-net-proceeds` | cash offer vs listing net proceeds | selling costs Alberta |
| `/blog/how-cash-home-buyers-calculate-offers` | how do cash buyers calculate offers | 70% rule, why cash offers are low |
| `/blog/how-to-sell-an-inherited-house` | how to sell an inherited house Alberta | grant of probate, estate taxes |
| `/blog/selling-a-house-as-is` | selling a house as-is Alberta | disclosure, buyer beware |
| `/blog/how-to-spot-a-legitimate-cash-home-buyer` | are cash home buyers legit | we buy houses scams |
| `/blog/what-is-a-real-estate-wholesaler` | what is a real estate wholesaler | assignment of contract Alberta |
| `/blog/how-long-does-it-take-to-sell-a-house-for-cash` | how long to sell a house for cash | cash closing timeline Alberta |

---

## 2. Launch checklist

Do these in order. The first five matter most.

1. **Lock in the name and a business phone number first.** Google Business Profile and directory listings should all show the same name and number from day one; changing them later dilutes local rankings. If you're moving to a Quo number, set it up **before** creating listings, then update `site.phone`. Before committing to "Aurora Home Buyers", run a NUANS name search and check trademarks. Also note that "Aurora" is a city in Ontario (and in Colorado and Illinois), so searches for "Aurora home buyers" can surface results about those places; keep "Edmonton" next to the brand in your profiles and ads.
2. **Get a domain** (a `.ca` signals a Canadian business) and set `NEXT_PUBLIC_SITE_URL`. `npm run build` warns until you do.
3. **Deploy on the domain** (see README). Choose `www.` or the bare domain and redirect the other.
4. **Google Search Console:** add the property, verify with `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION`, then submit `https://yourdomain.ca/sitemap.xml`. Import the site into **Bing Webmaster Tools** from Search Console.
5. **Google Business Profile (the biggest local-ranking lever):**
   - Use your real business name. Adding keywords ("… We Buy Houses Edmonton") breaks Google's guidelines and is a common reason for suspensions.
   - You don't meet sellers at an office, so set it up as a **service-area business** and hide your home address. Virtual offices and mailbox addresses aren't allowed.
   - List your service areas (Edmonton, St. Albert, Sherwood Park, etc.), pick the most accurate category available, and avoid ones that imply you're a licensed agent.
   - Add real photos, and link to the website. Put the profile URL in `site.social.googleBusinessProfile`.
6. **Directory listings (citations):** list the exact same name and phone on Bing Places, Apple Business Connect, Facebook, Yellow Pages (yp.ca) and the BBB. Inconsistent listings dilute local rankings.
7. **Reviews:** ask every seller you work with for a Google review, and reply to every review. Add real, permissioned testimonials to `site.testimonials`.
8. **Real people and photos:** add yourself to `site.team` with a photo in `public/images/team/`. A face and a name are strong trust signals for sellers, and for Google.
9. **Analytics:** set `NEXT_PUBLIC_GTM_ID` (or `NEXT_PUBLIC_GA_ID`). Mark `generate_lead` (sellers) and `buyer_signup` (investors) as key events in GA4. The `/thank-you` page view also works as a Google Ads conversion.
10. **Legal review:** have an Alberta real estate lawyer review `site.disclosure`, `content/legal/*.md`, your purchase and assignment contracts, and how you market deals to your buyers list. RECA regulates "trading in real estate", and marketing a property you only have under contract can raise licensing questions. When you start emailing deals, your email tool must include a mailing address and an unsubscribe link in every message (CASL).

---

## 3. Growing organic leads after launch

### Monthly routine

1. **Search Console → Performance → Pages:** find pages with lots of impressions but a low click-through rate, and rewrite their titles and descriptions to be more compelling.
2. **Search Console → Queries:** find queries where you rank in positions 5–20. Improve the page that ranks for each one: answer the query directly, add a relevant FAQ, and link to it from related pages.
3. **Publish 2–4 new guides** targeting questions sellers actually ask you on the phone.
4. **Refresh one older article:** update facts, add new questions, and set `updated:` in its frontmatter.
5. **Run `npm run seo:audit`** against production and fix anything it flags.

### Content ideas (check the keyword map first to avoid overlap)

- *Special assessments in Alberta condos: what owners should know before selling*
- *How to read condo documents (reserve fund study, minutes, estoppel certificate) before you sell*
- *Selling a house with Poly-B plumbing in Edmonton*
- *What happens if you don't pay property taxes in Edmonton* (verify with the City and a lawyer)
- *Selling a house with a reverse mortgage (CHIP) in Alberta*
- *Selling a home with an unpermitted basement suite*
- *How to sell a house you inherited with siblings*
- Neighbourhood guides for areas you work most (Mill Woods, Clareview, Castle Downs…) — only with genuinely local insight
- Case studies of real deals (with the seller's permission): the situation, the offer math, the timeline. These are unique content that competitors can't copy.

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
