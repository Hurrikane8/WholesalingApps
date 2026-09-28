/**
 * Build-time checks, printed by next.config.ts during `next build`.
 *
 * placeholderWarnings(): everything Kane still has to confirm (spec 2.5).
 * launchFindings(): what a live, indexable site needs before it takes leads
 * (spec 4.10). On a production build for the real domain, any finding fails
 * the build; everywhere else they're warnings.
 *
 * Relative imports only: next.config.ts loads this file.
 */
import { site, type VerifiedFlag } from "../config/site";
import { isFinalDomain } from "./env";

type Env = Record<string, string | undefined>;

export function placeholderWarnings(): string[] {
  const warnings: string[] = [];
  for (const [flag, on] of Object.entries(site.verified) as [VerifiedFlag, boolean][]) {
    if (!on) warnings.push(`site.verified.${flag} is off (TO CONFIRM); the claim stays hidden`);
  }
  const f = site.founder;
  const empty = (
    [
      ["founder.lastName", f.lastName],
      ["founder.photo", f.photo],
      ["founder.photoAlt", f.photoAlt],
      ["founder.shortBio", f.shortBio],
      ["founder.signature", f.signature],
      ["founder.linkedin", f.linkedin],
      ["founder.video", f.video.src],
    ] as const
  ).filter(([, v]) => !v.trim());
  for (const [field] of empty) warnings.push(`${field} is empty; it won't render`);
  if (!site.responsePromise.duringHours.trim()) warnings.push("responsePromise.duringHours is empty; no reply-time promise is shown");
  if (site.offerStaysOpenDays === null) warnings.push("offerStaysOpenDays is not set; no offer-open promise is shown");
  if (!isFinalDomain(site.url)) warnings.push(`site.url is ${site.url}, not the final domain; set NEXT_PUBLIC_SITE_URL (the site stays out of search until then)`);
  if (site.phone.includes("555")) warnings.push("site.phone is still a 555 placeholder number");
  return warnings;
}

export function hasDurableSellerSink(env: Env = process.env): boolean {
  return Boolean((env.AIRTABLE_TOKEN && env.AIRTABLE_BASE_ID) || env.LEAD_WEBHOOK_URL?.trim());
}

export function hasOwnerAlert(env: Env = process.env): boolean {
  const email = Boolean(env.RESEND_API_KEY && env.LEAD_EMAIL_TO);
  const quo = Boolean(env.QUO_API_KEY && env.QUO_FROM_NUMBER && env.QUO_NOTIFY_TO);
  const ntfy = Boolean(env.NTFY_TOPIC_URL);
  return email || quo || ntfy;
}

/** What must be true before the live site takes leads. Empty means ready. */
export function launchFindings(env: Env = process.env): string[] {
  const findings: string[] = [];
  if (!hasDurableSellerSink(env)) findings.push("No durable seller sink: set AIRTABLE_TOKEN + AIRTABLE_BASE_ID, or LEAD_WEBHOOK_URL.");
  if (!hasOwnerAlert(env)) findings.push("No owner alert: set RESEND_API_KEY + LEAD_EMAIL_TO, the QUO_* variables, or NTFY_TOPIC_URL.");
  if (!env.NEXT_PUBLIC_SITE_URL?.trim().startsWith("https://")) findings.push("NEXT_PUBLIC_SITE_URL must be set to the https:// address of the real domain.");
  return findings;
}
