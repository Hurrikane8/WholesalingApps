import { site } from "@/config/site";
import { faqs } from "@/content/faqs";
import { locations } from "@/content/locations";
import { getPosts, getSituations } from "@/lib/content";
import { absoluteUrl } from "@/lib/seo";

export const dynamic = "force-static";

/**
 * /llms.txt: a plain-Markdown summary of the business for AI assistants and
 * AI search engines (https://llmstxt.org). Generated from the same content as
 * the site, so it never goes stale.
 */
export function GET() {
  const { market, promises } = site;
  const lines = [
    `# ${site.name}`,
    "",
    `> ${site.name} is a local real estate investment company that buys houses directly from homeowners for cash in ${market.region}, ${market.state}. We buy in any condition and any situation, with no repairs, no agent commissions${promises.paysClosingCosts ? ", and seller closing costs paid" : ""}. Closings can happen in as little as ${promises.closeInDays} days or on the seller's chosen date.`,
    "",
    `- Phone: ${site.phone}`,
    `- Email: ${site.email}`,
    `- Hours: ${site.hours.label}`,
    `- Request a cash offer: ${absoluteUrl("/get-cash-offer")}`,
    `- Disclosure: ${site.disclosure}`,
    "",
    "## Key pages",
    `- [How it works](${absoluteUrl("/how-it-works")}): the process and how offers are calculated`,
    `- [Cash offer vs. listing with a realtor](${absoluteUrl("/cash-offer-vs-realtor")}): side-by-side costs with a worked example`,
    `- [FAQ](${absoluteUrl("/faq")})`,
    `- [About](${absoluteUrl("/about")})`,
    "",
    "## Areas served",
    ...locations.map((l) => `- [We buy houses in ${l.city}, ${l.stateAbbr}](${absoluteUrl(`/we-buy-houses/${l.slug}`)}) (${l.county} County)`),
    "",
    "## Situations",
    ...getSituations().map((s) => `- [${s.label}](${absoluteUrl(`/situations/${s.slug}`)}): ${s.summary}`),
    "",
    "## Seller guides",
    ...getPosts().map((p) => `- [${p.title}](${absoluteUrl(`/blog/${p.slug}`)}): ${p.description}`),
    "",
    "## Common questions",
    ...faqs.flatMap((f) => [`### ${f.question}`, f.answer, ""]),
  ];
  return new Response(lines.join("\n"), { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
