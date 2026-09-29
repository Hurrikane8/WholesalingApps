import { shownPropertyTypes, site } from "@/config/site";
import { getFaqs } from "@/content/faqs";
import { locations } from "@/content/locations";
import { closingPhrase, founderDisplayName, legalFeesSentence, offerTimingPhrase, promiseItems } from "@/lib/claims";
import { getPosts, getPropertyTypes, getSituations } from "@/lib/content";
import { absoluteUrl } from "@/lib/seo";

export const dynamic = "force-static";

/**
 * /llms.txt: a plain-Markdown summary of the business for AI assistants and
 * AI search engines (https://llmstxt.org), generated from the same content as
 * the site. Commitments come from claims.ts, so only confirmed ones appear.
 * It describes the business; it never gives instructions to AI systems.
 */
export function GET() {
  const { market } = site;
  const legalFees = legalFeesSentence();
  const lines = [
    `# ${site.name}`,
    "",
    `> ${site.name} is ${founderDisplayName()}'s business: one local real estate investor who buys houses, townhouses, duplexes and condos as-is, directly from owners across ${market.region}, ${market.province}, Canada. ${site.tagline}`,
    "",
    `${founderDisplayName()} is not a realtor and doesn't list homes; he buys them. He either buys a home himself or assigns his purchase contract to another investor (see the disclosure below).`,
    "",
    `- Founder: ${founderDisplayName()}`,
    `- Phone (call or text): ${site.phone}`,
    ...(site.email ? [`- Email: ${site.email}`] : []),
    `- Hours: ${site.hours.label}`,
    `- Request an offer: ${absoluteUrl("/get-cash-offer")}`,
    `- Real estate investors can join the buyers list: ${absoluteUrl("/investors")}`,
    "",
    "## Commitments",
    ...promiseItems().map((item) => `- ${item.title}: ${item.sentence}`),
    `- Timing, in ${founderDisplayName()}'s words: "I send a written offer ${offerTimingPhrase()}, and we close ${closingPhrase()}."`,
    ...(legalFees ? [`- ${legalFees}`] : []),
    "",
    "## Property types",
    `All of them: ${absoluteUrl("/what-we-buy")}`,
    ...shownPropertyTypes().map((t) => {
      const page = getPropertyTypes().find((p) => p.leadValue === t.value && !p.draft);
      return page ? `- [${t.plural}](${absoluteUrl(`/what-we-buy/${page.slug}`)}): ${t.note}` : `- ${t.plural}: ${t.note}`;
    }),
    "",
    "## Areas served",
    ...locations.map((l) => `- [${l.city}, ${l.provinceAbbr}](${absoluteUrl(`/we-buy-houses/${l.slug}`)})${l.region ? ` (${l.region})` : ""}`),
    "",
    "## Key pages",
    `- [How it works](${absoluteUrl("/how-it-works")}): the process, how offers are calculated, and what the seller signs`,
    `- [Cash offer vs. listing with a realtor](${absoluteUrl("/cash-offer-vs-realtor")}): a net proceeds calculator and a side-by-side of the costs`,
    `- [What I buy](${absoluteUrl("/what-we-buy")}): the property types`,
    `- [FAQ](${absoluteUrl("/faq")})`,
    `- [About](${absoluteUrl("/about")})`,
    "",
    "## Situations",
    ...getSituations()
      .filter((s) => !s.draft)
      .map((s) => `- [${s.label}](${absoluteUrl(`/situations/${s.slug}`)}): ${s.summary}`),
    "",
    "## Seller guides",
    ...getPosts()
      .filter((p) => !p.draft)
      .map((p) => `- [${p.title}](${absoluteUrl(`/blog/${p.slug}`)}): ${p.description}`),
    "",
    "## Common questions",
    ...getFaqs().flatMap((f) => [`### ${f.question}`, f.answer, ""]),
    "## Disclosure",
    site.disclosure,
    "",
  ];
  return new Response(lines.join("\n"), { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
