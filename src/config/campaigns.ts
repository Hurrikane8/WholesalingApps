/**
 * Campaign links for letters and door hangers (spec 4.8).
 *
 * Each entry becomes a short link, {site}/go/{code}, that redirects to `to`
 * with the UTM parameters added, so every lead shows which run it came from.
 * `npm run qr` writes a printable QR code for each one to public/qr/{code}.svg
 * (it refuses to run until NEXT_PUBLIC_SITE_URL is the real domain).
 *
 * Codes: lowercase letters and digits, 2–12 characters, unique (tests check).
 * Changing a printed code breaks the letters already out there; add a new one instead.
 *
 * No imports here: next.config.ts and scripts/qr.mjs load this file directly.
 */
export type Campaign = {
  code: string;
  /** What the run was, for your own records. */
  label: string;
  /** Where the link lands, usually "/hello". */
  to: string;
  utm: { source: string; medium: string; campaign: string; content?: string };
};

export const campaigns: Campaign[] = [
  // { code: "l1", label: "October 2026 letter, Mill Woods townhouses", to: "/hello", utm: { source: "letter", medium: "direct_mail", campaign: "2026-10-letter" } },
  // { code: "dh1", label: "October 2026 door hanger", to: "/hello", utm: { source: "door_hanger", medium: "door_hanger", campaign: "2026-10-door-hanger" } },
];

export const CAMPAIGN_CODE = /^[a-z0-9]{2,12}$/;

/** Problems with a campaign list: bad or duplicate codes, a destination that isn't a site path. Empty means fine. */
export function campaignProblems(list: Campaign[] = campaigns): string[] {
  const problems: string[] = [];
  const seen = new Set<string>();
  for (const c of list) {
    if (!CAMPAIGN_CODE.test(c.code)) problems.push(`"${c.code}": codes are 2–12 lowercase letters and digits`);
    if (seen.has(c.code)) problems.push(`"${c.code}" is used twice`);
    seen.add(c.code);
    if (!c.to.startsWith("/") || c.to.startsWith("//")) problems.push(`"${c.code}": "to" must be a path on this site, like "/hello"`);
    if (!c.utm.source || !c.utm.medium || !c.utm.campaign) problems.push(`"${c.code}": utm needs a source, medium and campaign`);
  }
  return problems;
}

/** "/hello?utm_source=letter&utm_medium=direct_mail&utm_campaign=2026-10-letter" */
export function campaignDestination(c: Campaign): string {
  const params = new URLSearchParams({ utm_source: c.utm.source, utm_medium: c.utm.medium, utm_campaign: c.utm.campaign });
  if (c.utm.content) params.set("utm_content", c.utm.content);
  return `${c.to}${c.to.includes("?") ? "&" : "?"}${params.toString()}`;
}

/** next.config.ts redirects: /go/{code} → the destination, temporary so a code can be repointed. */
export function campaignRedirects(list: Campaign[] = campaigns) {
  return list.map((c) => ({ source: `/go/${c.code}`, destination: campaignDestination(c), permanent: false }));
}
